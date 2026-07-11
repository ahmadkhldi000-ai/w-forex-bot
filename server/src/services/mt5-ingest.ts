// ====================================================================
//  W-FOREX-BOT · MT5 INGEST SERVICE
//  ------------------------------------------------------------------
//  Receives the Web Connector (MT5 EA) event envelope:
//
//      { "event": "trade_open" | "trade_modify" | "trade_close"
//               | "account" | "full_sync" | "connection",
//        "time":  "...",
//        "data":  { ... } }
//
//  and:
//    • persists Accounts (MT5Account), Trades, and Performance snapshots
//      to PostgreSQL via Prisma,
//    • writes a ConnectorLog row per cycle,
//    • fire-and-forget broadcasts the normalized event to dashboard
//      clients over the existing Socket.io bus (mt5:event).
//
//  Account data shapes (from the EA):
//    { accountNumber, broker, server, balance, equity, margin,
//      drawdown, drawdownPct, currency, leverage, symbol, time }
//
//  Open trade shapes:
//    { ticket, symbol, side, lot, entryPrice, currentPrice,
//      sl, tp, profit, openTime, magic }
//
//  Closed trade shapes:
//    { ticket, symbol, side, entryPrice, exitPrice, profit,
//      entryTime, exitTime, durationSec, magic }
// ====================================================================
import { prisma } from "@/config/db.js";
import { getIO } from "@/services/mt5-socket.js";
import type { ConnectorLogLevel } from "@prisma/client";

// --------------------------------------------------------------------
//  TYPES (loose; the EA is the source of truth)
// --------------------------------------------------------------------
export interface ConnectorAccount {
  accountNumber?: number | string;
  broker?: string;
  server?: string;
  balance?: number;
  equity?: number;
  margin?: number;
  drawdown?: number;
  drawdownPct?: number;
  currency?: string;
  leverage?: number;
  symbol?: string;
  time?: string;
}

export interface ConnectorOpenTrade {
  ticket: number | string;
  symbol?: string;
  side?: string; // "BUY" | "SELL"
  lot?: number;
  entryPrice?: number;
  currentPrice?: number;
  sl?: number;
  tp?: number;
  profit?: number;
  openTime?: string;
  magic?: number | string;
}

export interface ConnectorClosedTrade {
  ticket: number | string;
  symbol?: string;
  side?: string;
  entryPrice?: number;
  exitPrice?: number;
  profit?: number;
  entryTime?: string;
  exitTime?: string;
  durationSec?: number;
  magic?: number | string;
}

export interface ConnectorEnvelope {
  event: string;
  time?: string;
  data: Record<string, unknown>;
}

// --------------------------------------------------------------------
//  SMALL HELPERS
// --------------------------------------------------------------------
const num = (v: unknown, def = 0): number =>
  typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) || def : def;

// nullable number: returns null when the value is absent/invalid (for optional Float? fields)
const numOrNull = (v: unknown): number | null => {
  if (v === undefined || v === null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isNaN(n) ? null : n;
};

const str = (v: unknown, def = ""): string =>
  v === undefined || v === null ? def : String(v);

// nullable string for optional String? fields
const strOrNull = (v: unknown): string | null => {
  if (v === undefined || v === null || v === "") return null;
  return String(v);
};

const toBig = (v: number | string): bigint => {
  try {
    return BigInt(Math.trunc(Number(v)));
  } catch {
    return 0n;
  }
};

const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(str(v));
  return isNaN(d.getTime()) ? null : d;
};

// --------------------------------------------------------------------
//  ACCOUNT RESOLUTION
//  Find-or-create the MT5Account row by login. The EA doesn't know our
//  internal id, so we key on the MT5 login + server.
// --------------------------------------------------------------------
async function resolveAccount(
  acct: ConnectorAccount,
  apiKeyAccountId: string | null
): Promise<string | null> {
  const login = str(acct.accountNumber);
  if (!login) return apiKeyAccountId ?? null;

  // try by login first
  let row = await prisma.mT5Account.findFirst({
    where: { login },
    select: { id: true },
  });

  if (!row) {
    // bootstrap-create a minimal account row (admin can enrich later)
    row = await prisma.mT5Account.create({
      data: {
        label: `Account ${login}`,
        login,
        passwordEnc: "", // no broker creds; connector-driven account
        broker: strOrNull(acct.broker),
        serverRaw: strOrNull(acct.server),
        currency: str(acct.currency, "USD"),
        leverage: num(acct.leverage, 100),
        balance: num(acct.balance),
        equity: num(acct.equity),
        isActiveConn: true,
        lastConnectedAt: new Date(),
      },
      select: { id: true },
    });
  }

  return row.id;
}

