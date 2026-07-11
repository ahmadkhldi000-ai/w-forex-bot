import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/config/db.js";
import { success, handleError, AppError } from "@/utils/errors.js";
import { requireUser } from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";
import { config } from "@/config/env.js";
import {
  createUsdtPaymentRequest,
  confirmUsdtPayment,
  scheduleDevAutoConfirm,
  generateInvoiceNumber,
  getDepositAddress,
} from "@/services/usdt-trc20.js";

const router = Router();

// --------------------------------------------------------------------
//  GET /plans — list all active plans
// --------------------------------------------------------------------
router.get("/plans", async (_req, res) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return success(res, plans);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /me — get current user's subscription
// --------------------------------------------------------------------
router.get("/me", requireUser, async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            depositAddress: true,
            txHash: true,
            cryptoAmount: true,
            paymentWindowExpires: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
    });

    const invoices = sub
      ? await prisma.invoice.findMany({
          where: { subscriptionId: sub.id },
          orderBy: { issueDate: "desc" },
          take: 10,
        })
      : [];

    return success(res, { subscription: sub, invoices });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  POST /subscribe — create subscription + initiate USDT payment
// --------------------------------------------------------------------
const subscribeSchema = z.object({
  tier: z.enum(["FREE", "PRO", "VIP", "BASIC", "ENTERPRISE"]),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
});

router.post("/subscribe", requireUser, async (req, res) => {
  try {
    const input = subscribeSchema.parse(req.body);
    const userId = req.user!.id;

    // FREE plan — no payment needed
    if (input.tier === "FREE") {
      const plan = await prisma.plan.findUnique({ where: { tier: "FREE" } });
      if (!plan) throw new AppError(404, "FREE plan not found");

      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 100); // FREE = lifetime

      // Cancel any existing active subscription
      await prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED", cancelledAt: now },
      });

      const sub = await prisma.subscription.create({
        data: {
          userId,
          tier: "FREE",
          status: "ACTIVE",
          billingCycle: "MONTHLY",
          amount: 0,
          currency: "USD",
          startDate: now,
          endDate,
        },
      });

      await auditLog(req, {
        action: "SUBSCRIPTION_CHANGE",
        resource: "subscription",
        resourceId: sub.id,
      });

      return success(res, { subscription: sub, payment: null }, 201);
    }

    // Paid plan — look up the plan pricing
    const plan = await prisma.plan.findUnique({ where: { tier: input.tier } });
    if (!plan) throw new AppError(404, `${input.tier} plan not found`);
    if (!plan.isActive) throw new AppError(400, `${input.tier} plan is not available`);

    const amount =
      input.billingCycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;
    if (Number(amount) <= 0) throw new AppError(400, "Invalid plan amount");

    // Check for existing active subscription — if upgrading, cancel old one
    const existing = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });
    if (existing && existing.tier !== "FREE") {
      // Cancel the old subscription
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
    }

    // Create subscription (in TRIALING state until payment confirms)
    const now = new Date();
    const startDate = new Date(now);
    const cycleMonths = input.billingCycle === "YEARLY" ? 12 : 1;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + cycleMonths);

    const sub = await prisma.subscription.create({
      data: {
        userId,
        tier: input.tier,
        status: "TRIALING",
        billingCycle: input.billingCycle,
        amount,
        currency: "USD",
        startDate,
        endDate,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        subscriptionId: sub.id,
        amount,
        currency: "USD",
        method: "USDT_TRC20",
        status: "PENDING",
        depositAddress: getDepositAddress(),
        cryptoNetwork: config.usdt.network,
        cryptoAmount: amount, // 1 USDT = 1 USD
        paymentWindowExpires: new Date(
          Date.now() + config.usdt.paymentWindowMinutes * 60 * 1000
        ),
        description: `${plan.name} — ${input.billingCycle.toLowerCase()} subscription`,
      },
    });

    // Create invoice
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        userId,
        subscriptionId: sub.id,
        paymentId: payment.id,
        tier: input.tier,
        billingCycle: input.billingCycle,
        subtotal: amount,
        discount: 0,
        tax: 0,
        total: amount,
        currency: "USD",
        status: "PENDING",
        customerEmail: req.user!.email,
        dueDate: new Date(Date.now() + config.usdt.paymentWindowMinutes * 60 * 1000),
      },
    });

    // Generate USDT payment request (QR code, etc.)
    const usdtRequest = await createUsdtPaymentRequest(payment.id, Number(amount));

    // Dev mode: schedule auto-confirmation
    if (config.usdt.devAutoConfirmSeconds > 0) {
      scheduleDevAutoConfirm(payment.id, async () => {
        const fakeTxHash =
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        await confirmUsdtPayment(payment.id, fakeTxHash);
      });
    }

    await auditLog(req, {
      action: "SUBSCRIPTION_CHANGE",
      resource: "subscription",
      resourceId: sub.id,
    });

    return success(
      res,
      {
        subscription: sub,
        payment: {
          id: payment.id,
          amount: Number(payment.amount),
          status: payment.status,
          depositAddress: payment.depositAddress,
          cryptoNetwork: payment.cryptoNetwork,
          cryptoAmount: Number(payment.cryptoAmount),
          paymentWindowExpires: payment.paymentWindowExpires,
        },
        invoice: {
          id: invoice.id,
          number: invoice.number,
          status: invoice.status,
          total: Number(invoice.total),
        },
        usdt: usdtRequest,
      },
      201
    );
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  POST /renew — renew an expired or active subscription
// --------------------------------------------------------------------
const renewSchema = z.object({
  subscriptionId: z.string(),
});

