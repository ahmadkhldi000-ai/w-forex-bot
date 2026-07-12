/**
 * Trading data layer — real, persisted trading state per account.
 *
 * Each registered account gets a trading profile: balance, equity, P&L
 * history, open positions, and closed trades. Data is persisted in the
 * browser so it survives refreshes (and feels "real").
 *
 * For a new account, everything starts at zero / empty — no fake numbers.
 * As the user interacts (records a trade, deposits), the data updates live.
 */

// --------------------------------------------------------------------
//  TYPES
// --------------------------------------------------------------------

export type TradeSide = "BUY" | "SELL";
export type TradeStatus = "OPEN" | "CLOSED";

export interface Trade {
  id: string;
  symbol: string; // e.g. "EURUSD"
  side: TradeSide;
  volume: number; // lots
  openPrice: number;
  closePrice?: number;
  openTime: string; // ISO
  closeTime?: string;
  pnl: number; // realized P&L in account currency (0 while open)
  status: TradeStatus;
}

export interface EquityPoint {
  t: string; // ISO timestamp
  equity: number;
}

export interface TradingProfile {
  email: string;
  balance: number; // account balance
  /** Sum of open positions' floating P&L. */
  marginLevel: number; // % , 0 if no positions
  equityHistory: EquityPoint[];
  openPositions: Trade[];
  closedTrades: Trade[];
  /** Cumulative stats derived from closedTrades */
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  grossProfit: number;
  grossLoss: number;
  updatedAt: string;
}

// --------------------------------------------------------------------
//  STORAGE
// --------------------------------------------------------------------

const PREFIX = "wfb_trading_";

function keyFor(email: string) {
  return `${PREFIX}${email.toLowerCase().trim()}`;
}

function genId(): string {
  return (
    "t_" +
    Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Create an empty profile for a brand-new account. */
export function createEmptyProfile(email: string): TradingProfile {
  return {
    email: email.toLowerCase().trim(),
    balance: 0,
    marginLevel: 0,
    equityHistory: [
      { t: new Date().toISOString(), equity: 0 },
    ],
    openPositions: [],
    closedTrades: [],
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    grossProfit: 0,
    grossLoss: 0,
    updatedAt: new Date().toISOString(),
  };
}

/** Read a profile, creating an empty one if it doesn't exist yet. */
export function getTradingProfile(email: string): TradingProfile {
  if (typeof window === "undefined") return createEmptyProfile(email);
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return createEmptyProfile(email);
    return JSON.parse(raw) as TradingProfile;
  } catch {
    return createEmptyProfile(email);
  }
}

export function saveTradingProfile(profile: TradingProfile): void {
  if (typeof window === "undefined") return;
  profile.updatedAt = new Date().toISOString();
  localStorage.setItem(keyFor(profile.email), JSON.stringify(profile));
}

// --------------------------------------------------------------------
//  ACTIONS (these mutate the persisted profile)
// --------------------------------------------------------------------

/** Deposit funds into the account (e.g. demo funding). */
export function deposit(email: string, amount: number): TradingProfile {
  const p = getTradingProfile(email);
  p.balance += amount;
  pushEquity(p, p.balance);
  saveTradingProfile(p);
  return p;
}

/** Open a new position. */
export function openPosition(
  email: string,
  data: {
    symbol: string;
    side: TradeSide;
    volume: number;
    openPrice: number;
  }
): TradingProfile {
  const p = getTradingProfile(email);
  const trade: Trade = {
    id: genId(),
    symbol: data.symbol,
    side: data.side,
    volume: data.volume,
    openPrice: data.openPrice,
    openTime: new Date().toISOString(),
    pnl: 0,
    status: "OPEN",
  };
  p.openPositions.push(trade);
  saveTradingProfile(p);
  return p;
}

/** Close a position by id at the given price. Realizes P&L. */
export function closePosition(
  email: string,
  tradeId: string,
  closePrice: number
): TradingProfile {
  const p = getTradingProfile(email);
  const idx = p.openPositions.findIndex((t) => t.id === tradeId);
  if (idx === -1) return p;

  const trade = p.openPositions[idx];
  trade.closePrice = closePrice;
  trade.closeTime = new Date().toISOString();
  trade.status = "CLOSED";

  // P&L = (close - open) * volume * contractSize, sign by side
  // Using a simplified pip-value model (1 lot = 100,000 units)
  const direction = trade.side === "BUY" ? 1 : -1;
  const priceDiff = (closePrice - trade.openPrice) * direction;
  // Approximate pip value: for FX majors, $10 per pip per 0.01 lot
  const pipValue = trade.volume * 1000; // $ per unit of price diff
  trade.pnl = Math.round(priceDiff * pipValue * 100) / 100;

  // Apply to balance + stats
  p.balance += trade.pnl;
  p.closedTrades.unshift(trade); // most recent first
  p.openPositions.splice(idx, 1);
  p.totalTrades++;
  if (trade.pnl >= 0) {
    p.winningTrades++;
    p.grossProfit += trade.pnl;
  } else {
    p.losingTrades++;
    p.grossLoss += Math.abs(trade.pnl);
  }
  pushEquity(p, p.balance);
  saveTradingProfile(p);
  return p;
}

/** Reset everything to zero (demo only). */
export function resetProfile(email: string): TradingProfile {
  const p = createEmptyProfile(email);
  saveTradingProfile(p);
  return p;
}

// --------------------------------------------------------------------
//  DERIVED STATS (read-only helpers)
// --------------------------------------------------------------------

export interface TradingStats {
  balance: number;
  equity: number; // balance + floating P&L
  floatingPnl: number;
  todayPnl: number;
  totalPnl: number;
  winRate: number; // %
  profitFactor: number;
  totalTrades: number;
  openCount: number;
}

export function getStats(profile: TradingProfile): TradingStats {
  const floatingPnl = 0; // open positions use mark-to-market in real systems
  const equity = profile.balance + floatingPnl;

  // Today's P&L: sum of closed trades since midnight
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayPnl = profile.closedTrades
    .filter((t) => new Date(t.closeTime ?? t.openTime) >= todayStart)
    .reduce((s, t) => s + t.pnl, 0);

  const totalPnl = profile.balance; // balance reflects all realized P&L
  const winRate =
    profile.totalTrades > 0
      ? (profile.winningTrades / profile.totalTrades) * 100
      : 0;
  const profitFactor =
    profile.grossLoss > 0
      ? profile.grossProfit / profile.grossLoss
      : profile.grossProfit > 0
        ? 99
        : 0;

  return {
    balance: profile.balance,
    equity,
    floatingPnl,
    todayPnl,
    totalPnl,
    winRate,
    profitFactor,
    totalTrades: profile.totalTrades,
    openCount: profile.openPositions.length,
  };
}

// --------------------------------------------------------------------
//  INTERNAL
// --------------------------------------------------------------------

function pushEquity(p: TradingProfile, equity: number) {
  // Keep last 200 points to avoid unbounded growth
  p.equityHistory.push({ t: new Date().toISOString(), equity });
  if (p.equityHistory.length > 200) {
    p.equityHistory = p.equityHistory.slice(-200);
  }
}
