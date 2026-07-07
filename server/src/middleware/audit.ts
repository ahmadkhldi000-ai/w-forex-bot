import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/db.js";
import type { LogAction, Permission } from "@prisma/client";

interface LogOptions {
  action: LogAction;
  resource?: string;
  resourceId?: string;
  details?: unknown;
}

/**
 * Audit logger — records every important action to AuditLog table.
 * Works for both user and admin contexts.
 */
export async function auditLog(req: Request, opts: LogOptions) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        adminId: req.admin?.id,
        action: opts.action,
        resource: opts.resource,
        resourceId: opts.resourceId,
        ipAddress: req.clientIp,
        userAgent: req.headers["user-agent"] ?? undefined,
        details: opts.details as object | undefined,
      },
    });
  } catch (err) {
    // Audit logging should never break the request
    console.error("[auditLog] failed:", err);
  }
}

/** Helper to load permission list for a super admin */
export const ALL_PERMISSIONS: Permission[] = [
  "USERS_VIEW", "USERS_MANAGE",
  "SUBS_VIEW", "SUBS_MANAGE",
  "PAYMENTS_VIEW", "PAYMENTS_MANAGE",
  "BOT_VIEW", "BOT_MANAGE",
  "MT5_VIEW", "MT5_MANAGE",
  "SETTINGS_VIEW", "SETTINGS_MANAGE",
  "NOTIFS_MANAGE",
  "REPORTS_VIEW", "REPORTS_EXPORT",
  "LOGS_VIEW", "LOGS_EXPORT",
  "ADMINS_MANAGE",
];
