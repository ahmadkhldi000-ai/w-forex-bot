import type { Request, Response, NextFunction } from "express";
import { verifyUserToken, verifyAdminToken, getClientIp } from "@/utils/crypto.js";
import { prisma } from "@/config/db.js";
import { AppError } from "@/utils/errors.js";
import type { Permission } from "@prisma/client";

// Augment Express Request with typed user/admin
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      admin?: {
        id: string;
        email: string;
        role: string;
        permissions: Permission[];
      };
      clientIp?: string;
    }
  }
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  if (req.cookies?.token) return req.cookies.token;
  return null;
}

// ---- User auth ----
export async function requireUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw new AppError(401, "Authentication required");
    const payload = verifyUserToken(token);
    if (!payload) throw new AppError(401, "Invalid or expired token");

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, status: true },
    });
    if (!user) throw new AppError(401, "User not found");
    if (user.status !== "ACTIVE")
      throw new AppError(403, `Account is ${user.status.toLowerCase()}`);

    req.user = { id: user.id, email: user.email, role: user.role };
    req.clientIp = getClientIp(req);
    next();
  } catch (err) {
    next(err);
  }
}

// Optional user — doesn't fail if no token
export async function optionalUser(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const payload = verifyUserToken(token);
    if (payload) {
      req.user = { id: payload.sub, email: payload.email, role: payload.role };
    }
  }
  req.clientIp = getClientIp(req);
  next();
}

// ---- Admin auth ----
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw new AppError(401, "Admin authentication required");
    const payload = verifyAdminToken(token);
    if (!payload) throw new AppError(401, "Invalid or expired admin token");

    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
        ipWhitelist: true,
        lockedUntil: true,
      },
    });
    if (!admin) throw new AppError(401, "Admin not found");
    if (!admin.isActive) throw new AppError(403, "Admin account disabled");
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new AppError(423, "Account locked due to too many failed attempts");
    }

    // IP whitelist check (if configured)
    if (admin.ipWhitelist.length > 0) {
      const ip = getClientIp(req);
      if (!admin.ipWhitelist.includes(ip)) {
        throw new AppError(403, `IP ${ip} is not whitelisted`);
      }
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    };
    req.clientIp = getClientIp(req);
    next();
  } catch (err) {
    next(err);
  }
}

// ---- Permission guard (RBAC) ----
export function requirePermission(...perms: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(new AppError(401, "Admin authentication required"));
    const hasAll = perms.every((p) => req.admin!.permissions.includes(p));
    if (!hasAll) {
      return next(
        new AppError(403, `Missing required permission(s): ${perms.join(", ")}`)
      );
    }
    next();
  };
}

// Super admin only
export function requireSuperAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.admin || req.admin.role !== "SUPER_ADMIN") {
    return next(new AppError(403, "Super admin access required"));
  }
  next();
}
