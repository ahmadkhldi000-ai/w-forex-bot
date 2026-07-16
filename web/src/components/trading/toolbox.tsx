"use client";

import { useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Wallet,
  Calculator,
  TrendingUp,
  TrendingDown,
  Clock,
  Bell,
  ScrollText,
  Mail,
  Newspaper,
  Info,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import {
  type Trade,
  type AccountSnapshot,
  type ConnectionStatus,
} from "@/lib/trading/types";
import { getSpec, fmtPrice } from "@/lib/trading/instruments";
import { cn, formatMoney } from "@/lib/utils";

/* ====================================================================
   Toolbox — the MetaTrader 5 bottom "Toolbox" panel.

   Tabs (left → right, exactly like MT5):
     Trading | History | Exposure | News | Mail | Alerts | Journal | Experts

   The footer status bar shows account equity + connection latency,
   matching the MT5 status bar.
   ==================================================================== */

type TabId = "trading" | "history" | "exposure" | "news" | "mail" | "alerts" | "journal" | "experts";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "trading", label: "Trading", icon: Activity },
  { id: "history", label: "History", icon: Clock },
  { id: "exposure", label: "Exposure", icon: Wallet },
  { id: "news", label: "News", icon: Newspaper },
  { id: "mail", label: "Mail", icon: Mail },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "journal", label: "Journal", icon: ScrollText },
  { id: "experts", label: "Experts", icon: Info },
];

export function Toolbox({
  openTrades,
  closedTrades,
  account,
  connection,
}: {
  openTrades: Trade[];
  closedTrades: Trade[];
  account: AccountSnapshot | null;
  connection: ConnectionStatus;
}) {
  const [tab, setTab] = useState<TabId>("trading");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--bg-elev)]/40">
      {/* ---------- tab strip ---------- */}
      <div className="flex items-center gap-0 border-b border-[var(--border)] bg-[var(--bg-elev)]/70 px-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const badge =
            t.id === "trading" && openTrades.length > 0
              ? openTrades.length
              : t.id === "mail"
                ? 3
                : 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex items-center gap-1.5 border-b-2 px-3 py-2 text-[11px] font-semibold transition-smooth",
                active
                  ? "border-[var(--accent)] text-[var(--accent-bright)]"
                  : "border-transparent text-[var(--fg-dim)] hover:text-[var(--fg-muted)]"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
              {badge > 0 && (
                <span
                  className={cn(
                    "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold",
                    active
                      ? "bg-[var(--accent)] text-[var(--bg)]"
                      : "bg-[var(--bg-hover)] text-[var(--fg-muted)]"
                  )}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {/* ---- right-side quick account stats ---- */}
        {account && (
          <div className="ms-auto hidden items-center gap-4 px-3 lg:flex">
            <AccountPill icon={Wallet} label="Balance" value={formatMoney(account.balance, 2)} />
            <AccountPill
              icon={Calculator}
              label="Equity"
              value={formatMoney(account.equity, 2)}
            />
            <AccountPill
              icon={TrendingUp}
              label="Margin"
              value={`${account.marginLevel.toFixed(0)}%`}
              tone={account.marginLevel < 150 ? "danger" : "neutral"}
            />
            <AccountPill
              icon={account.floatingPnl >= 0 ? TrendingUp : TrendingDown}
              label="Floating"
              value={formatMoney(account.floatingPnl, 2)}
              tone={account.floatingPnl >= 0 ? "success" : "danger"}
            />
          </div>
        )}
      </div>

      {/* ---------- panel body ---------- */}
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "trading" && <TradingTab trades={openTrades} />}
        {tab === "history" && <HistoryTab trades={closedTrades} />}
        {tab === "exposure" && <ExposureTab trades={openTrades} />}
        {tab === "news" && <NewsTab />}
        {tab === "mail" && <MailTab />}
        {tab === "alerts" && <AlertsTab />}
        {tab === "journal" && <JournalTab connection={connection} />}
        {tab === "experts" && <ExpertsTab trades={openTrades} />}
      </div>

      {/* ---------- status bar ---------- */}
      <StatusBar connection={connection} account={account} openCount={openTrades.length} />
    </div>
  );
}

/* ====================================================================
   Tab: Trading — open positions, MT5 grid
   ==================================================================== */
