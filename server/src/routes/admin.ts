import { Router } from "express";
import { prisma } from "@/config/db.js";
import { success, handleError, AppError } from "@/utils/errors.js";
import {
  requireAdmin,
  requirePermission,
} from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";
import type { UserStatus, SubscriptionTier } from "@prisma/client";

const router = Router();

router.use(requireAdmin);

// ====================================================================
//  DASHBOARD OVERVIEW
// ====================================================================
router.get("/overview", requirePermission("USERS_VIEW"), async (_req, res) => {
  const [
    totalUsers,
    activeSubs,
    totalRevenue,
    todayTrades,
    openPositions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.trade.count({
      where: { openTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    prisma.trade.count({ where: { status: "OPEN" } }),
  ]);

  // Revenue last 7 days (sparkline data)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPayments = await prisma.payment.findMany({
    where: { status: "COMPLETED", completedAt: { gte: sevenDaysAgo } },
    select: { amount: true, completedAt: true },
  });

  return success(res, {
    totalUsers,
    activeSubs,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    todayTrades,
    openPositions,
    revenueSparkline: recentPayments,
  });
});

// ====================================================================
//  USERS MANAGEMENT
// ====================================================================
router.get("/users", requirePermission("USERS_VIEW"), async (req, res) => {
  try {
    const { search, status, role, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const where = {
      ...(status && { status: status as UserStatus }),
      ...(role && { role: role as any }),
      ...(search && {
        OR: [
          { email: { contains: search as string, mode: "insensitive" as const } },
          { name: { contains: search as string, mode: "insensitive" as const } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, name: true, role: true, status: true,
          riskAccepted: true, copyTradingEnabled: true,
          lastLoginAt: true, lastLoginIp: true, createdAt: true,
          subscriptions: {
            where: { status: "ACTIVE" },
            select: { tier: true, endDate: true },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, { users, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return handleError(res, err);
  }
});

// Suspend user
router.patch("/users/:id/suspend", requirePermission("USERS_MANAGE"), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" },
      select: { id: true, email: true, status: true },
    });
    await auditLog(req, { action: "UPDATE", resource: "user-suspend", resourceId: user.id });
    return success(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

// Activate user
router.patch("/users/:id/activate", requirePermission("USERS_MANAGE"), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: "ACTIVE" },
      select: { id: true, email: true, status: true },
    });
    await auditLog(req, { action: "UPDATE", resource: "user-activate", resourceId: user.id });
    return success(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

// Change user role
router.patch("/users/:id/role", requirePermission("USERS_MANAGE"), async (req, res) => {
  try {
    const role = req.body.role as any;
    if (!["USER", "VIP", "PREMIUM"].includes(role)) {
      throw new AppError(400, "Invalid role");
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, role: true },
    });
    await auditLog(req, { action: "UPDATE", resource: "user-role", resourceId: user.id, details: { role } });
    return success(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  SUBSCRIPTIONS MANAGEMENT
// ====================================================================
router.get("/subscriptions", requirePermission("SUBS_VIEW"), async (req, res) => {
  try {
    const { status, tier, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const where = {
      ...(status && { status: status as any }),
      ...(tier && { tier: tier as SubscriptionTier }),
    };

    const [subs, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.subscription.count({ where }),
    ]);

    return success(res, { subscriptions: subs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return handleError(res, err);
  }
});

// Extend subscription
router.patch("/subscriptions/:id/extend", requirePermission("SUBS_MANAGE"), async (req, res) => {
  try {
    const { days } = req.body as { days: number };
    if (!days || days < 1) throw new AppError(400, "days required");

    const sub = await prisma.subscription.findUnique({ where: { id: req.params.id } });
    if (!sub) throw new AppError(404, "Subscription not found");

    const newEnd = new Date(Math.max(sub.endDate.getTime(), Date.now()) + days * 24 * 60 * 60 * 1000);
    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { endDate: newEnd, status: "ACTIVE" },
    });
    await auditLog(req, { action: "SUBSCRIPTION_CHANGE", resource: "subscription", resourceId: sub.id, details: { days } });
    return success(res, updated);
  } catch (err) {
    return handleError(res, err);
  }
});

// Cancel subscription
router.patch("/subscriptions/:id/cancel", requirePermission("SUBS_MANAGE"), async (req, res) => {
  try {
    const updated = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    });
    await auditLog(req, { action: "SUBSCRIPTION_CHANGE", resource: "subscription", resourceId: updated.id });
    return success(res, updated);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  PAYMENTS MANAGEMENT
// ====================================================================
router.get("/payments", requirePermission("PAYMENTS_VIEW"), async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, parseInt(limit as string, 10));

    const where = status ? { status: status as any } : {};
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.payment.count({ where }),
    ]);
    return success(res, { payments, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return handleError(res, err);
  }
});

// Manually confirm payment
router.patch("/payments/:id/confirm", requirePermission("PAYMENTS_MANAGE"), async (req, res) => {
  try {
    const updated = await prisma.payment.update({
      where: { id: req.params.id },
      data: { status: "COMPLETED", completedAt: new Date(), ipnVerified: true },
    });
    await auditLog(req, { action: "PAYMENT", resource: "payment-confirm", resourceId: updated.id });
    return success(res, updated);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  AUDIT LOGS
// ====================================================================
router.get("/logs", requirePermission("LOGS_VIEW"), async (req, res) => {
  try {
    const { action, page = "1", limit = "50" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(200, parseInt(limit as string, 10));

    const where = action ? { action: action as any } : {};
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { email: true } },
          admin: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.auditLog.count({ where }),
    ]);
    return success(res, { logs, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  REPORTS (export)
// ====================================================================
router.get("/reports/revenue", requirePermission("REPORTS_VIEW"), async (req, res) => {
  try {
    const days = parseInt((req.query.days as string) ?? "30", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const payments = await prisma.payment.findMany({
      where: { status: "COMPLETED", completedAt: { gte: since } },
      select: {
        amount: true, currency: true, method: true,
        completedAt: true, description: true,
        user: { select: { email: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    const total = payments.reduce((s, p) => s + Number(p.amount), 0);

    return success(res, { period: `${days} days`, totalRevenue: total, count: payments.length, payments });
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  SETTINGS
// ====================================================================
router.get("/settings", requirePermission("SETTINGS_VIEW"), async (_req, res) => {
  const settings = await prisma.setting.findMany({ orderBy: { category: "asc" } });
  return success(res, settings);
});

router.patch("/settings/:key", requirePermission("SETTINGS_MANAGE"), async (req, res) => {
  try {
    const { value } = req.body as { value: string };
    const setting = await prisma.setting.update({
      where: { key: req.params.key },
      data: { value, updatedBy: req.admin!.id },
    });
    await auditLog(req, { action: "SETTINGS_CHANGE", resource: "setting", resourceId: setting.id, details: { key: req.params.key } });
    return success(res, setting);
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
