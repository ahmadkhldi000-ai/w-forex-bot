// ====================================================================
//  Subscription API Client
//  Mock implementation that mirrors the server API contract exactly.
//  To go live: replace these functions with real fetch() calls to
//  `${API_URL}/api/subscriptions/*` — the response shapes are identical.
// ====================================================================

export type PlanTier = "FREE" | "PRO" | "VIP";
export type BillingCycle = "MONTHLY" | "YEARLY";
export type SubStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE" | "TRIALING";
export type PayStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "EXPIRED";
export type InvoiceStatus = "PENDING" | "PAID" | "VOID" | "REFUNDED";

export interface Plan {
  tier: PlanTier;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  maxAccounts: number;
  maxLotSize: number;
  maxLeverage: number;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface Subscription {
  id: string;
  tier: PlanTier;
  status: SubStatus;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  cancelledAt: string | null;
}

export interface UsdtPaymentInfo {
  paymentId: string;
  amountUsd: number;
  amountUsdt: number;
  depositAddress: string;
  network: string;
  qrCodeDataUrl: string;
  paymentWindowExpires: string;
  explorerUrl: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: PayStatus;
  depositAddress: string | null;
  cryptoAmount: number | null;
  txHash: string | null;
  confirmations: number;
  paymentWindowExpires: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  tier: string;
  billingCycle: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidAt: string | null;
}

// --------------------------------------------------------------------
//  Mock data
// --------------------------------------------------------------------

const DEPOSIT_WALLET = "TQn9Y2khEsLJW1ChVWFkMe54m9QjR6VrNe";

const PLANS: Plan[] = [
  {
    tier: "FREE",
    name: "Free",
    description: "For new traders exploring automation",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "USD",
    maxAccounts: 1,
    maxLotSize: 0.01,
    maxLeverage: 20,
    features: ["1 active bot", "3 symbols", "Basic strategies", "Daily email report"],
    isActive: true,
    sortOrder: 0,
  },
  {
    tier: "PRO",
    name: "Pro",
    description: "For serious traders scaling their edge",
    priceMonthly: 79,
    priceYearly: 790,
    currency: "USD",
    maxAccounts: 3,
    maxLotSize: 0.5,
    maxLeverage: 50,
    features: ["3 active bots", "Unlimited symbols", "Full strategy library", "AI signal predictions", "Advanced analytics", "Priority execution"],
    isActive: true,
    sortOrder: 1,
  },
  {
    tier: "VIP",
    name: "VIP",
    description: "For professionals & money managers",
    priceMonthly: 499,
    priceYearly: 4990,
    currency: "USD",
    maxAccounts: 20,
    maxLotSize: 10,
    maxLeverage: 200,
    features: ["Unlimited bots", "Unlimited symbols + VPS", "Custom strategy development", "Real-time AI signal engine", "Lowest latency execution", "White-label & API access", "Dedicated account manager", "Exclusive event invitations"],
    isActive: true,
    sortOrder: 2,
  },
];

// Simulated current subscription
let mockSubscription: Subscription | null = {
  id: "sub-001",
  tier: "PRO",
  status: "ACTIVE",
  billingCycle: "MONTHLY",
  amount: 79,
  currency: "USD",
  startDate: "2026-06-09T00:00:00.000Z",
  endDate: "2026-08-09T00:00:00.000Z",
  cancelledAt: null,
};

let mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2026-0007",
    tier: "PRO",
    billingCycle: "MONTHLY",
    subtotal: 79,
    discount: 0,
    tax: 0,
    total: 79,
    currency: "USD",
    status: "PAID",
    issueDate: "2026-07-09T00:00:00.000Z",
    dueDate: "2026-07-09T00:00:00.000Z",
    paidAt: "2026-07-09T00:05:00.000Z",
  },
  {
    id: "inv-002",
    number: "INV-2026-0006",
    tier: "PRO",
    billingCycle: "MONTHLY",
    subtotal: 79,
    discount: 0,
    tax: 0,
    total: 79,
    currency: "USD",
    status: "PAID",
    issueDate: "2026-06-09T00:00:00.000Z",
    dueDate: "2026-06-09T00:00:00.000Z",
    paidAt: "2026-06-09T00:03:00.000Z",
  },
  {
    id: "inv-003",
    number: "INV-2026-0005",
    tier: "PRO",
    billingCycle: "MONTHLY",
    subtotal: 79,
    discount: 0,
    tax: 0,
    total: 79,
    currency: "USD",
    status: "PAID",
    issueDate: "2026-05-09T00:00:00.000Z",
    dueDate: "2026-05-09T00:00:00.000Z",
    paidAt: "2026-05-09T00:04:00.000Z",
  },
];

// Active payment being polled
let activePayment: Payment | null = null;
let autoConfirmTimer: ReturnType<typeof setTimeout> | null = null;

// --------------------------------------------------------------------
//  QR code generation (SVG data URL)
// --------------------------------------------------------------------

