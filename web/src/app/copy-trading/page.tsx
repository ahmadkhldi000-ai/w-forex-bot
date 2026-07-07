"use client";

import { useState } from "react";
import {
  Copy,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Settings2,
  Zap,
  Activity,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

// Risk thresholds that trigger contextual warning
const HIGH_RISK_THRESHOLD = 5; // % per trade
const HIGH_LEVERAGE_THRESHOLD = 50;

export default function CopyTradingPage() {
  const [enabled, setEnabled] = useState(false);
  const [riskPercent, setRiskPercent] = useState(2);
  const [maxLeverage, setMaxLeverage] = useState(30);
  const [lotSize, setLotSize] = useState(0.01);

  // Warning modal state
  const [warning, setWarning] = useState<{
    open: boolean;
    field: "risk" | "leverage";
    value: number;
  }>({ open: false, field: "risk", value: 0 });

  const [saved, setSaved] = useState(false);

  const handleRiskChange = (val: number) => {
    setRiskPercent(val);
    if (val > HIGH_RISK_THRESHOLD) {
      setWarning({ open: true, field: "risk", value: val });
    }
  };

  const handleLeverageChange = (val: number) => {
    setMaxLeverage(val);
    if (val > HIGH_LEVERAGE_THRESHOLD) {
      setWarning({ open: true, field: "leverage", value: val });
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isHighRisk =
    riskPercent > HIGH_RISK_THRESHOLD || maxLeverage > HIGH_LEVERAGE_THRESHOLD;

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="px-8 py-6">
          <Container>
            {/* Header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Copy className="h-6 w-6 text-[var(--accent-bright)]" />
                  <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    نسخ الصفقات
                  </h1>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  انسخ صفقات حساب الـ MT5 الرئيسي تلقائياً مع إدارة مخاطر مخصصة
                </p>
              </div>

              {/* Enable toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-surface)] px-4 py-2.5">
                <span className="text-sm font-medium text-[var(--text-secondary)]">
                  {enabled ? "مفعّل" : "متوقف"}
                </span>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${
                    enabled ? "bg-[var(--accent)]" : "bg-[var(--bg-hover)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      enabled ? "left-0.5 translate-x-0" : "right-0.5 -translate-x-5"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Risk banner if high risk */}
            {isHighRisk && enabled && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-dim)] px-4 py-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--danger)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--danger)]">
                    تنبيه مخاطر:
                  </span>{" "}
                  إعداداتك الحالية عالية المخاطرة. قد يؤدي ذلك إلى خسائر كبيرة
                  وسريعة لرأس مالك.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Risk Settings Card */}
              <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <Settings2 className="h-5 w-5 text-[var(--accent-bright)]" />
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    إعدادات المخاطر
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Risk % */}
                  <SliderField
                    label="نسبة المخاطرة لكل صفقة"
                    value={riskPercent}
                    onChange={handleRiskChange}
                    min={0.1}
                    max={20}
                    step={0.1}
                    unit="%"
                    icon={Activity}
                    highRisk={riskPercent > HIGH_RISK_THRESHOLD}
                    warningText="أكثر من 5% يعتبر مخاطرة عالية"
                  />

                  {/* Max Leverage */}
                  <SliderField
                    label="الرافعة المالية القصوى"
                    value={maxLeverage}
                    onChange={handleLeverageChange}
                    min={1}
                    max={500}
                    step={1}
                    unit="x"
                    icon={Zap}
                    highRisk={maxLeverage > HIGH_LEVERAGE_THRESHOLD}
                    warningText="أكثر من 50x يضخّم الخسائر بشكل كبير"
                  />

                  {/* Lot Size */}
                  <SliderField
                    label="حجم اللوت"
                    value={lotSize}
                    onChange={setLotSize}
                    min={0.01}
                    max={2}
                    step={0.01}
                    unit=""
                    icon={TrendingUp}
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={!enabled}
                  className="mt-6 w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-base)] transition-smooth hover:bg-[var(--accent-bright)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="h-4 w-4" /> تم الحفظ
                    </span>
                  ) : (
                    "حفظ الإعدادات"
                  )}
                </button>
              </div>

              {/* Summary Card */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
                  <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
                    ملخص المخاطر
                  </h3>
                  <div className="space-y-3 text-sm">
                    <SummaryRow label="الحالة" value={enabled ? "🟢 نشط" : "🔴 متوقف"} />
                    <SummaryRow
                      label="المخاطرة/صفقة"
                      value={`${riskPercent.toFixed(1)}%`}
                      danger={riskPercent > HIGH_RISK_THRESHOLD}
                    />
                    <SummaryRow
                      label="الرافعة القصوى"
                      value={`${maxLeverage}x`}
                      danger={maxLeverage > HIGH_LEVERAGE_THRESHOLD}
                    />
                    <SummaryRow label="حجم اللوت" value={lotSize.toFixed(2)} />
                  </div>
                </div>

                {/* Permanent risk reminder */}
                <div className="rounded-2xl border border-[var(--danger)]/20 bg-[var(--danger-dim)]/40 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-[var(--danger)]" />
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      تذكير المخاطر
                    </h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                    نسخ الصفقات لا يضمن الأرباح. قد تخسر كامل رأس مالك. الأداء
                    السابق ليس ضماناً للمستقبل. تحمّل مسؤولية قراراتك.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </main>
      </div>

      {/* Contextual Risk Warning Modal */}
      {warning.open && (
        <RiskWarningModal
          field={warning.field}
          value={warning.value}
          onAccept={() => setWarning({ ...warning, open: false })}
          onCancel={() => {
            // Revert to safe value
            if (warning.field === "risk") setRiskPercent(HIGH_RISK_THRESHOLD);
            else setMaxLeverage(HIGH_LEVERAGE_THRESHOLD);
            setWarning({ ...warning, open: false });
          }}
        />
      )}
    </div>
  );
}

