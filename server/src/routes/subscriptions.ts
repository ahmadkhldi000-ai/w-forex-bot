import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/config/db.js";
import { success, handleError, AppError } from "@/utils/errors.js";
import { requireUser } from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";

const router = Router();

// --------------------------------------------------------------------
//  GET /api/subscriptions/me  — current subscription
// --------------------------------------------------------------------
router.get("/me", requireUser, async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    return success(res, sub);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/subscriptions/history
// --------------------------------------------------------------------
router.get("/history", requireUser, async (req, res) => {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    return success(res, subs);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  PATCH /api/subscriptions/copy-settings
//  Update copy-trading risk settings.
//  NOTE: High leverage / high risk triggers contextual warning on FRONTEND,
//        but we also log it here for audit.
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

    // Flag high-risk settings for audit (contextual warning handled in UI)
    const isHighRisk =
      input.copyRiskPercent > 5 || input.copyMaxLeverage > 100;

    const user = await prisma.user.update({
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
      details: { ...input, highRisk: isHighRisk },
    });

    return success(res, { ...user, highRisk: isHighRisk });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  GET /api/subscriptions/plans — public pricing plans
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

export default router;
