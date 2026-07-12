"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Candle, Trade } from "@/lib/trading/types";
import { getSpec, fmtPrice } from "@/lib/trading/instruments";
import { cn } from "@/lib/utils";

interface Props {
  symbol: string;
  candles: Candle[];
  trades: Trade[]; // open + closed trades for this symbol
  livePrice: number;
}

const PAD_R = 78; // price axis
const PAD_B = 26; // time axis
const PAD_T = 14;
const PAD_L = 10;

export function CandlestickChart({ symbol, candles, trades, livePrice }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1080);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const spec = useMemo(() => getSpec(symbol), [symbol]);

  // responsive width
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0].contentRect.width;
      setW(Math.max(520, cw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 460;
  const plotW = w - PAD_R - PAD_L;
  const plotH = H - PAD_B - PAD_T;

  const view = useMemo(() => {
    const data = candles.slice(-70);
    if (!data.length) return null;

    // include SL/TP lines of open trades in the price range
    let lo = Math.min(...data.map((c) => c.low));
    let hi = Math.max(...data.map((c) => c.high));
    for (const t of trades) {
      if (t.symbol !== symbol) continue;
      lo = Math.min(lo, t.stopLoss, t.takeProfit, t.entryPrice);
      hi = Math.max(hi, t.stopLoss, t.takeProfit, t.entryPrice);
    }
    const pad = (hi - lo) * 0.12 || spec.pip * 20;
    lo -= pad;
    hi += pad;
    const range = hi - lo || 1;

    const cw = plotW / data.length;
    const bw = Math.max(2, cw * 0.62);

    const x = (i: number) => PAD_L + i * cw + cw / 2;
    const y = (p: number) => PAD_T + ((hi - p) / range) * plotH;

    // grid lines (5)
    const grid = Array.from({ length: 5 }, (_, k) => {
      const p = lo + (range * k) / 4;
      return { p, y: y(p) };
    });

    // time labels (5)
    const timeGrid = Array.from({ length: 5 }, (_, k) => {
      const idx = Math.floor((data.length - 1) * (k / 4));
      const c = data[idx];
      return {
        x: x(idx),
        label: new Date(c.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      };
    });

    return { data, x, y, bw, cw, lo, hi, range, grid, timeGrid };
  }, [candles, trades, symbol, spec.pip, plotW, plotH]);

  // visible trades for this symbol, mapped to bar coordinates
  const markers = useMemo(() => {
    if (!view) return [];
    const symTrades = trades.filter((t) => t.symbol === symbol);
    // find nearest bar index by time
    return symTrades.map((t) => {
      let nearest = 0;
      let best = Infinity;
      view.data.forEach((c, i) => {
        const d = Math.abs(c.time - t.openTime);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      let exitIdx: number | null = null;
      if (t.closeTime) {
        let be = Infinity;
        const ct = t.closeTime;
        view.data.forEach((c, i) => {
          const d = Math.abs(c.time - ct);
          if (d < be) {
            be = d;
            exitIdx = i;
          }
        });
      }
      return { trade: t, entryIdx: nearest, exitIdx };
    });
  }, [view, trades, symbol]);

  if (!view) return null;

  const lastCandle = view.data[view.data.length - 1];
  const priceY = view.y(livePrice);
  const up = livePrice >= lastCandle.open;
  const lastChange = livePrice - lastCandle.open;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const i = Math.floor((mx - PAD_L) / view!.cw);
    if (i < 0 || i >= view!.data.length) {
      setHover(null);
      return;
    }
    setHover({ i, x: view!.x(i), y: e.clientY - rect.top });
  }

  return (
    <div ref={wrapRef} className="relative w-full select-none">
      <svg
        width={w}
        height={H}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        className="block"
      >
        <defs>
          <linearGradient id="slArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(244,87,107,0.10)" />
            <stop offset="100%" stopColor="rgba(244,87,107,0)" />
          </linearGradient>
          <linearGradient id="tpArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(25,201,138,0.10)" />
            <stop offset="100%" stopColor="rgba(25,201,138,0)" />
          </linearGradient>
        </defs>

        {/* "W" brand watermark — sits faintly behind the chart */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--text-muted)"
          opacity={0.05}
          fontWeight={900}
          fontSize={Math.min(w, H) * 0.7}
          pointerEvents="none"
          aria-hidden="true"
          style={{ userSelect: "none" }}
        >
          W
        </text>

        {/* horizontal grid + price axis labels */}
        {view.grid.map((g, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={PAD_L + plotW}
              y1={g.y}
              y2={g.y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
            <text
              x={PAD_L + plotW + 8}
              y={g.y + 3}
              fill="#62757c"
              fontSize={10}
              className="font-mono-nums"
            >
              {fmtPrice(g.p, symbol)}
            </text>
          </g>
        ))}

        {/* time axis */}
        {view.timeGrid.map((t, i) => (
          <text key={i} x={t.x} y={H - 8} fill="#62757c" fontSize={10} textAnchor="middle">
            {t.label}
          </text>
        ))}

        {/* candles */}
        {view.data.map((c, i) => {
          const cx = view.x(i);
          const isUp = c.close >= c.open;
          const color = isUp ? "var(--emerald)" : "var(--danger)";
          const bodyTop = view.y(Math.max(c.open, c.close));
          const bodyBot = view.y(Math.min(c.open, c.close));
          const bh = Math.max(1, bodyBot - bodyTop);
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={view.y(c.high)} y2={view.y(c.low)} stroke={color} strokeWidth={1} />
              <rect
                x={cx - view.bw / 2}
                y={bodyTop}
                width={view.bw}
                height={bh}
                fill={color}
                rx={0.5}
                opacity={hover && hover.i !== i ? 0.5 : 1}
                style={{ transition: "opacity 120ms" }}
              />
            </g>
          );
        })}

        {/* SL/TP & entry lines for OPEN trades only */}
        {markers
          .filter((m) => m.trade.status === "OPEN")
          .map((m) => {
            const t = m.trade;
            return (
              <g key={`lines-${t.id}`}>
                {/* entry */}
                <line x1={PAD_L} x2={PAD_L + plotW} y1={view.y(t.entryPrice)} y2={view.y(t.entryPrice)} stroke="#9fb0b6" strokeWidth={1} strokeDasharray="2 3" opacity={0.5} />
                {/* SL */}
                <line x1={PAD_L} x2={PAD_L + plotW} y1={view.y(t.stopLoss)} y2={view.y(t.stopLoss)} stroke="var(--danger)" strokeWidth={1} strokeDasharray="5 4" opacity={0.65} />
                <rect x={PAD_L} y={view.y(t.stopLoss)} width={plotW} height={Math.max(0, view.y(t.entryPrice) - view.y(t.stopLoss))} fill="url(#slArea)" opacity={t.type === "SELL" ? 0 : 0.6} />
                {/* TP */}
                <line x1={PAD_L} x2={PAD_L + plotW} y1={view.y(t.takeProfit)} y2={view.y(t.takeProfit)} stroke="var(--emerald)" strokeWidth={1} strokeDasharray="5 4" opacity={0.65} />
                <rect x={PAD_L} y={view.y(t.takeProfit)} width={plotW} height={Math.max(0, view.y(t.entryPrice) - view.y(t.takeProfit))} fill="url(#tpArea)" opacity={t.type === "BUY" ? 0 : 0.6} />
              </g>
            );
          })}

        {/* live price line */}
        <line
          x1={PAD_L}
          x2={PAD_L + plotW}
          y1={priceY}
          y2={priceY}
          stroke={up ? "var(--emerald-bright)" : "var(--danger)"}
          strokeWidth={1}
          strokeDasharray="1 0"
          opacity={0.9}
        />
        {/* live price tag */}
        <g>
          <rect x={PAD_L + plotW + 2} y={priceY - 10} width={72} height={20} rx={3} fill={up ? "var(--emerald)" : "var(--danger)"} />
          <text x={PAD_L + plotW + 38} y={priceY + 4} fill="#070a0b" fontSize={11} fontWeight={700} textAnchor="middle" className="font-mono-nums">
            {fmtPrice(livePrice, symbol)}
          </text>
        </g>

        {/* BUY / SELL markers */}
        {markers.map((m) => {
          const t = m.trade;
          const x = view.x(m.entryIdx);
          const y = view.y(t.entryPrice);
          const isBuy = t.type === "BUY";
          const color = isBuy ? "var(--emerald)" : "var(--danger)";
          // triangle + label
          const triY = isBuy ? y + 22 : y - 22;
          return (
            <g key={`mk-${t.id}`}>
              {isBuy ? (
                <path d={`M${x},${triY} L${x - 7},${triY + 12} L${x + 7},${triY + 12} Z`} fill={color} />
              ) : (
                <path d={`M${x},${triY} L${x - 7},${triY - 12} L${x + 7},${triY - 12} Z`} fill={color} />
              )}
              <text x={x} y={isBuy ? triY + 24 : triY - 16} fill={color} fontSize={9} fontWeight={800} textAnchor="middle">
                {isBuy ? "BUY" : "SELL"}
              </text>
              {/* exit marker */}
              {m.exitIdx !== null && t.closePrice !== undefined && (
                <g>
                  <circle cx={view.x(m.exitIdx)} cy={view.y(t.closePrice)} r={4} fill="none" stroke={(t.profit ?? 0) >= 0 ? "var(--emerald)" : "var(--danger)"} strokeWidth={1.5} />
                  <line x1={x} y1={y} x2={view.x(m.exitIdx)} y2={view.y(t.closePrice)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="2 3" />
                </g>
              )}
            </g>
          );
        })}

        {/* Entry / Stop Loss / Take Profit horizontal lines for OPEN trades */}
        {markers
          .filter((m) => m.trade.status === "OPEN")
          .map((m) => {
            const t = m.trade;
            const entryY = view.y(t.entryPrice);
            const slY = view.y(t.stopLoss);
            const tpY = view.y(t.takeProfit);
            const isBuy = t.type === "BUY";
            const lineEnd = PAD_L + plotW;
            return (
              <g key={`lines-${t.id}`}>
                {/* Entry */}
                <line x1={PAD_L} x2={lineEnd} y1={entryY} y2={entryY} stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeDasharray="4 3" />
                <g>
                  <rect x={PAD_L + 2} y={entryY - 8} width={48} height={16} rx={3} fill="rgba(15,23,26,0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
                  <text x={PAD_L + 26} y={entryY + 3} fill="#e8f0f2" fontSize={9} fontWeight={700} textAnchor="middle">
                    {fmtPrice(t.entryPrice, symbol)}
                  </text>
                </g>
                {/* Stop Loss */}
                <line x1={PAD_L} x2={lineEnd} y1={slY} y2={slY} stroke="var(--danger)" strokeWidth={1} strokeDasharray="5 3" opacity={0.75} />
                <g>
                  <rect x={lineEnd - 50} y={slY - 8} width={48} height={16} rx={3} fill="rgba(244,87,107,0.18)" stroke="var(--danger)" strokeWidth={0.5} />
                  <text x={lineEnd - 26} y={slY + 3} fill="var(--danger)" fontSize={9} fontWeight={700} textAnchor="middle">
                    SL {fmtPrice(t.stopLoss, symbol)}
                  </text>
                </g>
                {/* Take Profit */}
                <line x1={PAD_L} x2={lineEnd} y1={tpY} y2={tpY} stroke="var(--emerald-bright)" strokeWidth={1} strokeDasharray="5 3" opacity={0.75} />
                <g>
                  <rect x={lineEnd - 50} y={tpY - 8} width={48} height={16} rx={3} fill="rgba(25,201,138,0.18)" stroke="var(--emerald-bright)" strokeWidth={0.5} />
                  <text x={lineEnd - 26} y={tpY + 3} fill="var(--emerald-bright)" fontSize={9} fontWeight={700} textAnchor="middle">
                    TP {fmtPrice(t.takeProfit, symbol)}
                  </text>
                </g>
                {/* side direction indicator */}
                <text x={PAD_L + 6} y={isBuy ? entryY - 12 : entryY + 18} fill={isBuy ? "var(--emerald-bright)" : "var(--danger)"} fontSize={8} fontWeight={800}>
                  {isBuy ? "▲ BUY" : "▼ SELL"}
                </text>
              </g>
            );
          })}

        {/* hover crosshair + tooltip */}
        {hover && (
          <g pointerEvents="none">
            <line x1={hover.x} x2={hover.x} y1={PAD_T} y2={PAD_T + plotH} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
            <line x1={PAD_L} x2={PAD_L + plotW} y1={hover.y} y2={hover.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
          </g>
        )}
      </svg>

      {/* OHLC legend on hover */}
      {hover && view.data[hover.i] && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-2 text-[11px] backdrop-blur">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-[var(--fg)]">{symbol}</span>
            <span className="text-[var(--fg-dim)]">· 15s</span>
            <span className="text-[var(--fg-dim)]">{new Date(view.data[hover.i].time).toLocaleTimeString("en-GB")}</span>
          </div>
          <div className="grid grid-cols-4 gap-x-4 gap-y-0.5 font-mono-nums">
            {(["open", "high", "low", "close"] as const).map((k) => (
              <div key={k} className="flex items-center gap-1">
                <span className="text-[var(--fg-dim)] uppercase">{k[0]}</span>
                <span className="text-[var(--fg)]">{fmtPrice(view.data[hover.i][k], symbol)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* last-change pill */}
      <div className="pointer-events-none absolute right-[92px] top-3 flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)]/80 px-2 py-1 text-[11px] backdrop-blur">
        <span className={cn("font-mono-nums font-semibold", lastChange >= 0 ? "text-[var(--emerald-bright)]" : "text-[var(--danger)]")}>
          {lastChange >= 0 ? "+" : ""}
          {(lastChange / spec.pip).toFixed(1)} pips
        </span>
      </div>
    </div>
  );
}
