"use client";

// ====================================================================
//  Lightweight-Charts data adapter
//  --------------------------------------------------------------------
//  Converts the project's domain types (Candle / Trade) into the
//  shapes expected by TradingView Lightweight Charts v5, keeping all
//  data-format concerns out of the rendering component.
// ====================================================================

import {
  type UTCTimestamp,
  type CandlestickData,
  type HistogramData,
  type SeriesMarker,
  type Time,
  type LineStyle,
} from "lightweight-charts";
import type { Candle, Trade } from "./types";

/** Convert epoch ms → lightweight-charts UTCTimestamp (whole seconds). */
export function toUTCTime(ms: number): UTCTimestamp {
  return Math.floor(ms / 1000) as UTCTimestamp;
}

/**
 * Convert our candle array into Lightweight-Charts candlestick data.
 * Guarantees ascending, de-duplicated time points (required by the lib).
 */
export function toCandlestickData(candles: Candle[]): CandlestickData<Time>[] {
  const seen = new Set<number>();
  const out: CandlestickData<Time>[] = [];
  for (const c of candles) {
    const t = toUTCTime(c.time);
    if (seen.has(t)) continue;
    seen.add(t);
    out.push({
      time: t,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    });
  }
  out.sort((a, b) => (a.time as number) - (b.time as number));
  return out;
}

/** Volume histogram data, coloured by candle direction at render time. */
export function toVolumeData(
  candles: Candle[],
  upColor: string,
  downColor: string,
): HistogramData<Time>[] {
  const out: HistogramData<Time>[] = [];
  for (const c of candles) {
    if (!c.volume || c.volume <= 0) continue;
    out.push({
      time: toUTCTime(c.time),
      value: c.volume,
      color: c.close >= c.open ? upColor : downColor,
    });
  }
  return out;
}

/** Snap a raw epoch-ms time to the closest existing candle time (seconds). */
function snapToBar(
  ms: number,
  barTimes: number[],
): UTCTimestamp | null {
  if (!barTimes.length) return null;
  const target = Math.floor(ms / 1000);
  // binary-ish nearest search (arrays are small, linear is fine)
  let best = barTimes[0];
  let bestDiff = Math.abs(best - target);
  for (let i = 1; i < barTimes.length; i++) {
    const diff = Math.abs(barTimes[i] - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = barTimes[i];
    }
  }
  return best as UTCTimestamp;
}

/**
 * Convert open trades into on-chart entry markers (arrows on the candle
 * nearest to the trade open time).
 */
export function toTradeMarkers(
  trades: Trade[],
  barTimes: number[],
): SeriesMarker<Time>[] {
  const markers: SeriesMarker<Time>[] = [];
  for (const t of trades) {
    if (t.status !== "OPEN") continue;
    const time = snapToBar(t.openTime, barTimes);
    if (time == null) continue;
    const isBuy = t.type === "BUY";
    markers.push({
      time,
      position: isBuy ? "belowBar" : "aboveBar",
      color: isBuy ? "#2ee9a8" : "#f4576b",
      shape: isBuy ? "arrowUp" : "arrowDown",
      text: `${isBuy ? "BUY" : "SELL"} ${t.volume}`,
      size: 1,
    });
  }
  markers.sort((a, b) => (a.time as number) - (b.time as number));
  return markers;
}

/** Price-line descriptor for entry / stop-loss / take-profit. */
export interface PriceLineDescriptor {
  price: number;
  color: string;
  title: string;
  lineStyle: LineStyle;
}

/** Build horizontal price-line descriptors for a trade's SL / TP / entry. */
export function toPriceLines(trades: Trade[]): PriceLineDescriptor[] {
  const lines: PriceLineDescriptor[] = [];
  for (const t of trades) {
    if (t.status !== "OPEN") continue;
    if (t.stopLoss > 0)
      lines.push({
        price: t.stopLoss,
        color: "#f4576b",
        title: `SL ${t.type}`,
        lineStyle: 2,
      });
    if (t.takeProfit > 0)
      lines.push({
        price: t.takeProfit,
        color: "#2ee9a8",
        title: `TP ${t.type}`,
        lineStyle: 2,
      });
    if (t.entryPrice > 0)
      lines.push({
        price: t.entryPrice,
        color: "rgba(255,255,255,0.45)",
        title: `Entry ${t.type}`,
        lineStyle: 1,
      });
  }
  return lines;
}

/** Get the array of bar times (in seconds) present in the candle set. */
export function barTimesOf(candles: Candle[]): number[] {
  return candles.map((c) => toUTCTime(c.time) as number);
}
