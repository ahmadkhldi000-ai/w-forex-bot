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
