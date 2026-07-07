import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/config/db.js";
import {
  hashPassword,
  verifyPassword,
  signUserToken,
  getClientIp,
} from "@/utils/crypto.js";
import { success, error, handleError, AppError } from "@/utils/errors.js";
import { requireUser } from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";
import type { LogAction } from "@prisma/client";

const router = Router();

// --------------------------------------------------------------------
//  VALIDATION SCHEMAS
// --------------------------------------------------------------------

const registerSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  name: z.string().min(2).max(80).optional(),
  phone: z.string().optional(),
  // REQUIRED: risk consent click-through agreement
  riskAccepted: z.literal(true, {
    errorMap: () => ({ message: "يجب الموافقة على تحذير المخاطر" }),
  }),
  riskAcceptedIp: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// --------------------------------------------------------------------
//  REGISTER
// --------------------------------------------------------------------
router.post("/register", async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);
    const ip = getClientIp(req);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      throw new AppError(409, "هذا البريد مسجّل مسبقاً");
    }

    // Create user WITH risk consent timestamp (legal requirement)
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash: await hashPassword(input.password),
        name: input.name,
        phone: input.phone,
        riskAccepted: true,
        riskAcceptedAt: new Date(),
        riskAcceptedIp: ip,
        status: "ACTIVE",
        emailVerified: false,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Free subscription on signup
    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier: "FREE",
        status: "ACTIVE",
        billingCycle: "MONTHLY",
        amount: 0,
        currency: "USD",
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    // Record the consent in audit logs (compliance)
    req.clientIp = ip;
    await auditLog(req, {
      action: "RISK_CONSENT",
      resource: "user",
      resourceId: user.id,
      details: {
        acceptedAt: new Date().toISOString(),
        ip,
        userAgent: req.headers["user-agent"],
      },
    });
    await auditLog(req, {
      action: "REGISTER",
      resource: "user",
      resourceId: user.id,
    });

    const token = signUserToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return success(res, { user, token }, 201);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  LOGIN
// --------------------------------------------------------------------
router.post("/login", async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const ip = getClientIp(req);
    req.clientIp = ip;

    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!user) {
      await auditLog(req, { action: "FAILED_LOGIN", details: { email: input.email } });
      throw new AppError(401, "بيانات الدخول غير صحيحة");
    }

    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      await auditLog(req, { action: "FAILED_LOGIN", details: { email: input.email } });
      throw new AppError(401, "بيانات الدخول غير صحيحة");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError(403, `الحساب ${user.status === "SUSPENDED" ? "موقوف" : "غير مفعّل"}`);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    await auditLog(req, { action: "LOGIN", resource: "user", resourceId: user.id });

    const token = signUserToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return success(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        riskAccepted: user.riskAccepted,
      },
      token,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  ME (current user profile)
// --------------------------------------------------------------------
router.get("/me", requireUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        riskAccepted: true,
        riskAcceptedAt: true,
        copyTradingEnabled: true,
        copyRiskPercent: true,
        copyMaxLeverage: true,
        copyLotSize: true,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError(404, "User not found");
    return success(res, user);
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  LOGOUT (stateless JWT — client just discards token, but log it)
// --------------------------------------------------------------------
router.post("/logout", requireUser, async (req, res) => {
  await auditLog(req, { action: "LOGOUT", resource: "user", resourceId: req.user!.id });
  return success(res, { message: "Logged out" });
});

export default router;
