"use client";

import { useState } from "react";
import {
  Bot,
  Server,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Pause,
  Play,
  Settings2,
  RefreshCw,
  Wifi,
  HardDrive,
} from "lucide-react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

type BotStatus = "running" | "paused" | "error";

type BotInstance = {
  id: string;
  name: string;
  strategy: string;
  symbol: string;
  status: BotStatus;
  uptime: string;
  cpu: number;
  mem: number;
  trades: number;
  pnl: number;
};

const BOTS: BotInstance[] = [
  { id: "BOT-01", name: "Scalper Alpha", strategy: "VWAP Scalper", symbol: "EUR/USD", status: "running", uptime: "12d 4h", cpu: 18, mem: 142, trades: 248, pnl: 1820.4 },
  { id: "BOT-02", name: "Trend Rider", strategy: "EMA Cross", symbol: "GBP/JPY", status: "running", uptime: "5d 9h", cpu: 22, mem: 168, trades: 64, pnl: 940.2 },
  { id: "BOT-03", name: "Grid Master", strategy: "Grid v2", symbol: "XAU/USD", status: "paused", uptime: "0d 0h", cpu: 0, mem: 0, trades: 19, pnl: -210.5 },
  { id: "BOT-04", name: "Range Hunter", strategy: "RSI Reversion", symbol: "USD/CHF", status: "running", uptime: "8d 2h", cpu: 14, mem: 98, trades: 88, pnl: 612.8 },
  { id: "BOT-05", name: "Breakout Pro", strategy: "Donchian", symbol: "BTC/USD", status: "error", uptime: "0d 0h", cpu: 0, mem: 0, trades: 12, pnl: -88.0 },
];

export default function AdminBotPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <AdminSidebar />
      <div className="mr-64">
        <AdminTopbar title="البوت & MT5" />
        <main className="p-8">
          {/* system health */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <HealthTile icon={Server} label="حالة الخادم" value="يعمل" sub="99.98% uptime" tone="emerald" />
            <HealthTile icon={Activity} label="البوتات النشطة" value="3" sub="من 5" tone="emerald" />
            <HealthTile icon={Cpu} label="استخدام CPU" value="14%" sub="متوسط" tone="gold" />
            <HealthTile icon={HardDrive} label="الذاكرة" value="408MB" sub="من 2GB" tone="info" />
          </div>

          {/* MT5 connection status */}
          <div className="mt-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-[var(--emerald)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">اتصال MT5</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--emerald)]/20 bg-[var(--emerald)]/10 px-3 py-1 text-xs font-semibold text-[var(--emerald-bright)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--emerald)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--emerald-bright)]" />
                </span>
                متصل
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ConnInfo icon={Wifi} label="الخادم" value="ICMarkets-Demo" />
              <ConnInfo icon={Activity} label="زمن الاستجابة" value="42ms" />
              <ConnInfo icon={RefreshCw} label="آخر مزامنة" value="منذ 3 ثوانٍ" />
            </div>
          </div>

          {/* bot instances */}
          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">مثيلات البوت</h2>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--emerald)] px-4 py-2 text-sm font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]">
              <Bot className="h-4 w-4" />
              بوت جديد
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {BOTS.map((b) => (
              <BotCard key={b.id} bot={b} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function HealthTile({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone: "emerald" | "gold" | "info";
}) {
  const toneMap = {
    emerald: "text-[var(--emerald-bright)] bg-[var(--emerald)]/12",
    gold: "text-[var(--gold-bright)] bg-[var(--gold)]/12",
    info: "text-[var(--info)] bg-[var(--info)]/12",
  } as const;
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${toneMap[tone]}`}>
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <p className="font-mono-nums text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{sub}</p>
    </div>
  );
}

function ConnInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/40 p-3.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)]">
        <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
      </div>
      <div>
        <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function BotCard({ bot }: { bot: BotInstance }) {
  const [paused, setPaused] = useState(bot.status === "paused");
  const isRunning = bot.status === "running" && !paused;
  const isError = bot.status === "error";

  const statusConfig = {
    running: { c: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20", Icon: CheckCircle2, label: "يعمل" },
    paused: { c: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20", Icon: Pause, label: "متوقف" },
    error: { c: "bg-[var(--danger)]/12 text-[var(--danger)] border-[var(--danger)]/20", Icon: AlertTriangle, label: "خطأ" },
  } as const;

  const effectiveStatus = isError ? "error" : isRunning ? "running" : "paused";
  const { c, Icon: StatusIcon, label } = statusConfig[effectiveStatus];

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 transition-smooth hover:border-[var(--border-strong)]">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60">
            <Bot className="h-5 w-5 text-[var(--emerald)]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{bot.name}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${c}`}>
                <StatusIcon className="h-2.5 w-2.5" />
                {label}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              {bot.strategy} · {bot.symbol}
            </p>
          </div>
        </div>
        <span className="font-mono-nums text-[11px] text-[var(--text-muted)]">{bot.id}</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Metric label="الصفقات" value={bot.trades.toString()} />
        <Metric label="P&L" value={`$${bot.pnl.toFixed(1)}`} tone={bot.pnl >= 0 ? "emerald" : "danger"} />
        <Metric label="CPU" value={`${bot.cpu}%`} />
        <Metric label="Uptime" value={bot.uptime} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isError ? (
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--emerald)] px-3 py-2 text-xs font-bold text-black transition-smooth hover:bg-[var(--emerald-bright)]">
            <RefreshCw className="h-3.5 w-3.5" />
            إعادة التشغيل
          </button>
        ) : (
          <button
            onClick={() => setPaused((v) => !v)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] transition-smooth hover:bg-[var(--bg-hover)]"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? "إيقاف مؤقت" : "تشغيل"}
          </button>
        )}
        <button className="inline-flex items-center justify-center rounded-xl border border-[var(--border-subtle)] p-2 text-[var(--text-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "emerald" | "danger" }) {
  return (
    <div className="rounded-lg bg-[var(--bg-elevated)]/40 p-2.5 text-center">
      <p className={`font-mono-nums text-sm font-semibold ${tone === "emerald" ? "text-[var(--emerald-bright)]" : tone === "danger" ? "text-[var(--danger)]" : "text-[var(--text-primary)]"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{label}</p>
    </div>
  );
}