/* ---------- Slider Field ---------- */
function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  icon: Icon,
  highRisk,
  warningText,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  highRisk?: boolean;
  warningText?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </span>
        </div>
        <span
          className={`rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${
            highRisk
              ? "bg-[var(--danger-dim)] text-[var(--danger)]"
              : "bg-[var(--accent-dim)] text-[var(--accent-bright)]"
          }`}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-elevated)] ${
          highRisk ? "accent-[var(--danger)]" : "accent-[var(--accent)]"
        }`}
      />
      {warningText && highRisk && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--danger)]">
          <AlertTriangle className="h-3 w-3" />
          {warningText}
        </p>
      )}
    </div>
  );
}

/* ---------- Summary Row ---------- */
function SummaryRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          danger ? "text-[var(--danger)]" : "text-[var(--text-primary)]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------- Contextual Risk Warning Modal ---------- */
function RiskWarningModal({
  field,
  value,
  onAccept,
  onCancel,
}: {
  field: "risk" | "leverage";
  value: number;
  onAccept: () => void;
  onCancel: () => void;
}) {
  const text =
    field === "risk"
      ? `أنت تحاول تعيين نسبة مخاطرة ${value}% لكل صفقة. هذا مستوى عالٍ جداً وقد يؤدي إلى استنزاف حسابك بسرعة في حال سلسلة صفقات خاسرة.`
      : `أنت تحاول استخدام رافعة مالية ${value}x. الرافعة العالية تضخّم الخسائر بشكل كبير، ويمكن أن تخسر كامل حسابك في صفقة واحدة.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--danger)]/30 bg-[var(--bg-surface)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--danger-dim)] px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--danger)]/20 text-[var(--danger)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              تحذير: مستوى مخاطرة عالٍ
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              High Risk Setting Detected
            </p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {text}
          </p>
          <div className="mt-4 rounded-lg bg-[var(--bg-elevated)] p-3 text-[11px] text-[var(--text-muted)]">
            💡 ننصح بعدم تجاوز{" "}
            {field === "risk" ? "5% لكل صفقة" : "رافعة 50x"} للمتداولين الجدد.
          </div>
        </div>

        <div className="flex gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-smooth hover:text-[var(--text-primary)]"
          >
            العودة لقيمة آمنة
          </button>
          <button
            onClick={onAccept}
            className="flex-1 rounded-xl bg-[var(--danger)] py-2.5 text-sm font-semibold text-white transition-smooth hover:opacity-90"
          >
            أوافق، أقبل المخاطر
          </button>
        </div>
      </div>
    </div>
  );
}