router.post("/renew", requireUser, async (req, res) => {
  try {
    const input = renewSchema.parse(req.body);
    const userId = req.user!.id;

    const sub = await prisma.subscription.findFirst({
      where: { id: input.subscriptionId, userId },
    });
    if (!sub) throw new AppError(404, "Subscription not found");
    if (sub.tier === "FREE") throw new AppError(400, "FREE plan cannot be renewed");

    const plan = await prisma.plan.findUnique({ where: { tier: sub.tier } });
    if (!plan) throw new AppError(404, "Plan not found");

    const amount =
      sub.billingCycle === "YEARLY" ? plan.priceYearly : plan.priceMonthly;

    // Create new payment
    const payment = await prisma.payment.create({
      data: {
        userId,
        subscriptionId: sub.id,
        amount,
        currency: "USD",
        method: "USDT_TRC20",
        status: "PENDING",
        depositAddress: getDepositAddress(),
        cryptoNetwork: config.usdt.network,
        cryptoAmount: amount,
        paymentWindowExpires: new Date(
          Date.now() + config.usdt.paymentWindowMinutes * 60 * 1000
        ),
        description: `Renewal — ${plan.name} ${sub.billingCycle.toLowerCase()}`,
      },
    });

    // Create invoice
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        userId,
        subscriptionId: sub.id,
        paymentId: payment.id,
        tier: sub.tier,
        billingCycle: sub.billingCycle,
        subtotal: amount,
        discount: 0,
        tax: 0,
        total: amount,
        currency: "USD",
        status: "PENDING",
        customerEmail: req.user!.email,
        dueDate: new Date(Date.now() + config.usdt.paymentWindowMinutes * 60 * 1000),
      },
    });

    const usdtRequest = await createUsdtPaymentRequest(payment.id, Number(amount));

    // Dev auto-confirm
    if (config.usdt.devAutoConfirmSeconds > 0) {
      scheduleDevAutoConfirm(payment.id, async () => {
        const fakeTxHash =
          "0x" +
          Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("");
        await confirmUsdtPayment(payment.id, fakeTxHash);
      });
    }

    await auditLog(req, {
      action: "SUBSCRIPTION_CHANGE",
      resource: "subscription-renew",
      resourceId: sub.id,
    });

    return success(res, {
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        depositAddress: payment.depositAddress,
        cryptoNetwork: payment.cryptoNetwork,
        cryptoAmount: Number(payment.cryptoAmount),
        paymentWindowExpires: payment.paymentWindowExpires,
      },
      invoice: {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        total: Number(invoice.total),
      },
      usdt: usdtRequest,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  POST /cancel — cancel subscription
// --------------------------------------------------------------------
const cancelSchema = z.object({
  subscriptionId: z.string(),
  reason: z.string().optional(),
});

router.post("/cancel", requireUser, async (req, res) => {
  try {
    const input = cancelSchema.parse(req.body);
    const userId = req.user!.id;

    const sub = await prisma.subscription.findFirst({
      where: { id: input.subscriptionId, userId },
    });
    if (!sub) throw new AppError(404, "Subscription not found");
    if (sub.status === "CANCELLED")
      throw new AppError(400, "Subscription is already cancelled");

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // Void any pending invoices
    await prisma.invoice.updateMany({
      where: { subscriptionId: sub.id, status: "PENDING" },
      data: { status: "VOID" },
    });

    await auditLog(req, {
      action: "SUBSCRIPTION_CHANGE",
      resource: "subscription-cancel",
      resourceId: sub.id,
    });

    return success(res, { subscription: updated });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /payments/:id/status — poll payment status
// --------------------------------------------------------------------
router.get("/payments/:id/status", requireUser, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      select: {
        id: true,
        status: true,
        amount: true,
        depositAddress: true,
        cryptoAmount: true,
        txHash: true,
        confirmations: true,
        paymentWindowExpires: true,
        completedAt: true,
      },
    });
    if (!payment) throw new AppError(404, "Payment not found");

    return success(res, {
      ...payment,
      amount: Number(payment.amount),
      cryptoAmount: payment.cryptoAmount ? Number(payment.cryptoAmount) : null,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /invoices — list user's invoices
// --------------------------------------------------------------------
router.get("/invoices", requireUser, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page) || "1", 10));
    const limit = Math.min(50, parseInt(String(req.query.limit) || "20", 10));

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: req.user!.id },
        orderBy: { issueDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where: { userId: req.user!.id } }),
    ]);

    return success(res, {
      invoices: invoices.map((inv) => ({
        ...inv,
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount),
        tax: Number(inv.tax),
        total: Number(inv.total),
      })),
      total,
      page,
      limit,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /invoices/:id — get single invoice
// --------------------------------------------------------------------
router.get("/invoices/:id", requireUser, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        subscription: {
          select: { tier: true, billingCycle: true },
        },
        payment: {
          select: {
            id: true,
            status: true,
            method: true,
            txHash: true,
            completedAt: true,
            depositAddress: true,
          },
        },
      },
    });
    if (!invoice) throw new AppError(404, "Invoice not found");

    return success(res, {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  Copy-trading settings (existing — preserved)
// --------------------------------------------------------------------
const copySettingsSchema = z.object({
  copyTradingEnabled: z.boolean(),
  copyRiskPercent: z.number().min(0.1).max(100),
  copyMaxLeverage: z.number().int().min(1).max(500),
  copyLotSize: z.number().min(0.01).max(10),
});

router.patch("/copy-settings", requireUser, async (req, res) => {
  try {
    const input = copySettingsSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        copyTradingEnabled: input.copyTradingEnabled,
        copyRiskPercent: input.copyRiskPercent,
        copyMaxLeverage: input.copyMaxLeverage,
        copyLotSize: input.copyLotSize,
      },
      select: {
        id: true,
        copyTradingEnabled: true,
        copyRiskPercent: true,
        copyMaxLeverage: true,
        copyLotSize: true,
      },
    });

    await auditLog(req, {
      action: "UPDATE",
      resource: "copy-settings",
      resourceId: req.user!.id,
    });

    return success(res, updated);
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