// --------------------------------------------------------------------
//  PERSIST ACCOUNT SNAPSHOT
//  Updates the live fields on MT5Account + writes a Performance row.
// --------------------------------------------------------------------
async function persistAccount(
  accountId: string,
  acct: ConnectorAccount
): Promise<void> {
  await prisma.mT5Account.update({
    where: { id: accountId },
    data: {
      broker: strOrNull(acct.broker),
      serverRaw: strOrNull(acct.server),
      currency: str(acct.currency, "USD"),
      leverage: num(acct.leverage, 100),
      balance: num(acct.balance),
      equity: num(acct.equity),
      margin: num(acct.margin),
      drawdown: num(acct.drawdown),
      drawdownPct: num(acct.drawdownPct),
      isActiveConn: true,
      lastConnectedAt: new Date(),
      lastError: null,
    },
  });

  await prisma.performance.create({
    data: {
      mt5AccountId: accountId,
      balance: num(acct.balance),
      equity: num(acct.equity),
      margin: num(acct.margin),
      drawdown: num(acct.drawdown),
      drawdownPct: num(acct.drawdownPct),
      snapshotTime: toDate(acct.time) ?? new Date(),
    },
  });
}

// --------------------------------------------------------------------
//  PERSIST OPEN / MODIFIED TRADE
//  Upsert by mt5Ticket + mt5Login. The trade_open event uses the
//  position ticket; we store it as mt5Ticket.
// --------------------------------------------------------------------
async function persistOpenTrade(
  accountId: string,
  login: string,
  t: ConnectorOpenTrade,
  status: "OPEN" | "MODIFIED" = "OPEN"
): Promise<void> {
  const ticket = toBig(t.ticket);
  const openTime = toDate(t.openTime) ?? new Date();
  const side = str(t.side).toUpperCase() === "SELL" ? "SELL" : "BUY";

  await prisma.trade.upsert({
    where: { mt5Ticket: ticket },
    create: {
      mt5Ticket: ticket,
      mt5Login: login,
      symbol: str(t.symbol),
      type: side as "BUY" | "SELL",
      volume: num(t.lot),
      openPrice: num(t.entryPrice),
      closePrice: null,
      sl: numOrNull(t.sl),
      tp: numOrNull(t.tp),
      profit: num(t.profit),
      netProfit: num(t.profit),
      status: "OPEN",
      openTime,
    },
    update: status === "OPEN"
      ? {
          symbol: str(t.symbol),
          type: side as "BUY" | "SELL",
          volume: num(t.lot),
          openPrice: num(t.entryPrice),
          sl: numOrNull(t.sl),
          tp: numOrNull(t.tp),
          profit: num(t.profit),
          netProfit: num(t.profit),
        }
      : {
          sl: numOrNull(t.sl),
          tp: numOrNull(t.tp),
          profit: num(t.profit),
          netProfit: num(t.profit),
          closePrice: numOrNull(t.currentPrice),
        },
  });
}

// --------------------------------------------------------------------
//  PERSIST CLOSED TRADE
//  The EA's trade_close uses the *deal* ticket, which differs from the
//  position ticket we stored on open. We match by symbol + entryTime +
//  open price when the exact ticket isn't found.
// --------------------------------------------------------------------
async function persistClosedTrade(
  login: string,
  t: ConnectorClosedTrade
): Promise<void> {
  const dealTicket = toBig(t.ticket);
  const exitTime = toDate(t.exitTime) ?? new Date();
  const entryTime = toDate(t.entryTime);
  const profit = num(t.profit);

  // 1) try exact deal ticket
  let trade = await prisma.trade.findUnique({
    where: { mt5Ticket: dealTicket },
    select: { id: true },
  });

  // 2) fallback: match the most recent OPEN trade on this symbol/login
  if (!trade && t.symbol && entryTime) {
    const entryPx = numOrNull(t.entryPrice);
    trade = await prisma.trade.findFirst({
      where: {
        symbol: str(t.symbol),
        mt5Login: login,
        status: "OPEN",
        ...(entryPx ? { openPrice: entryPx } : {}),
      },
      orderBy: { openTime: "desc" },
      select: { id: true },
    });
  }

  if (!trade) {
    // no matching open trade — record it as a fresh closed trade
    await prisma.trade.create({
      data: {
        mt5Ticket: dealTicket,
        mt5Login: login,
        symbol: str(t.symbol),
        type: str(t.side).toUpperCase() === "SELL" ? "SELL" : "BUY",
        volume: 0,
        openPrice: num(t.entryPrice),
        closePrice: num(t.exitPrice),
        profit,
        netProfit: profit,
        status: "CLOSED",
        openTime: entryTime ?? exitTime,
        closeTime: exitTime,
      },
    });
    return;
  }

  await prisma.trade.update({
    where: { id: trade.id },
    data: {
      closePrice: num(t.exitPrice),
      profit,
      netProfit: profit,
      status: "CLOSED",
      closeTime: exitTime,
    },
  });
}

