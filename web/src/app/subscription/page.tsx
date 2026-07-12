"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { Badge, LiveDot } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  type Plan,
  type PlanTier,
  type BillingCycle,
  type Subscription,
  type Invoice,
  type UsdtPaymentInfo,
  type Payment,
  type PayStatus,
  type InvoiceStatus,
  getPlans,
  getMySubscription,
  subscribe as apiSubscribe,
  renewSubscription,
  cancelSubscription,
  pollPaymentStatus,
} from "@/lib/subscription/api";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Download,
  ArrowRight,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Receipt,
  TrendingUp,
  Loader2,
  Send,
  ShieldAlert,
} from "lucide-react";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cycle, setCycle] = useState<BillingCycle>("MONTHLY");
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<{
    open: boolean;
    tier: PlanTier | null;
    usdt: UsdtPaymentInfo | null;
    payment: Payment | null;
    mode: "subscribe" | "renew";
  }>({ open: false, tier: null, usdt: null, payment: null, mode: "subscribe" });

  const loadData = useCallback(async () => {
    const [plansRes, subRes] = await Promise.all([getPlans(), getMySubscription()]);
    setPlans(plansRes);
    setSubscription(subRes.subscription);
    setInvoices(subRes.invoices);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubscribe = async (tier: PlanTier) => {
    if (tier === "FREE") {
      await apiSubscribe(tier, cycle);
      await loadData();
      return;
    }
    setPayModal({ open: true, tier, usdt: null, payment: null, mode: "subscribe" });
    const res = await apiSubscribe(tier, cycle);
    setPayModal({
      open: true,
      tier,
      usdt: res.usdt,
      payment: res.payment,
      mode: "subscribe",
    });
  };

  const handleRenew = async () => {
    if (!subscription) return;
    setPayModal({ open: true, tier: subscription.tier, usdt: null, payment: null, mode: "renew" });
    const res = await renewSubscription(subscription.id);
    setPayModal({
      open: true,
      tier: subscription.tier,
      usdt: res.usdt,
      payment: res.payment,
      mode: "renew",
    });
  };

  const handleCancel = async () => {
    if (!subscription) return;
    if (!confirm("Are you sure you want to cancel your subscription? You'll keep access until the end of your billing period.")) return;
    await cancelSubscription(subscription.id);
    await loadData();
  };

  const handlePaymentComplete = async () => {
    setPayModal({ open: false, tier: null, usdt: null, payment: null, mode: "subscribe" });
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] lg:pr-[252px]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <Topbar />
          <main className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--emerald)]" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] lg:pr-[252px]">
      <Sidebar />
      <div className="flex min-w-0 flex-col">
        <Topbar />
        <main className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-6">
          {/* Header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2">
                <Crown className="h-4 w-4 text-[var(--gold)]" />
                <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)] lg:text-2xl">
                  Subscription
                </h1>
              </div>
              <p className="text-sm text-[var(--fg-muted)]">
                Manage your plan, billing, and USDT payments.
              </p>
            </div>
          </header>

          {/* Current plan banner */}
          {subscription && (
            <CurrentPlanBanner
              subscription={subscription}
              onRenew={handleRenew}
              onCancel={handleCancel}
            />
          )}

          {/* Billing cycle toggle */}
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)]/60 p-1">
              {(["MONTHLY", "YEARLY"] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-smooth",
                    cycle === c
                      ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]"
                      : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                  )}
                >
                  {c.toLowerCase()}
                  {c === "YEARLY" && (
                    <span className="ml-1.5 rounded-full bg-[var(--emerald)]/15 px-1.5 py-0.5 text-[10px] text-[var(--emerald-bright)]">
                      ~17% off
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.tier}
                plan={plan}
                cycle={cycle}
                currentTier={subscription?.tier}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>

          {/* Invoices */}
          <InvoicesCard invoices={invoices} />

          {/* Join Telegram Community */}
          <a
            href="https://t.me/+iXalBkHABfBkYWQ0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#229ED9]/30 bg-[#229ED9]/8 p-5 transition-smooth hover:border-[#229ED9]/50 hover:bg-[#229ED9]/12"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#229ED9]/15">
                <Send className="h-5 w-5 text-[#229ED9]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--fg)]">Join Telegram Community</p>
                <p className="text-xs text-[var(--fg-muted)]">12,000+ traders · Free signals · Daily analysis</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-[#229ED9]" />
          </a>

          {/* Risk Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--gold)]/15 bg-[var(--gold)]/5 p-5">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--gold-bright)]" />
            <div>
              <p className="text-xs font-semibold text-[var(--fg)]">Risk Disclaimer</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--fg-muted)]">
                Trading in Forex and financial markets carries high risk and may result in the loss of capital. Past performance does not guarantee future results. W Forex Bot is a technology platform and does not guarantee profits.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* USDT Payment Modal */}
      {payModal.open && payModal.usdt && payModal.payment && (
        <UsdtPaymentModal
          usdt={payModal.usdt}
          payment={payModal.payment}
          tier={payModal.tier!}
          onClose={() => setPayModal({ open: false, tier: null, usdt: null, payment: null, mode: "subscribe" })}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* Current Plan Banner                                                 */
/* ================================================================== */
function CurrentPlanBanner({
  subscription,
  onRenew,
  onCancel,
}: {
  subscription: Subscription;
  onRenew: () => void;
  onCancel: () => void;
}) {
  const isFree = subscription.tier === "FREE";
  const isActive = subscription.status === "ACTIVE";
  const endDate = new Date(subscription.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));

  const tierIcons: Record<PlanTier, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    FREE: Sparkles,
    PRO: Zap,
    VIP: Crown,
  };
  const Icon = tierIcons[subscription.tier] ?? Sparkles;
  const tierColors: Record<PlanTier, string> = {
    FREE: "var(--info)",
    PRO: "var(--emerald-bright)",
    VIP: "var(--gold-bright)",
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[#0d2018] p-5 lg:p-6">
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full blur-3xl" style={{ background: `color-mix(in srgb, ${tierColors[subscription.tier]} 12%, transparent)` }} />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ borderColor: `color-mix(in srgb, ${tierColors[subscription.tier]} 25%, transparent)`, background: `color-mix(in srgb, ${tierColors[subscription.tier]} 12%, transparent)` }}>
            <Icon className="h-7 w-7" style={{ color: tierColors[subscription.tier] }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--fg)]">{subscription.tier} Plan</h2>
              <Badge className={isActive ? "bg-[var(--emerald)]/15 text-[var(--emerald-bright)]" : "bg-[var(--danger)]/15 text-[var(--danger)]"}>
                {isActive ? "Active" : subscription.status}
              </Badge>
            </div>
            {!isFree ? (
              <p className="mt-0.5 text-sm text-[var(--fg-muted)]">
                Renews on{" "}
                <span className="font-medium text-[var(--fg)]">
                  {endDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>{" "}
                · <span className="font-mono-nums">${subscription.amount}/{subscription.billingCycle === "YEARLY" ? "yr" : "mo"}</span>
                {isActive && daysLeft <= 7 && (
                  <span className="ml-2 text-[var(--gold-bright)]">· {daysLeft}d left</span>
                )}
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-[var(--fg-muted)]">Free plan · No expiration</p>
            )}
          </div>
        </div>
        {!isFree && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRenew}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)]/60 px-4 py-2.5 text-sm font-medium text-[var(--fg)] transition-smooth hover:bg-[var(--bg-hover)]"
            >
              <RefreshCw className="h-4 w-4" />
              Renew
            </button>
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-2.5 text-sm font-medium text-[var(--danger)] transition-smooth hover:bg-[var(--danger)]/15"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/* Plan Card                                                           */
/* ================================================================== */
function PlanCard({
  plan,
  cycle,
  currentTier,
  onSubscribe,
}: {
  plan: Plan;
  cycle: BillingCycle;
  currentTier?: PlanTier;
  onSubscribe: (tier: PlanTier) => void;
}) {
  const price = cycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;
  const isCurrent = currentTier === plan.tier;
  const isPopular = plan.tier === "PRO";
  const isVip = plan.tier === "VIP";

  const tierIcons: Record<PlanTier, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    FREE: Sparkles,
    PRO: Zap,
    VIP: Crown,
  };
  const Icon = tierIcons[plan.tier];
  const accent = plan.tier === "VIP" ? "var(--gold-bright)" : plan.tier === "PRO" ? "var(--emerald-bright)" : "var(--info)";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-[var(--surface)]/60 p-5 transition-smooth",
        isPopular
          ? "border-[var(--emerald)]/40 shadow-[0_0_40px_-12px_rgba(25,201,138,0.4)]"
          : isVip
          ? "border-[var(--gold)]/40 shadow-[0_0_40px_-12px_rgba(245,177,78,0.3)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--emerald)] px-3 py-1 text-[11px] font-bold text-[#06241a]">
            <Sparkles className="h-3 w-3" /> MOST POPULAR
          </span>
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{ borderColor: `color-mix(in srgb, ${accent} 25%, transparent)`, background: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--fg)]">{plan.name}</h3>
          <p className="text-xs text-[var(--fg-muted)]">{plan.description}</p>
        </div>
      </div>

      <div className="mb-5 flex items-baseline gap-1">
        <span className="font-mono-nums text-3xl font-bold text-[var(--fg)]">
          {price === 0 ? "$0" : `$${price}`}
        </span>
        <span className="text-sm text-[var(--fg-muted)]">/{cycle === "MONTHLY" ? "mo" : "yr"}</span>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--emerald)]/15">
              <Check className="h-3 w-3 text-[var(--emerald-bright)]" />
            </span>
            <span className="text-sm text-[var(--fg)]">{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan.tier)}
        disabled={isCurrent}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth",
          isCurrent
            ? "cursor-default border border-[var(--border)] bg-[var(--bg-elevated)]/40 text-[var(--fg-muted)]"
            : plan.tier === "VIP"
            ? "bg-[var(--gold)] text-[#2a1c05] hover:bg-[var(--gold-bright)]"
            : plan.tier === "FREE"
            ? "border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--bg-hover)]"
            : "bg-[var(--emerald)] text-[#06241a] hover:bg-[var(--emerald-bright)]"
        )}
      >
        {isCurrent ? (
          <>
            <Check className="h-4 w-4" /> Current Plan
          </>
        ) : price === 0 ? (
          "Switch to Free"
        ) : (
          <>
            Subscribe with USDT
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}

/* ================================================================== */
/* USDT Payment Modal                                                  */
/* ================================================================== */
function UsdtPaymentModal({
  usdt,
  payment,
  tier,
  onClose,
  onComplete,
}: {
  usdt: UsdtPaymentInfo;
  payment: Payment;
  tier: PlanTier;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<PayStatus>(payment.status);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [polling, setPolling] = useState(true);

  // Countdown timer
  useEffect(() => {
    const expires = new Date(usdt.paymentWindowExpires).getTime();
    const update = () => {
      const left = Math.max(0, expires - Date.now());
      setTimeLeft(left);
      if (left <= 0) {
        setStatus("EXPIRED");
        setPolling(false);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [usdt.paymentWindowExpires]);

  // Poll payment status
  useEffect(() => {
    if (!polling) return;
    let active = true;
    const poll = async () => {
      if (!active) return;
      try {
        const updated = await pollPaymentStatus(payment.id);
        if (!active) return;
        setStatus(updated.status);
        if (updated.status === "COMPLETED") {
          setPolling(false);
          setTimeout(onComplete, 2000);
        }
      } catch {
        // ignore poll errors
      }
    };
    const interval = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [polling, payment.id, onComplete]);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(usdt.depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const isCompleted = status === "COMPLETED";
  const isExpired = status === "EXPIRED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isCompleted ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--emerald)]/12">
              <CreditCard className="h-4 w-4 text-[var(--emerald-bright)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--fg)]">USDT TRC-20 Payment</h3>
              <p className="text-[11px] text-[var(--fg-muted)]">{tier} Plan · {payment.amount} USDT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isCompleted ? (
          /* Success state */
          <div className="flex flex-col items-center px-6 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--emerald)]/15">
              <CheckCircle2 className="h-8 w-8 text-[var(--emerald-bright)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--fg)]">Payment Confirmed!</h3>
            <p className="mt-1 text-center text-sm text-[var(--fg-muted)]">
              Your {tier} subscription is now active. Redirecting...
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--emerald)]/20 bg-[var(--emerald)]/8 px-4 py-2">
              <Receipt className="h-4 w-4 text-[var(--emerald-bright)]" />
              <span className="font-mono-nums text-xs text-[var(--fg-secondary)]">{payment.id}</span>
            </div>
          </div>
        ) : isExpired ? (
          /* Expired state */
          <div className="flex flex-col items-center px-6 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)]/15">
              <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--fg)]">Payment Window Expired</h3>
            <p className="mt-1 text-center text-sm text-[var(--fg-muted)]">
              The payment window has closed. Please try again.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-xl bg-[var(--emerald)] px-5 py-2.5 text-sm font-semibold text-[#06241a] transition-smooth hover:bg-[var(--emerald-bright)]"
            >
              Close
            </button>
          </div>
        ) : (
          /* Active payment state */
          <div className="space-y-4 px-5 py-5">
            {/* Countdown */}
            <div className="flex items-center justify-between rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/8 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--gold-bright)]" />
                <span className="text-xs font-medium text-[var(--fg-secondary)]">Time remaining</span>
              </div>
              <span className="font-mono-nums text-sm font-bold text-[var(--gold-bright)]">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <img
                  src={usdt.qrCodeDataUrl}
                  alt="USDT Payment QR Code"
                  className="h-44 w-44"
                />
              </div>
            </div>

            {/* Network badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-[var(--emerald)]/12 text-[var(--emerald-bright)]">
                <ShieldCheck className="mr-1 h-3 w-3" /> TRC-20 Network
              </Badge>
              <span className="text-[11px] text-[var(--fg-muted)]">Low fees · Fast confirmation</span>
            </div>

            {/* Deposit address */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--fg-muted)]">Deposit Address</label>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)]/50 px-3.5 py-3">
                <span className="flex-1 truncate font-mono-nums text-sm text-[var(--fg)]">
                  {usdt.depositAddress}
                </span>
                <button
                  onClick={copyAddress}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--fg-muted)] transition-smooth hover:bg-[var(--bg-hover)] hover:text-[var(--fg)]"
                >
                  {copied ? <Check className="h-4 w-4 text-[var(--emerald-bright)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--fg-muted)]">Amount</p>
                <p className="mt-1 font-mono-nums text-lg font-bold text-[var(--fg)]">
                  {usdt.amountUsdt.toFixed(2)}
                </p>
                <p className="text-[10px] text-[var(--fg-dim)]">USDT (TRC-20)</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-3">
                <p className="text-[11px] text-[var(--fg-muted)]">USD Value</p>
                <p className="mt-1 font-mono-nums text-lg font-bold text-[var(--fg)]">
                  ${usdt.amountUsd.toFixed(2)}
                </p>
                <p className="text-[10px] text-[var(--fg-dim)]">1 USDT ≈ $1.00</p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-elevated)]/40 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--emerald)]" />
              <span className="text-sm text-[var(--fg-secondary)]">
                Waiting for payment confirmation...
              </span>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 rounded-xl border border-[var(--gold)]/15 bg-[var(--gold)]/5 px-3.5 py-2.5">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--gold-bright)]" />
              <p className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
                Send only <b className="text-[var(--fg-secondary)]">USDT on TRC-20 network</b>. Sending other tokens or using a different network may result in permanent loss.
              </p>
            </div>

            {/* Explorer link */}
            <a
              href={usdt.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-[var(--emerald-bright)] transition-smooth hover:text-[var(--emerald)]"
            >
              View on Tronscan <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/* Invoices Card                                                       */
/* ================================================================== */
function InvoicesCard({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-[var(--emerald)]" />
          <h2 className="text-sm font-semibold text-[var(--fg)]">Invoice History</h2>
        </div>
        <span className="text-xs text-[var(--fg-muted)]">{invoices.length} invoices</span>
      </div>
      {invoices.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt className="mx-auto mb-3 h-8 w-8 text-[var(--fg-muted)]" />
          <p className="text-sm text-[var(--fg-muted)]">No invoices yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-[11px] uppercase tracking-wide text-[var(--fg-muted)]">
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {invoices.map((inv) => (
                <tr key={inv.id} className="transition-smooth hover:bg-[var(--bg-hover)]/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/60">
                        <CreditCard className="h-3.5 w-3.5 text-[var(--fg-muted)]" />
                      </div>
                      <span className="font-mono-nums text-sm font-medium text-[var(--fg)]">{inv.number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-[var(--fg-secondary)]">{inv.tier}</span>
                    <span className="ml-1 text-[11px] text-[var(--fg-dim)]">{inv.billingCycle.toLowerCase()}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono-nums text-sm font-semibold text-[var(--fg)]">
                    ${inv.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[var(--fg-muted)]">
                    {new Date(inv.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--fg-muted)] transition-smooth hover:border-[var(--border-strong)] hover:text-[var(--fg)]">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const map: Record<InvoiceStatus, { c: string; label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    PAID: { c: "bg-[var(--emerald)]/12 text-[var(--emerald-bright)] border-[var(--emerald)]/20", label: "Paid", Icon: CheckCircle2 },
    PENDING: { c: "bg-[var(--gold)]/12 text-[var(--gold-bright)] border-[var(--gold)]/20", label: "Pending", Icon: Clock },
    VOID: { c: "bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)]", label: "Void", Icon: X },
    REFUNDED: { c: "bg-[var(--info)]/12 text-[var(--info)] border-[var(--info)]/20", label: "Refunded", Icon: RefreshCw },
  };
  const { c, label, Icon } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", c)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
