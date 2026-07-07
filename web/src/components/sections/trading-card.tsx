"use client";

import { useEffect, useState } from "react";
import { Activity, ArrowUpRight, ArrowDownRight, Bot, Sparkles } from "lucide-react";

const trades = [
  { pair: "EUR/USD", side: "BUY", entry: 1.0834, pnl: +142.5, vol: "1.2" },
  { pair: "XAU/USD", side: "BUY", entry: 2381.0, pnl: +386.2, vol: "0.4" },
  { pair: "USD/JPY", side: "SELL", entry: 158.02, pnl: +58.9, vol: "0.8" },
  { pair: "GBP/USD", side: "SELL", entry: 1.2725, pnl: -22.4, vol: "0.6" },
];

// Build a smooth equity curve
const equity = [
  100, 104, 101, 108, 112, 109, 118, 122, 119, 128, 134, 131, 142, 148, 145, 156,
];

export function TradingCard() {
  const [sparkPulse, setSparkPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSparkPulse((v) => v + 1), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative">
      {/* Floating gold chip */}
      <div className="absolute -left-6 top-16 z-20 hidden animate-float rounded-2xl glass-strong px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold-bright">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-fg-dim">معدّل الربح الشهري</p>
            <p className="text-sm font-bold text-gold-bright tabular">+18.4%</p>
          </div>
        </div>
      </div>

      {/* Floating winrate chip */}
      <div
        className="absolute -right-4 bottom-24 z-20 hidden animate-float rounded-2xl glass-strong px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] sm:block"
        style={{ animationDelay: "1.2s" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/15 text-emerald-bright">
            <Activity className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] text-fg-dim">نسبة الصفقات الرابحة</p>
            <p className="text-sm font-bold text-emerald-bright tabular">87.3%</p>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="relative overflow-hidden rounded-3xl glass-strong p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-bright to-emerald-deep">
              <Bot className="h-6 w-6 text-[#04130d]" strokeWidth={2.2} />
              <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/25" />
            </span>
            <div>
              <p className="text-sm font-bold text-fg">W-Forex AI v3.2</p>
              <p className="flex items-center gap-1.5 text-xs text-emerald-bright">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-bright" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-bright" />
                </span>
                يعمل الآن
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-fg-muted">
            MT5 · Hot Live
          </span>
        </div>

        {/* Balance + equity chart */}
        <div className="mb-5 rounded-2xl bg-bg/60 p-4 ring-1 ring-white/5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-fg-dim">الرصيد الإجمالي</p>
              <p className="mt-1 text-3xl font-bold text-fg tabular">$48,920.55</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-fg-dim">ربح اليوم</p>
              <p className="mt-1 inline-flex items-center gap-1 text-lg font-bold text-emerald-bright tabular">
                <ArrowUpRight className="h-4 w-4" />
                +$1,284
              </p>
            </div>
          </div>

          <EquityChart data={equity} key={sparkPulse} />
        </div>

        {/* Open trades */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-dim">
              الصفقات المفتوحة
            </p>
            <span className="text-xs text-fg-muted tabular">{trades.length} صفقات</span>
          </div>
          <div className="space-y-1.5">
            {trades.map((t, i) => {
              const win = t.pnl >= 0;
              return (
                <div
                  key={i}
                  className="group flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-bold ${
                        t.side === "BUY"
                          ? "bg-emerald/15 text-emerald-bright"
                          : "bg-danger/15 text-danger"
                      }`}
                    >
                      {t.side === "BUY" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-fg">{t.pair}</p>
                      <p className="text-[11px] text-fg-dim tabular">
                        {t.entry} · {t.vol} لوت
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold tabular ${
                      win ? "text-emerald-bright" : "text-danger"
                    }`}
                  >
                    {win ? "+" : ""}
                    ${t.pnl.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EquityChart({ data }: { data: number[] }) {
  const w = 440;
  const h = 84;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => [i * step, h - ((d - min) / range) * (h - 12) - 6]);
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-3 h-20 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="eq-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="eq-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#f5b942" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#eq-area)" />
      <path
        d={line}
        fill="none"
        stroke="url(#eq-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#f5b942" />
      <circle cx={last[0]} cy={last[1]} r="8" fill="#f5b942" fillOpacity="0.25">
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
