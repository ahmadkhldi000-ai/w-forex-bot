"use client";

// ====================================================================
//  CandlestickChart — professional TradingView Lightweight Charts v5
//  --------------------------------------------------------------------
//  • Candlestick OHLC series (green up / red down)
//  • Volume histogram pane (coloured by candle direction)
//  • Live last-price line + pulsing price tag
//  • Crosshair OHLC legend (top-left overlay)
//  • Trade markers (entry arrows) + SL / TP / entry price-lines
//  • Dark theme wired to the site design tokens
//  • Fully responsive (ResizeObserver) + native zoom / pan
//
//  Data handling is delegated to ../lib/trading/lw-adapter so this
//  component stays focused on rendering.
// ====================================================================

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type {
  IChartApi,
  ISeriesApi,
  ISeriesMarkersPluginApi,
  IPriceLine,
  SeriesType,
  SeriesMarker,
  Time,
} from "lightweight-charts";
import type { Candle, Trade } from "@/lib/trading/types";
import { getSpec, fmtPrice } from "@/lib/trading/instruments";
import {
  toCandlestickData,
  toVolumeData,
  toTradeMarkers,
  toPriceLines,
  barTimesOf,
  toUTCTime,
} from "@/lib/trading/lw-adapter";

interface Props {
  symbol: string;
  candles: Candle[];
  trades: Trade[]; // open + closed trades for this symbol
  livePrice: number;
}

// ---- palette (kept in lockstep with globals.css design tokens) ----
const COL = {
  up: "#19c98a",
  upBright: "#2ee9a8",
  down: "#f4576b",
  upWick: "rgba(46,233,168,0.9)",
  downWick: "rgba(244,87,107,0.9)",
  volUp: "rgba(25,201,138,0.42)",
  volDown: "rgba(244,87,107,0.42)",
  grid: "rgba(255,255,255,0.045)",
  gridStrong: "rgba(255,255,255,0.08)",
  text: "#9fb0b6",
  textDim: "#62757c",
  bg: "transparent",
  crosshair: "rgba(232,240,242,0.55)",
};

type OHLC = { o: number; h: number; l: number; c: number; up?: boolean };