function generateQrSvg(text: string): string {
  // Simple deterministic pattern QR (visual representation)
  const cellSize = 5;
  const size = 29;
  const margin = 16;
  const total = size * cellSize + margin * 2;

  // Use a simple hash to generate the pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }

  const cells: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Finder patterns at 3 corners
      const isFinder =
        (x < 7 && y < 7) ||
        (x >= size - 7 && y < 7) ||
        (x < 7 && y >= size - 7);
      const inFinderBorder =
        isFinder &&
        ((x === 0 || x === 6 || y === 0 || y === 6 ||
          x === size - 1 || x === size - 7 || y === size - 1 || y === size - 7) ||
         (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
         (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4) ||
         (x >= 2 && x <= 4 && y >= size - 5 && y <= size - 3));

      const seed = ((hash >> ((y * size + x) % 31)) + x * 7 + y * 13) & 1;
      const isOn = isFinder ? inFinderBorder : seed === 1;

      if (isOn) {
        const px = margin + x * cellSize;
        const py = margin + y * cellSize;
        cells.push(
          `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" fill="#0a0f0d"/>`
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}"><rect width="${total}" height="${total}" fill="#ffffff" rx="8"/>${cells.join("")}</svg>`;
}

// --------------------------------------------------------------------
//  API functions (mock — mirror server contract)
// --------------------------------------------------------------------

export async function getPlans(): Promise<Plan[]> {
  await delay(300);
  return PLANS;
}

export async function getMySubscription(): Promise<{
  subscription: Subscription | null;
  invoices: Invoice[];
}> {
  await delay(400);
  return { subscription: mockSubscription, invoices: mockInvoices };
}

export async function subscribe(
  tier: PlanTier,
  billingCycle: BillingCycle
): Promise<{
  payment: Payment;
  usdt: UsdtPaymentInfo;
  invoiceNumber: string;
}> {
  await delay(600);
  const plan = PLANS.find((p) => p.tier === tier)!;
  const amount =
    billingCycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;

  if (tier === "FREE") {
    // Free plan — no payment needed
    mockSubscription = {
      id: `sub-${Date.now()}`,
      tier: "FREE",
      status: "ACTIVE",
      billingCycle: "MONTHLY",
      amount: 0,
      currency: "USD",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 100 * 365 * 86400000).toISOString(),
      cancelledAt: null,
    };
    return {
      payment: {
        id: "free",
        amount: 0,
        status: "COMPLETED",
        depositAddress: null,
        cryptoAmount: null,
        txHash: null,
        confirmations: 0,
        paymentWindowExpires: null,
        completedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      usdt: null as unknown as UsdtPaymentInfo,
      invoiceNumber: "N/A",
    };
  }

  // Paid plan — create USDT payment
  const paymentId = `pay-${Date.now()}`;
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 60 min window
  const qrText = `tron:${DEPOSIT_WALLET}?amount=${amount}&token=USDT&network=TRC20`;
  const qrDataUrl = `data:image/svg+xml;base64,${btoa(generateQrSvg(qrText))}`;

  activePayment = {
    id: paymentId,
    amount,
    status: "PENDING",
    depositAddress: DEPOSIT_WALLET,
    cryptoAmount: amount,
    txHash: null,
    confirmations: 0,
    paymentWindowExpires: expires.toISOString(),
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  const invoiceNumber = `INV-2026-${String(mockInvoices.length + 8).padStart(4, "0")}`;

  // Simulate auto-confirmation after 15 seconds (dev mode)
  if (autoConfirmTimer) clearTimeout(autoConfirmTimer);
  autoConfirmTimer = setTimeout(() => {
    if (activePayment && activePayment.status === "PENDING") {
      activePayment = {
        ...activePayment,
        status: "COMPLETED",
        txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        confirmations: 12,
        completedAt: new Date().toISOString(),
      };

      // Update subscription to active
      const now = new Date();
      const cycleMonths = billingCycle === "YEARLY" ? 12 : 1;
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + cycleMonths);

      mockSubscription = {
        id: `sub-${Date.now()}`,
        tier,
        status: "ACTIVE",
        billingCycle,
        amount,
        currency: "USD",
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        cancelledAt: null,
      };

      // Add invoice
      mockInvoices = [
        {
          id: `inv-${Date.now()}`,
          number: invoiceNumber,
          tier,
          billingCycle,
          subtotal: amount,
          discount: 0,
          tax: 0,
          total: amount,
          currency: "USD",
          status: "PAID",
          issueDate: now.toISOString(),
          dueDate: now.toISOString(),
          paidAt: new Date().toISOString(),
        },
        ...mockInvoices,
      ];
    }
  }, 15000);

  return {
    payment: activePayment,
    usdt: {
      paymentId,
      amountUsd: amount,
      amountUsdt: amount,
      depositAddress: DEPOSIT_WALLET,
      network: "TRC20",
      qrCodeDataUrl: qrDataUrl,
      paymentWindowExpires: expires.toISOString(),
      explorerUrl: `https://tronscan.org/#/address/${DEPOSIT_WALLET}`,
    },
    invoiceNumber,
  };
}

export async function renewSubscription(
  subscriptionId: string
): Promise<{
  payment: Payment;
  usdt: UsdtPaymentInfo;
  invoiceNumber: string;
}> {
  if (!mockSubscription) throw new Error("No active subscription");
  return subscribe(mockSubscription.tier, mockSubscription.billingCycle);
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<{ subscription: Subscription }> {
  await delay(500);
  if (mockSubscription) {
    mockSubscription = {
      ...mockSubscription,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
    };
  }
  // Void pending invoices
  mockInvoices = mockInvoices.map((inv) =>
    inv.status === "PENDING" ? { ...inv, status: "VOID" as InvoiceStatus } : inv
  );
  return { subscription: mockSubscription! };
}

export async function pollPaymentStatus(paymentId: string): Promise<Payment> {
  await delay(200);
  if (activePayment && activePayment.id === paymentId) {
    return { ...activePayment };
  }
  throw new Error("Payment not found");
}

// --------------------------------------------------------------------
//  Helpers
// --------------------------------------------------------------------

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
