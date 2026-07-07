import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/config/db.js";
import {
  createPaymentRequest,
  verifyPayment,
  verifyIpnSignature,
  generatePaymentLink,
} from "@/services/paymento.js";
import { success, error, handleError, AppError } from "@/utils/errors.js";
import { requireUser } from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";
import { sendEmail, emailTemplates } from "@/services/notifications.js";
import type { PaymentStatus } from "@prisma/client";

const router = Router();

// --------------------------------------------------------------------
//  POST /api/payments/create
//  Initiates a Paymento payment request (Step 1-3 of the flow)
// --------------------------------------------------------------------
const createSchema = z.object({
  planTier: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  couponCode: z.string().optional(),
  method: z
    .enum(["USDT_TRC20", "USDT_ERC20", "BTC", "ETH", "TRX"])
    .optional(),
});

// Plan prices (could be moved to DB Plan table)
const PLAN_PRICES: Record<string, { monthly: number; yearly: number }> = {
  BASIC: { monthly: 29, yearly: 290 },
  PRO: { monthly: 79, yearly: 790 },
  ENTERPRISE: { monthly: 199, yearly: 1990 },
};

router.post("/create", requireUser, async (req, res) => {
  try {
    const input = createSchema.parse(req.body);
    const prices = PLAN_PRICES[input.planTier];
    if (!prices) throw new AppError(400, "Invalid plan");

    let amount = input.billingCycle === "YEARLY" ? prices.yearly : prices.monthly;

    // Coupon check
    let couponId: string | undefined;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: input.couponCode },
      });
      if (coupon && coupon.isActive && (coupon.maxUses === -1 || coupon.usedCount < coupon.maxUses)) {
        amount = amount * (1 - coupon.discountPercent / 100);
        couponId = coupon.id;
      }
    }

    // Create payment record (status PENDING)
    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        amount,
        currency: "USD",
        status: "PENDING",
        method: input.method,
        description: `W-Forex ${input.planTier} (${input.billingCycle})`,
      },
    });

    // Step 1-3: Request to Paymento
    const result = await createPaymentRequest({
      amount,
      currency: "USD",
      description: payment.description ?? "Subscription",
      orderId: payment.id,
      userId: req.user!.id,
      method: input.method,
    });

    // Store token
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentoToken: result.token, paymentoTxId: result.paymentoId },
    });

    await auditLog(req, {
      action: "PAYMENT",
      resource: "payment",
      resourceId: payment.id,
      details: { amount, plan: input.planTier, token: result.token },
    });

    return success(res, {
      paymentId: payment.id,
      token: result.token,
      paymentUrl: result.paymentUrl,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  POST /api/payments/ipn  (Paymento webhook — Step 4)
//  Raw body needed for HMAC verification. Configured via express.raw.
// --------------------------------------------------------------------
router.post("/ipn", async (req, res) => {
  try {
    const rawBody = req.body; // raw buffer (see app setup)
    const signature = req.headers["x-paymento-signature"] as string;
    if (!signature) {
      return error(res, "Missing signature", 401);
    }

    // HMAC verify
    const valid = verifyIpnSignature(
      typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"),
      signature
    );
    if (!valid) {
      return error(res, "Invalid signature", 401);
    }

    const payload = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    const token = payload.token ?? payload.order_id;
    const status = (payload.status ?? "").toUpperCase();

    const payment = await prisma.payment.findFirst({
      where: { paymentoToken: token },
    });
    if (!payment) return error(res, "Payment not found", 404);

    // Mark IPN received & store raw payload
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        ipnReceived: true,
        ipnPayload: payload as object,
      },
    });

    // Step 5: Verify before activating
    if (!payment.paymentoToken) {
      return error(res, "No token to verify", 400);
    }
    const verification = await verifyPayment(payment.paymentoToken);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { ipnVerified: verification.verified },
    });

    if (status === "PAID" && verification.verified) {
      await activateSubscription(payment.id);
    }

    return success(res, { received: true });
  } catch (err) {
    console.error("[IPN] error:", err);
    return error(res, "IPN processing failed", 500);
  }
});

// --------------------------------------------------------------------
//  Activate subscription after verified payment
// --------------------------------------------------------------------
async function activateSubscription(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
    // Mark payment completed
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED" as PaymentStatus,
        completedAt: new Date(),
      },
    });

    // Parse plan from description
    const planMatch = payment.description?.match(/(BASIC|PRO|ENTERPRISE)/);
    const tier = planMatch?.[1] as "BASIC" | "PRO" | "ENTERPRISE" | undefined;
    if (!tier) return;

    // Create/extend subscription
    const now = new Date();
    const durationDays = payment.description?.includes("YEARLY") ? 365 : 30;
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await tx.subscription.create({
      data: {
        userId: payment.userId!,
        tier,
        status: "ACTIVE",
        billingCycle: payment.description?.includes("YEARLY") ? "YEARLY" : "MONTHLY",
        amount: payment.amount,
        currency: payment.currency,
        startDate: now,
        endDate,
      },
    });

    // Upgrade user role
    await tx.user.update({
      where: { id: payment.userId! },
      data: {
        role: tier === "PRO" ? "VIP" : tier === "ENTERPRISE" ? "PREMIUM" : "USER",
      },
    });

    // Notification + email
    await tx.notification.create({
      data: {
        userId: payment.userId!,
        type: "payment",
        title: "تم تفعيل اشتراكك ✅",
        message: `تم تأكيد دفعتك بنجاح. اشتراك ${tier} مفعّل حتى ${endDate.toLocaleDateString("ar")}.`,
      },
    });
  });

  // Email (outside transaction)
  if (payment.user?.email) {
    sendEmail({
      to: payment.user.email,
      ...emailTemplates.paymentConfirmation({
        name: payment.user.name ?? "المستخدم",
        amount: Number(payment.amount),
        plan: payment.description ?? "Subscription",
      }),
    });
  }
}

// --------------------------------------------------------------------
//  GET /api/payments/history
// --------------------------------------------------------------------
router.get("/history", requireUser, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return success(res, payments);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/payments/:id/status
// --------------------------------------------------------------------
router.get("/:id/status", requireUser, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      select: { id: true, status: true, amount: true, method: true, completedAt: true },
    });
    if (!payment) throw new AppError(404, "Payment not found");
    return success(res, payment);
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