// --------------------------------------------------------------------
//  SOCKET.IO BROADCAST (fire-and-forget)
// --------------------------------------------------------------------
function broadcast(event: string, payload: unknown): void {
  const io = getIO();
  io?.to("clients").emit("mt5:event", { type: event, time: new Date().toISOString(), payload });
}

// --------------------------------------------------------------------
//  CONNECTOR LOG WRITER (never throws)
// --------------------------------------------------------------------
async function writeLog(
  level: ConnectorLogLevel,
  event: string,
  message: string,
  accountId: string | null,
  ip?: string
): Promise<void> {
  try {
    await prisma.connectorLog.create({
      data: {
        level,
        event,
        message,
        source: "web_connector",
        mt5AccountId: accountId ?? undefined,
        ipAddress: ip,
      },
    });
  } catch {
    /* never break the ingest on a log failure */
  }
}

// ====================================================================
//  MAIN ENTRY POINT
// ====================================================================
export interface IngestResult {
  ok: boolean;
  event: string;
  accountId: string | null;
  error?: string;
}

export async function ingestEnvelope(
  env: ConnectorEnvelope,
  ctx: { apiKeyAccountId: string | null; ip?: string }
): Promise<IngestResult> {
  const { event } = env;
  const data = (env.data ?? {}) as Record<string, unknown>;
  const ip = ctx.ip;

  try {
    // ---- connection lifecycle ---------------------------------------
    if (event === "connection") {
      const status = str(data.status);
      await writeLog("INFO", "connection", `EA ${status}`, null, ip);
      broadcast("connection", data);
      return { ok: true, event, accountId: null };
    }

    // ---- extract account block (account / full_sync have it inline) -
    const acctBlock = (data.account ?? data) as ConnectorAccount;
    const accountId = await resolveAccount(acctBlock, ctx.apiKeyAccountId);
    const login = str(acctBlock.accountNumber);

    if (!accountId) {
      await writeLog("WARN", event, "no account number in payload", null, ip);
      broadcast(event, data);
      return { ok: true, event, accountId: null };
    }

    // ---- account / full_sync ----------------------------------------
    if (event === "account" || event === "full_sync") {
      await persistAccount(accountId, acctBlock);

      // full_sync carries an array of open trades
      if (event === "full_sync" && Array.isArray(data.openTrades)) {
        const trades = data.openTrades as ConnectorOpenTrade[];
        for (const t of trades) {
          await persistOpenTrade(accountId, login, t, "OPEN");
        }
        await writeLog("INFO", "full_sync",
          `account + ${trades.length} open trades`, accountId, ip);
      } else {
        await writeLog("INFO", "account", "snapshot", accountId, ip);
      }

      broadcast(event, data);
      return { ok: true, event, accountId };
    }

    // ---- trade events -----------------------------------------------
    if (event === "trade_open") {
      const t = data.trade as ConnectorOpenTrade | undefined;
      if (!t) return { ok: false, event, accountId, error: "missing trade block" };
      await persistOpenTrade(accountId, login, t, "OPEN");
      await writeLog("INFO", "trade_open",
        `${t.side} ${t.symbol} lot=${t.lot}`, accountId, ip);
      broadcast("trade_open", data);
      return { ok: true, event, accountId };
    }

    if (event === "trade_modify") {
      const t = data.trade as ConnectorOpenTrade | undefined;
      if (!t) return { ok: false, event, accountId, error: "missing trade block" };
      await persistOpenTrade(accountId, login, t, "MODIFIED");
      await writeLog("INFO", "trade_modify",
        `SL=${t.sl} TP=${t.tp} profit=${t.profit}`, accountId, ip);
      broadcast("trade_modify", data);
      return { ok: true, event, accountId };
    }

    if (event === "trade_close") {
      const t = data.trade as ConnectorClosedTrade | undefined;
      if (!t) return { ok: false, event, accountId, error: "missing trade block" };
      await persistClosedTrade(login, t);
      await writeLog("INFO", "trade_close",
        `${t.side} ${t.symbol} profit=${t.profit}`, accountId, ip);
      broadcast("trade_close", data);
      return { ok: true, event, accountId };
    }

    // ---- unknown event ----------------------------------------------
    await writeLog("WARN", event, "unknown event type", accountId, ip);
    return { ok: false, event, accountId, error: "unknown event" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "ingest failure";
    await writeLog("ERROR", event, message, null, ip);
    console.error(`[mt5-ingest] ${event} failed:`, err);
    return { ok: false, event, accountId: null, error: message };
  }
}
