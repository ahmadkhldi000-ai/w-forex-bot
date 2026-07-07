import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { authenticator } from "otplib";
import { prisma } from "@/config/db.js";
import {
  hashPassword,
  verifyPassword,
  signAdminToken,
  getClientIp,
} from "@/utils/crypto.js";
import { success, error, handleError, AppError } from "@/utils/errors.js";
import { requireAdmin, requirePermission, requireSuperAdmin } from "@/middleware/auth.js";
import { auditLog, ALL_PERMISSIONS } from "@/middleware/audit.js";
import { sendEmail, emailTemplates } from "@/services/notifications.js";
import { config } from "@/config/env.js";
import type { AdminRole, Permission } from "@prisma/client";

const router = Router();

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MIN = 30;

// --------------------------------------------------------------------
//  Helpers
// --------------------------------------------------------------------
async function checkLockout(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { lockedUntil: true, failedAttempts: true },
  });
  if (!admin) return;
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const mins = Math.ceil((admin.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(423, `الحساب مقفل. حاول بعد ${mins} دقيقة`);
  }
}

async function registerFailedAttempt(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { failedAttempts: true },
  });
  if (!admin) return;
  const attempts = admin.failedAttempts + 1;
  const shouldLock = attempts >= LOCKOUT_THRESHOLD;
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      failedAttempts: attempts,
      lockedUntil: shouldLock
        ? new Date(Date.now() + LOCKOUT_DURATION_MIN * 60 * 1000)
        : null,
    },
  });
  if (shouldLock) {
    throw new AppError(
      423,
      `تم قفل الحساب بعد ${LOCKOUT_THRESHOLD} محاولات فاشلة لمدة ${LOCKOUT_DURATION_MIN} دقيقة`
    );
  }
}

async function resetFailedAttempts(adminId: string) {
  await prisma.admin.update({
    where: { id: adminId },
    data: { failedAttempts: 0, lockedUntil: null },
  });
}

// --------------------------------------------------------------------
//  POST /api/admin/auth/login  (with 2FA support)
// --------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  totp: z.string().optional(), // 6-digit code if 2FA enabled
});

router.post("/auth/login", async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const ip = getClientIp(req);
    req.clientIp = ip;

    const admin = await prisma.admin.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (!admin) {
      throw new AppError(401, "بيانات الدخول غير صحيحة");
    }

    await checkLockout(admin.id);

    const ok = await verifyPassword(input.password, admin.passwordHash);
    if (!ok) {
      await registerFailedAttempt(admin.id);
      await auditLog(req, {
        action: "FAILED_LOGIN",
        resource: "admin",
        resourceId: admin.id,
      });
      throw new AppError(401, "بيانات الدخول غير صحيحة");
    }

    // 2FA check
    if (admin.twoFactorEnabled && admin.twoFactorSecret) {
      if (!input.totp) {
        throw new AppError(200, "2FA_REQUIRED");
      }
      const validTotp = authenticator.verify({
        token: input.totp,
        secret: admin.twoFactorSecret,
      });
      if (!validTotp) {
        await registerFailedAttempt(admin.id);
        throw new AppError(401, "رمز التحقق غير صحيح");
      }
    }

    await resetFailedAttempts(admin.id);

    // Single session: invalidate old sessions
    await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });

    // Create new session
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        token,
        ipAddress: ip,
        userAgent: req.headers["user-agent"],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });

    await auditLog(req, { action: "LOGIN", resource: "admin", resourceId: admin.id });

    // New device notification
    if (admin.lastLoginIp && admin.lastLoginIp !== ip) {
      sendEmail({
        to: admin.email,
        ...emailTemplates.adminNewDevice({
          email: admin.email,
          ip,
          device: req.headers["user-agent"] ?? "Unknown",
        }),
      });
    }

    // Issue JWT
    const jwtToken = signAdminToken({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions as Permission[],
    });

    return success(res, {
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        forcePasswordChange: admin.forcePasswordChange,
        twoFactorEnabled: admin.twoFactorEnabled,
      },
      token: jwtToken,
    });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  POST /api/admin/auth/change-password  (forced on first login)
