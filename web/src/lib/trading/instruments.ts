// ====================================================================
//  Tradeable instruments — realistic FX/precious-metal specs
// ====================================================================

export interface InstrumentSpec {
  symbol: string;
  name: string;
  pip: number; // value of one pip in price terms
  digits: number; // decimal places
  spreadPips: number;
  base: number; // realistic starting price for simulation
  volatility: number; // per-tick sigma as fraction of price
  category: "FX" | "Metal" | "Index" | "Crypto";
}

export const INSTRUMENTS: InstrumentSpec[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar",       pip: 0.0001, digits: 5, spreadPips: 0.8, base: 1.0842,  volatility: 0.00035, category: "FX" },
  { symbol: "GBPUSD", name: "British Pound / USD",    pip: 0.0001, digits: 5, spreadPips: 1.1, base: 1.2718,  volatility: 0.00040, category: "FX" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", pip: 0.01, digits: 3, spreadPips: 0.9, base: 161.42,  volatility: 0.025,   category: "FX" },
  { symbol: "XAUUSD", name: "Gold / US Dollar",       pip: 0.01,   digits: 2, spreadPips: 2.5, base: 2368.4,  volatility: 0.45,    category: "Metal" },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar",    pip: 0.1,    digits: 1, spreadPips: 8,   base: 62480,   volatility: 18,      category: "Crypto" },
];

export const DEFAULT_SYMBOL = "EURUSD";

export function getSpec(symbol: string): InstrumentSpec {
  return INSTRUMENTS.find((s) => s.symbol === symbol) ?? INSTRUMENTS[0];
}

/** Format a price to the instrument's precision */
export function fmtPrice(price: number, symbol: string): string {
  const spec = getSpec(symbol);
  return price.toLocaleString("en-US", {
    minimumFractionDigits: spec.digits,
    maximumFractionDigits: spec.digits,
  });
}

/** Price → pips from a reference */
export function toPips(diff: number, symbol: string): number {
  return diff / getSpec(symbol).pip;
}

// ----------------------------------------------------------------
//  REAL-TIME PRICE SYNC
//  Updates the `base` price of each instrument with real global
//  market rates. Called once on page load.
// ----------------------------------------------------------------

let realSyncDone = false;

export function isRealSyncDone() {
  return realSyncDone;
}

export async function syncRealPrices(): Promise<void> {
  if (realSyncDone) return;
  try {
    const [fxRes, cryptoRes, metalRes] = await Promise.all([
      fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd", { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      Promise.all([
        fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d")}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
        fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent("https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d")}`, { cache: "no-store" }).then((r) => r.json()).catch(() => null),
      ]),
    ]);

    const r = fxRes?.rates || {};
    const real: Record<string, number> = {};
    if (r.EUR) real.EURUSD = 1 / r.EUR;
    if (r.GBP) real.GBPUSD = 1 / r.GBP;
    if (r.JPY) real.USDJPY = r.JPY;
    if (r.CHF) real.USDCHF = r.CHF;
    if (r.AUD) real.AUDUSD = 1 / r.AUD;
    if (r.CAD) real.USDCAD = r.CAD;
    if (r.NZD) real.NZDUSD = 1 / r.NZD;
    if (r.EUR && r.GBP) real.EURGBP = r.GBP / r.EUR;
    if (r.EUR && r.JPY) real.EURJPY = r.JPY / r.EUR;
    if (r.GBP && r.JPY) real.GBPJPY = r.JPY / r.GBP;

    if (cryptoRes?.bitcoin?.usd) real.BTCUSD = cryptoRes.bitcoin.usd;
    if (cryptoRes?.ethereum?.usd) real.ETHUSD = cryptoRes.ethereum.usd;

    const [gold, silver] = metalRes;
    if (gold?.chart?.result?.[0]?.meta?.regularMarketPrice) real.XAUUSD = gold.chart.result[0].meta.regularMarketPrice;
    if (silver?.chart?.result?.[0]?.meta?.regularMarketPrice) real.XAGUSD = silver.chart.result[0].meta.regularMarketPrice;

    // Apply real prices to instruments
    let updated = 0;
    for (const inst of INSTRUMENTS) {
      if (real[inst.symbol] && real[inst.symbol] > 0) {
        inst.base = real[inst.symbol];
        updated++;
      }
    }
    realSyncDone = true;
    console.log(`[instruments] Synced ${updated} real prices from global markets`);
  } catch (err) {
    console.warn("[instruments] Real price sync failed, using fallback prices", err);
    realSyncDone = true;
  }
}
