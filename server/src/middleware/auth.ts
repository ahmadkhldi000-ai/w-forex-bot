import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { verifyUserToken, verifyAdminToken, getClientIp } from "@/utils/crypto.js";
import { prisma } from "@/config/db.js";
import { config } from "@/config/env.js";
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
      apiKey?: {
        id: string;
        name: string;
        scope: string;
        mt5AccountId: string | null;
      };
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

// ================================================================
//  WEB CONNECTOR — API KEY AUTHENTICATION
//  The MT5 EA sends a raw key in the `X-API-Key` header.
//  We resolve it against either:
//    (a) the ApiKey table (keyHash = sha256(rawKey)), or
//    (b) the static CONNECTOR_API_KEYS env list (fallback / bootstrap).
//  Comparison is constant-time. Never throws; 401 on failure.
// ================================================================

function constantTimeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const rawKey = (req.headers["x-api-key"] as string | undefined)?.trim();
    const ip = getClientIp(req);
    req.clientIp = ip;

    if (!rawKey) {
      return next(new AppError(401, "Missing X-API-Key header"));
    }

    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    // ---- (a) resolve against the ApiKey table ----
    const dbKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      select: { id: true, name: true, scope: true, isActive: true, mt5AccountId: true },
    });

    if (dbKey) {
      if (!dbKey.isActive) {
        await logConnectorAuth(req, "auth_failed", "API key disabled");
        return next(new AppError(401, "API key disabled"));
      }
      // attach + update usage stats (fire-and-forget)
      req.apiKey = {
        id: dbKey.id,
        name: dbKey.name,
        scope: dbKey.scope,
        mt5AccountId: dbKey.mt5AccountId,
      };
      prisma.apiKey
        .update({
          where: { id: dbKey.id },
          data: { lastUsedAt: new Date(), requestCount: { increment: 1 } },
        })
        .catch(() => {});
      return next();
    }

    // ---- (b) fallback to static env keys (bootstrap before DB seed) ----
    const envKeys = config.connector.apiKeys;
    const matched = envKeys.some((k) => constantTimeEqual(k, rawKey));

    if (!matched) {
      await logConnectorAuth(req, "auth_failed", "Invalid API key");
      return next(new AppError(401, "Invalid API key"));
    }

    req.apiKey = {
      id: "env-static",
      name: "env-key",
      scope: "MT5_INGEST",
      mt5AccountId: null,
    };
    next();
  } catch (err) {
    console.error("[apiKeyAuth]", err);
    return next(new AppError(500, "Authentication error"));
  }
}

// helper: write a connector auth-failure log (never throws)
async function logConnectorAuth(req: Request, event: string, message: string) {
  try {
    await prisma.connectorLog.create({
      data: {
        level: "WARN",
        event,
        message,
        source: "web_connector",
        ipAddress: req.clientIp,
      },
    });
  } catch {
    // never break the request on a log failure
  }
}