// --------------------------------------------------------------------
const changePwSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(12, "12 حرف على الأقل"),
});

router.post("/auth/change-password", requireAdmin, async (req, res) => {
  try {
    const input = changePwSchema.parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw new AppError(404, "Admin not found");

    const ok = await verifyPassword(input.currentPassword, admin.passwordHash);
    if (!ok) throw new AppError(401, "كلمة المرور الحالية غير صحيحة");

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash: await hashPassword(input.newPassword),
        forcePasswordChange: false,
      },
    });

    await auditLog(req, {
      action: "UPDATE",
      resource: "admin-password",
      resourceId: admin.id,
    });

    return success(res, { message: "تم تغيير كلمة المرور" });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  2FA setup (generate secret + QR)
// --------------------------------------------------------------------
router.post("/auth/2fa/setup", requireAdmin, async (req, res) => {
  try {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(req.admin!.email, "W-Forex-Admin", secret);

    // Store temporarily — only activate after verification
    await prisma.admin.update({
      where: { id: req.admin!.id },
      data: { twoFactorSecret: secret },
    });

    return success(res, { secret, otpauthUri: otpauth });
  } catch (err) {
    return handleError(res, err);
  }
});

router.post("/auth/2fa/verify", requireAdmin, async (req, res) => {
  try {
    const { totp } = z.object({ totp: z.string() }).parse(req.body);
    const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });
    if (!admin?.twoFactorSecret) throw new AppError(400, "2FA not set up");

    const valid = authenticator.verify({ token: totp, secret: admin.twoFactorSecret });
    if (!valid) throw new AppError(401, "رمز غير صحيح");

    await prisma.admin.update({
      where: { id: admin.id },
      data: { twoFactorEnabled: true },
    });

    await auditLog(req, { action: "UPDATE", resource: "admin-2fa", resourceId: admin.id });
    return success(res, { enabled: true });
  } catch (err) {
    return handleError(res, err);
  }
});

// --------------------------------------------------------------------
//  Admin logout (invalidate session)
// --------------------------------------------------------------------
router.post("/auth/logout", requireAdmin, async (req, res) => {
  await prisma.adminSession.deleteMany({ where: { adminId: req.admin!.id } });
  await auditLog(req, { action: "LOGOUT", resource: "admin", resourceId: req.admin!.id });
  return success(res, { message: "Logged out" });
});

// ====================================================================
//  ADMIN MANAGEMENT (Super Admin only)
// ====================================================================

router.post("/admins", requireAdmin, requireSuperAdmin, async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      username: z.string().min(3),
      name: z.string().optional(),
      password: z.string().min(12),
      role: z.enum(["ADMIN", "MODERATOR"]).default("ADMIN"),
      permissions: z.array(z.string()).default([]),
    });
    const input = schema.parse(req.body);

    const existing = await prisma.admin.findFirst({
      where: { OR: [{ email: input.email.toLowerCase() }, { username: input.username }] },
    });
    if (existing) throw new AppError(409, "Admin already exists");

    const newAdmin = await prisma.admin.create({
      data: {
        email: input.email.toLowerCase(),
        username: input.username,
        name: input.name,
        passwordHash: await hashPassword(input.password),
        role: input.role as AdminRole,
        permissions: input.permissions as Permission[],
        forcePasswordChange: true,
      },
      select: { id: true, email: true, username: true, role: true, permissions: true },
    });

    await auditLog(req, {
      action: "CREATE",
      resource: "admin",
      resourceId: newAdmin.id,
      details: { role: input.role },
    });

    return success(res, newAdmin, 201);
  } catch (err) {
    return handleError(res, err);
  }
});

router.get("/admins", requireAdmin, requirePermission("ADMINS_MANAGE"), async (_req, res) => {
  const admins = await prisma.admin.findMany({
    select: {
      id: true, email: true, username: true, name: true, role: true,
      permissions: true, isActive: true, twoFactorEnabled: true,
      lastLoginAt: true, lastLoginIp: true, createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return success(res, admins);
});

export default router;