function TradingTab({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) return <EmptyState icon={Activity} label="No open positions" />;
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead className="sticky top-0 bg-[var(--bg-elev)]/95 backdrop-blur">
        <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">
          <Th>Symbol</Th>
          <Th>Type</Th>
          <Th>Volume</Th>
          <Th>Price Open</Th>
          <Th>S / L</Th>
          <Th>T / P</Th>
          <Th>Time</Th>
          <Th>P/L</Th>
        </tr>
      </thead>
      <tbody>
        {trades.map((t) => {
          const spec = getSpec(t.symbol);
          const isBuy = t.type === "BUY";
          const win = (t.profit ?? 0) >= 0;
          return (
            <tr
              key={t.id}
              className="border-b border-[var(--border)]/40 transition-smooth hover:bg-[var(--bg-hover)]/50"
            >
              <Td>
                <span className="font-mono-nums font-semibold text-[var(--fg)]">{t.symbol}</span>
              </Td>
              <Td>
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                    isBuy
                      ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
                      : "bg-[var(--danger)]/15 text-[var(--danger)]"
                  )}
                >
                  {isBuy ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                  {t.type}
                </span>
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg-muted)]">
                {t.volume.toFixed(2)}
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg)]">
                {fmtPrice(t.entryPrice, t.symbol)}
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg-muted)]">
                {t.stopLoss ? fmtPrice(t.stopLoss, t.symbol) : "—"}
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg-muted)]">
                {t.takeProfit ? fmtPrice(t.takeProfit, t.symbol) : "—"}
              </Td>
              <Td className="text-[var(--fg-dim)]">
                {new Date(t.openTime).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Td>
              <Td>
                <span
                  className={cn(
                    "font-mono-nums font-semibold tabular-nums",
                    win ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                  )}
                >
                  {win ? "+" : ""}
                  {formatMoney(t.profit ?? 0, 2)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ====================================================================
   Tab: History — closed deals grid
   ==================================================================== */
function HistoryTab({ trades }: { trades: Trade[] }) {
  if (trades.length === 0)
    return <EmptyState icon={Clock} label="No deal history yet" />;
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead className="sticky top-0 bg-[var(--bg-elev)]/95 backdrop-blur">
        <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">
          <Th>Time</Th>
          <Th>Deal</Th>
          <Th>Symbol</Th>
          <Th>Type</Th>
          <Th>Volume</Th>
          <Th>Price</Th>
          <Th>Reason</Th>
          <Th>P/L</Th>
        </tr>
      </thead>
      <tbody>
        {trades.slice(0, 60).map((t, i) => {
          const isBuy = t.type === "BUY";
          const win = (t.profit ?? 0) >= 0;
          return (
            <tr
              key={t.id}
              className="border-b border-[var(--border)]/40 transition-smooth hover:bg-[var(--bg-hover)]/50"
            >
              <Td className="text-[var(--fg-dim)]">
                {new Date(t.closeTime ?? t.openTime).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Td>
              <Td className="text-[var(--fg-dim)]">{t.ticket}</Td>
              <Td>
                <span className="font-mono-nums font-semibold text-[var(--fg)]">{t.symbol}</span>
              </Td>
              <Td>
                <span className="flex items-center gap-0.5 text-[var(--fg-muted)]">
                  {isBuy ? (
                    <ArrowUp className="h-2.5 w-2.5 text-[var(--emerald)]" />
                  ) : (
                    <ArrowDown className="h-2.5 w-2.5 text-[var(--danger)]" />
                  )}
                  {t.type}
                </span>
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg-muted)]">
                {t.volume.toFixed(2)}
              </Td>
              <Td className="font-mono-nums tabular-nums text-[var(--fg)]">
                {fmtPrice(t.closePrice ?? t.entryPrice, t.symbol)}
              </Td>
              <Td>
                <span className="text-[var(--fg-dim)]">
                  {t.closeReason === "TAKE_PROFIT"
                    ? "TP"
                    : t.closeReason === "STOP_LOSS"
                      ? "SL"
                      : "Manual"}
                </span>
              </Td>
              <Td>
                <span
                  className={cn(
                    "font-mono-nums font-semibold tabular-nums",
                    win ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                  )}
                >
                  {win ? "+" : ""}
                  {formatMoney(t.profit ?? 0, 2)}
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ====================================================================
   Tab: Exposure — net exposure per symbol
   ==================================================================== */
function ExposureTab({ trades }: { trades: Trade[] }) {
  const exposure = useMemo(() => {
    const m: Record<string, { lots: number; net: number }> = {};
    for (const t of trades) {
      if (!m[t.symbol]) m[t.symbol] = { lots: 0, net: 0 };
      m[t.symbol].lots += t.volume;
      m[t.symbol].net += (t.profit ?? 0);
    }
    return Object.entries(m);
  }, [trades]);

  if (exposure.length === 0)
    return <EmptyState icon={Wallet} label="No open exposure" />;
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead className="sticky top-0 bg-[var(--bg-elev)]/95 backdrop-blur">
        <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">
          <Th>Symbol</Th>
          <Th>Total Lots</Th>
          <Th>Floating P/L</Th>
        </tr>
      </thead>
      <tbody>
        {exposure.map(([sym, e]) => (
          <tr
            key={sym}
            className="border-b border-[var(--border)]/40 transition-smooth hover:bg-[var(--bg-hover)]/50"
          >
            <Td>
              <span className="font-mono-nums font-semibold text-[var(--fg)]">{sym}</span>
            </Td>
            <Td className="font-mono-nums tabular-nums text-[var(--fg-muted)]">
              {e.lots.toFixed(2)}
            </Td>
            <Td>
              <span
                className={cn(
                  "font-mono-nums font-semibold tabular-nums",
                  e.net >= 0 ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
                )}
              >
                {e.net >= 0 ? "+" : ""}
                {formatMoney(e.net, 2)}
              </span>
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ====================================================================
   Static-ish tabs (News / Mail / Alerts / Journal / Experts)
   ==================================================================== */
function NewsTab() {
  const news = [
    { time: "09:30", src: "ForexLive", text: "EURUSD tests 1.0850 resistance as ECB minutes loom" },
    { time: "08:15", src: "Reuters", text: "Gold holds steady above $2,400 amid dovish Fed bets" },
    { time: "07:00", src: "DowJones", text: "Dollar firms as traders trim rate-cut expectations" },
  ];
  return (
    <div className="divide-y divide-[var(--border)]/40">
      {news.map((n, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2 transition-smooth hover:bg-[var(--bg-hover)]/40">
          <span className="font-mono-nums text-[10px] tabular-nums text-[var(--fg-dim)]">{n.time}</span>
          <span className="rounded bg-[var(--accent-dim)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent-bright)]">
            {n.src}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)]">{n.text}</span>
        </div>
      ))}
    </div>
  );
}

function MailTab() {
  const mail = [
    { from: "W-Forex-Bot", subj: "Weekly performance report ready", unread: true, time: "2h" },
    { from: "System", subj: "Margin level dropped below 300%", unread: true, time: "5h" },
    { from: "Support", subj: "Welcome to your trading terminal", unread: true, time: "1d" },
  ];
  return (
    <div className="divide-y divide-[var(--border)]/40">
      {mail.map((m, i) => (
        <div
          key={i}
          className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-smooth hover:bg-[var(--bg-hover)]/40"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              m.unread ? "bg-[var(--accent-bright)]" : "bg-transparent"
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-[var(--fg)]">{m.from}</p>
            <p className="truncate text-[11px] text-[var(--fg-muted)]">{m.subj}</p>
          </div>
          <span className="shrink-0 font-mono-nums text-[10px] text-[var(--fg-dim)]">{m.time}</span>
        </div>
      ))}
    </div>
  );
}

function AlertsTab() {
  const alerts = [
    { sym: "XAUUSD", cond: "Price > 2,410.00", state: "triggered", time: "10:42" },
    { sym: "EURUSD", cond: "RSI(14) crosses 70", state: "armed", time: "—" },
  ];
  return (
    <table className="w-full border-collapse text-[11px]">
      <thead className="sticky top-0 bg-[var(--bg-elev)]/95 backdrop-blur">
        <tr className="border-b border-[var(--border)] text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">
          <Th>Symbol</Th>
          <Th>Condition</Th>
          <Th>Status</Th>
          <Th>Last</Th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((a, i) => (
          <tr key={i} className="border-b border-[var(--border)]/40 hover:bg-[var(--bg-hover)]/50">
            <Td className="font-mono-nums font-semibold text-[var(--fg)]">{a.sym}</Td>
            <Td className="text-[var(--fg-muted)]">{a.cond}</Td>
            <Td>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                  a.state === "triggered"
                    ? "bg-[var(--gold)]/15 text-[var(--gold-bright)]"
                    : "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
                )}
              >
                {a.state}
              </span>
            </Td>
            <Td className="font-mono-nums text-[var(--fg-dim)]">{a.time}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function JournalTab({ connection }: { connection: ConnectionStatus }) {
  const logs = [
    { lvl: "info", msg: `Terminal connected · latency ${connection.latencyMs}ms`, t: "now" },
    { lvl: "info", msg: "Account sync complete — 0 positions loaded", t: "1m" },
    { lvl: "warn", msg: "Master account awaiting credentials", t: "5m" },
    { lvl: "info", msg: "W-Forex-Bot EA initialised on EURUSD,M15", t: "10m" },
    { lvl: "info", msg: "Symbol price stream subscribed", t: "10m" },
  ];
  return (
    <div className="divide-y divide-[var(--border)]/30 px-3 py-1">
      {logs.map((l, i) => (
        <div key={i} className="flex items-start gap-2 py-1.5">
          <span className="font-mono-nums text-[9px] tabular-nums text-[var(--fg-dim)]">{l.t}</span>
          {l.lvl === "warn" ? (
            <Info className="mt-0.5 h-3 w-3 shrink-0 text-[var(--gold-bright)]" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--emerald)]" />
          )}
          <span
            className={cn(
              "text-[11px]",
              l.lvl === "warn" ? "text-[var(--gold-bright)]" : "text-[var(--fg-muted)]"
            )}
          >
            {l.msg}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExpertsTab({ trades }: { trades: Trade[] }) {
  return (
    <div className="divide-y divide-[var(--border)]/30 px-3 py-1">
      <div className="flex items-start gap-2 py-1.5">
        <span className="font-mono-nums text-[9px] tabular-nums text-[var(--fg-dim)]">10m</span>
        <Activity className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent-bright)]" />
        <span className="text-[11px] text-[var(--fg-muted)]">
          W-Forex-Bot: scanning {trades.length} active signal{trades.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex items-start gap-2 py-1.5">
        <span className="font-mono-nums text-[9px] tabular-nums text-[var(--fg-dim)]">12m</span>
        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[var(--emerald)]" />
        <span className="text-[11px] text-[var(--fg-muted)]">
          Grid Master: levels rebalanced for EURUSD
        </span>
      </div>
      <div className="flex items-start gap-2 py-1.5">
        <span className="font-mono-nums text-[9px] tabular-nums text-[var(--fg-dim)]">15m</span>
        <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-[var(--danger)]" />
        <span className="text-[11px] text-[var(--fg-muted)]">
          RSI Reversion: no valid setup — skipping entry
        </span>
      </div>
    </div>
  );
}

/* ====================================================================
   Status bar — MT5 footer
   ==================================================================== */
function StatusBar({
  connection,
  account,
  openCount,
}: {
  connection: ConnectionStatus;
  account: AccountSnapshot | null;
  openCount: number;
}) {
  const stateColor =
    connection.state === "live"
      ? "var(--accent-bright)"
      : connection.state === "reconnecting"
        ? "var(--gold-bright)"
        : "var(--danger)";
  const stateLabel =
    connection.state === "live"
      ? "Connected"
      : connection.state === "reconnecting"
        ? "Reconnecting…"
        : "No connection";
  return (
    <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--bg-elev)]/80 px-3 py-1 text-[10px]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: stateColor, boxShadow: `0 0 6px ${stateColor}` }}
          />
          <span className="font-medium" style={{ color: stateColor }}>
            {stateLabel}
          </span>
        </span>
        <span className="text-[var(--fg-dim)]">·</span>
        <span className="font-mono-nums text-[var(--fg-muted)]">
          {connection.latencyMs}ms
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-[var(--fg-dim)]">
          Positions: <span className="font-mono-nums text-[var(--fg-muted)]">{openCount}</span>
        </span>
        {account && (
          <span className="hidden md:inline text-[var(--fg-dim)]">
            Equity:{" "}
            <span className="font-mono-nums font-semibold text-[var(--fg)]">
              {formatMoney(account.equity, 2)}
            </span>
          </span>
        )}
        <span className="text-[var(--fg-dim)]">W-Forex-Bot Terminal</span>
      </div>
    </div>
  );
}

/* ====================================================================
   Small helpers
   ==================================================================== */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-start font-semibold">{children}</th>;
}
function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3 py-2", className)}>{children}</td>;
}

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
      <Icon className="h-6 w-6 text-[var(--fg-dim)]" />
      <p className="text-[11px] text-[var(--fg-dim)]">{label}</p>
    </div>
  );
}

function AccountPill({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const color =
    tone === "success"
      ? "text-[var(--emerald-bright)]"
      : tone === "danger"
        ? "text-[var(--danger)]"
        : "text-[var(--fg)]";
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-[var(--fg-dim)]" />
      <span className="text-[9px] uppercase tracking-wide text-[var(--fg-dim)]">{label}</span>
      <span className={cn("font-mono-nums text-[11px] font-semibold tabular-nums", color)}>
        {value}
      </span>
    </div>
  );
}