export function CandlestickChart({ symbol, candles, trades, livePrice }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [legend, setLegend] = useState<OHLC | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const [ready, setReady] = useState(false);

  const spec = useMemo(() => getSpec(symbol), [symbol]);

  // --- chart instance refs (kept outside React state to avoid re-renders) ---
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const lastPriceRef = useRef<number>(0);

  // ====================================================================
  // 1. Create chart once
  // ====================================================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    (async () => {
      const lw = await import("lightweight-charts");
      if (disposed || !container) return;

      const chart = lw.createChart(container, {
        autoSize: true,
        layout: {
          background: { color: COL.bg },
          textColor: COL.text,
          fontSize: 11,
          fontFamily:
            "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
          attributionLogo: false,
          panes: { separatorColor: "rgba(255,255,255,0.06)", separatorHoverColor: "rgba(255,255,255,0.12)" },
        },
        grid: {
          vertLines: { color: COL.grid, style: 1 },
          horzLines: { color: COL.grid, style: 1 },
        },
        crosshair: {
          mode: 1, // Magnet
          vertLine: {
            color: COL.crosshair,
            width: 1,
            style: 2,
            labelBackgroundColor: "#131b1f",
          },
          horzLine: {
            color: COL.crosshair,
            width: 1,
            style: 2,
            labelBackgroundColor: "#19c98a",
          },
        },
        rightPriceScale: {
          borderColor: COL.gridStrong,
          scaleMargins: { top: 0.08, bottom: 0.26 },
          entireTextOnly: true,
        },
        timeScale: {
          borderColor: COL.gridStrong,
          timeVisible: true,
          secondsVisible: false,
          rightOffset: 8,
          barSpacing: 9,
          fixLeftEdge: true,
          shiftVisibleRangeOnNewBar: true,
        },
        handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        handleScroll: { mouseWheel: true, horzTouchDrag: true, vertTouchDrag: false },
      });
      chartRef.current = chart;

      // ---- candlestick series (main pane) ----
      const candleSeries = chart.addSeries(lw.CandlestickSeries, {
        upColor: COL.up,
        downColor: COL.down,
        wickUpColor: COL.upWick,
        wickDownColor: COL.downWick,
        borderUpColor: COL.up,
        borderDownColor: COL.down,
        borderVisible: true,
        wickVisible: true,
        priceLineVisible: true,
        priceLineColor: COL.upBright,
        priceLineStyle: 2,
        priceFormat: {
          type: "price",
          precision: spec.digits,
          minMove: spec.pip,
        },
        lastValueVisible: true,
      });
      candleSeriesRef.current = candleSeries;

      // ---- volume histogram (overlay pane 0, scaled to bottom) ----
      const volSeries = chart.addSeries(lw.HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: COL.volUp,
      });
      volSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });
      volSeriesRef.current = volSeries;

      // ---- crosshair → legend ----
      chart.subscribeCrosshairMove((param) => {
        if (!candleSeriesRef.current) return;
        if (!param.time || !param.seriesData) {
          // fall back to the last candle
          const data = candleSeriesRef.current.data();
          const last = data[data.length - 1] as
            | { open: number; high: number; low: number; close: number }
            | undefined;
          if (last) setLegend({ o: last.open, h: last.high, l: last.low, c: last.close });
          return;
        }
        const d = param.seriesData.get(candleSeriesRef.current) as
          | { open: number; high: number; low: number; close: number }
          | undefined;
        if (d) setLegend({ o: d.open, h: d.high, l: d.low, c: d.close, up: d.close >= d.open });
      });

      setReady(true);
    })();

    return () => {
      disposed = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candleSeriesRef.current = null;
      volSeriesRef.current = null;
      markersRef.current = null;
      priceLinesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================================================
  // 2. Update price format when symbol changes
  // ====================================================================
  useEffect(() => {
    candleSeriesRef.current?.applyOptions({
      priceFormat: { type: "price", precision: spec.digits, minMove: spec.pip },
    });
  }, [spec.digits, spec.pip]);

  // ====================================================================
  // 3. Push data when candles change
  // ====================================================================
  useEffect(() => {
    const cs = candleSeriesRef.current;
    const vs = volSeriesRef.current;
    if (!cs || !vs) return;

    const candleData = toCandlestickData(candles);
    cs.setData(candleData);
    vs.setData(toVolumeData(candles, COL.volUp, COL.volDown));

    // initial legend = last candle
    const last = candleData[candleData.length - 1];
    if (last)
      setLegend({ o: last.open, h: last.high, l: last.low, c: last.close, up: last.close >= last.open });
  }, [candles]);

  // ====================================================================
  // 4. Trade markers + SL/TP/entry price-lines
  // ====================================================================
  useEffect(() => {
    let active = true;
    (async () => {
      const lw = await import("lightweight-charts");
      if (!active || !candleSeriesRef.current) return;

      // markers
      const times = barTimesOf(candles);
      const markers: SeriesMarker<Time>[] = toTradeMarkers(trades, times);
      if (markersRef.current) markersRef.current.setMarkers(markers);
      else markersRef.current = lw.createSeriesMarkers(candleSeriesRef.current, markers);

      // price lines (clear old, draw new)
      const series = candleSeriesRef.current;
      priceLinesRef.current.forEach((pl) => series.removePriceLine(pl));
      priceLinesRef.current = [];
      for (const pl of toPriceLines(trades)) {
        const line = series.createPriceLine({
          price: pl.price,
          color: pl.color,
          lineWidth: 1,
          lineStyle: pl.lineStyle,
          axisLabelVisible: true,
          title: pl.title,
        });
        priceLinesRef.current.push(line);
      }
    })();
    return () => {
      active = false;
    };
  }, [trades, candles]);

  // ====================================================================
  // 5. Live price → update the forming candle + flash animation
  // ====================================================================
  useEffect(() => {
    const series = candleSeriesRef.current;
    if (!series || !candles.length || livePrice <= 0) return;

    if (lastPriceRef.current && livePrice !== lastPriceRef.current) {
      setFlash(livePrice > lastPriceRef.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 420);
      // update the last (forming) candle
      const last = candles[candles.length - 1];
      if (last) {
        series.update({
          time: toUTCTime(last.time),
          open: last.open,
          high: Math.max(last.high, livePrice),
          low: Math.min(last.low, livePrice),
          close: livePrice,
        });
      }
      return () => clearTimeout(t);
    }
    lastPriceRef.current = livePrice;
  }, [livePrice, candles]);

  // keep lastPriceRef in sync on price plateau
  useEffect(() => {
    lastPriceRef.current = livePrice;
  }, [livePrice]);

  // ====================================================================
  // 6. Fit content on symbol change
  // ====================================================================
  const fitOnSymbol = useCallback(() => {
    if (chartRef.current) chartRef.current.timeScale().fitContent();
  }, []);
  useEffect(() => {
    const id = setTimeout(fitOnSymbol, 60);
    return () => clearTimeout(id);
  }, [symbol, fitOnSymbol]);

  const change = useMemo(() => {
    if (!legend || !legend.o) return null;
    return legend.c - legend.o;
  }, [legend]);

  const d = spec.digits;

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      {/* ===== OHLC legend overlay ===== */}
      <div className="pointer-events-none absolute left-3 top-2.5 z-20 flex flex-col gap-1 font-mono-nums">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-bold tracking-wide text-[var(--fg)]">{symbol}</span>
          {legend && (
            <span
              className={`font-semibold ${
                legend.up ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]"
              }`}
            >
              {change != null && change >= 0 ? "+" : ""}
              {change != null ? change.toFixed(d) : ""}
            </span>
          )}
        </div>
        {legend && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] leading-none">
            <Leg label="O" v={legend.o} d={d} />
            <Leg label="H" v={legend.h} d={d} tone="up" />
            <Leg label="L" v={legend.l} d={d} tone="down" />
            <Leg label="C" v={legend.c} d={d} tone={legend.up ? "up" : "down"} />
          </div>
        )}
      </div>

      {/* ===== Live price tag (top-right) ===== */}
      {livePrice > 0 && (
        <div
          className={`pointer-events-none absolute right-3 top-2.5 z-20 rounded-lg border px-2.5 py-1 font-mono-nums text-[13px] font-bold shadow-lg transition-colors duration-300 ${
            flash === "up"
              ? "border-[var(--emerald)] bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
              : flash === "down"
                ? "border-[var(--danger)] bg-[var(--danger)]/15 text-[var(--danger)]"
                : "border-[var(--border)] bg-[var(--surface)]/80 text-[var(--fg)]"
          }`}
        >
          {fmtPrice(livePrice, symbol)}
          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--emerald)] align-middle" />
        </div>
      )}

      {/* ===== lightweight-charts canvas mount ===== */}
      <div
        ref={containerRef}
        className={`h-full w-full ${ready ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
      />

      {/* ===== loading skeleton ===== */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--emerald)]" />
        </div>
      )}
    </div>
  );
}

function Leg({
  label,
  v,
  d,
  tone,
}: {
  label: string;
  v: number;
  d: number;
  tone?: "up" | "down";
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-[var(--fg-dim)]">{label}</span>
      <span
        className={
          tone === "up"
            ? "text-[var(--emerald-bright)]"
            : tone === "down"
              ? "text-[var(--danger)]"
              : "text-[var(--fg-muted)]"
        }
      >
        {v.toFixed(d)}
      </span>
    </span>
  );
}
