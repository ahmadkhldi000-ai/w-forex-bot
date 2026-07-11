import { Router } from "express";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/config/db.js";
import { success, handleError, AppError } from "@/utils/errors.js";
import { encrypt } from "@/utils/crypto.js";
import { requirePermission } from "@/middleware/auth.js";
import { auditLog } from "@/middleware/audit.js";
import type { MT5Server } from "@prisma/client";

const router = Router();

// All routes require admin authentication + MT5_VIEW permission (set in index)
// Mutation routes additionally require MT5_MANAGE.

const createSchema = z.object({
  label: z.string().min(1).max(60),
  login: z.string().min(1).max(40),
  server: z.nativeEnum({
    METAQUOTES_DEMO: "METAQUOTES_DEMO",
    METAQUOTES_REAL: "METAQUOTES_REAL",
    ICMARKETS_DEMO: "ICMARKETS_DEMO",
    ICMARKETS_REAL: "ICMARKETS_REAL",
    PEPPERSTONE_DEMO: "PEPPERSTONE_DEMO",
    PEPPERSTONE_REAL: "PEPPERSTONE_REAL",
    CUSTOM: "CUSTOM",
  } as const),
  serverName: z.string().max(80).optional(),
  password: z.string().min(1).max(120),
  currency: z.string().length(3).default("USD"),
  leverage: z.number().int().min(1).max(3000).default(100),
  makeActive: z.boolean().default(false),
  makeMaster: z.boolean().default(false),
});

const updateSchema = z.object({
  label: z.string().min(1).max(60).optional(),
  serverName: z.string().max(80).optional(),
  password: z.string().min(1).max(120).optional(),
  currency: z.string().length(3).optional(),
  leverage: z.number().int().min(1).max(3000).optional(),
});

/** Strip the encrypted password for any API response */
function sanitize<T extends { passwordEnc?: string }>(a: T): Omit<T, "passwordEnc"> {
  const { passwordEnc, ...rest } = a;
  return rest;
}

// ====================================================================
//  LIST  —  GET /api/management/mt5/accounts
// ====================================================================
router.get("/accounts", requirePermission("MT5_VIEW"), async (_req, res) => {
  try {
    const accounts = await prisma.mT5Account.findMany({
      orderBy: [{ isMaster: "desc" }, { isActive: "desc" }, { createdAt: "asc" }],
    });
    return success(res, accounts.map(sanitize));
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  CREATE  —  POST /api/management/mt5/accounts
// ====================================================================
router.post("/accounts", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const body = createSchema.parse(req.body);

    // uniqueness: same login+server cannot be registered twice
    const existing = await prisma.mT5Account.findFirst({
      where: { login: body.login, server: body.server as MT5Server },
    });
    if (existing) {
      throw new AppError(409, "An MT5 account with this login/server already exists");
    }

    // Enforce single-active / single-master invariant
    if (body.makeActive) {
      await prisma.mT5Account.updateMany({ where: { isActive: true }, data: { isActive: false } });
    }
    if (body.makeMaster) {
      await prisma.mT5Account.updateMany({ where: { isMaster: true }, data: { isMaster: false } });
    }

    const account = await prisma.mT5Account.create({
      data: {
        label: body.label,
        login: body.login,
        server: body.server as MT5Server,
        serverName: body.serverName,
        passwordEnc: encrypt(body.password),
        currency: body.currency,
        leverage: body.leverage,
        isActive: body.makeActive,
        isMaster: body.makeMaster,
        createdBy: req.admin!.id,
      },
    });

    await auditLog(req, {
      action: "CREATE",
      resource: "mt5_account",
      resourceId: account.id,
      details: { label: account.label, login: account.login, server: account.server, active: account.isActive, master: account.isMaster },
    });

    return success(res, sanitize(account), 201);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  UPDATE  —  PATCH /api/management/mt5/accounts/:id
// ====================================================================
router.patch("/accounts/:id", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const body = updateSchema.parse(req.body);
    const existing = await prisma.mT5Account.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "MT5 account not found");

    const account = await prisma.mT5Account.update({
      where: { id: req.params.id },
      data: {
        label: body.label,
        serverName: body.serverName,
        passwordEnc: body.password ? encrypt(body.password) : undefined,
        currency: body.currency,
        leverage: body.leverage,
      },
    });

    await auditLog(req, {
      action: "UPDATE",
      resource: "mt5_account",
      resourceId: account.id,
      details: { label: account.label, fields: Object.keys(body) },
    });

    return success(res, sanitize(account));
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  DELETE  —  DELETE /api/management/mt5/accounts/:id
// ====================================================================
router.delete("/accounts/:id", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const existing = await prisma.mT5Account.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, "MT5 account not found");

    await prisma.mT5Account.delete({ where: { id: req.params.id } });

    await auditLog(req, {
      action: "DELETE",
      resource: "mt5_account",
      resourceId: req.params.id,
      details: { label: existing.label, login: existing.login },
    });

    return success(res, { deleted: true });
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  SET ACTIVE  —  POST /api/management/mt5/accounts/:id/activate
//  Exactly one account may be active at a time.
// ====================================================================
router.post("/accounts/:id/activate", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const account = await prisma.mT5Account.findUnique({ where: { id: req.params.id } });
    if (!account) throw new AppError(404, "MT5 account not found");

    // Single-active invariant enforced atomically
    await prisma.$transaction([
      prisma.mT5Account.updateMany({ where: { isActive: true }, data: { isActive: false } }),
      prisma.mT5Account.update({ where: { id: req.params.id }, data: { isActive: true } }),
    ]);

    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "mt5_account",
      resourceId: req.params.id,
      details: { action: "set_active", label: account.label, login: account.login },
    });

    return success(res, { id: req.params.id, isActive: true });
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  SET MASTER  —  POST /api/management/mt5/accounts/:id/master
//  Exactly one account may be the master (copy-trading source).
// ====================================================================
router.post("/accounts/:id/master", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const account = await prisma.mT5Account.findUnique({ where: { id: req.params.id } });
    if (!account) throw new AppError(404, "MT5 account not found");

    await prisma.$transaction([
      prisma.mT5Account.updateMany({ where: { isMaster: true }, data: { isMaster: false } }),
      prisma.mT5Account.update({ where: { id: req.params.id }, data: { isMaster: true } }),
    ]);

    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "mt5_account",
      resourceId: req.params.id,
      details: { action: "set_master", label: account.label, login: account.login },
    });

    return success(res, { id: req.params.id, isMaster: true });
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  CONNECTION TOGGLE  —  POST /api/management/mt5/accounts/:id/connect
//  (Tells the bridge to connect/disconnect this account.)
// ====================================================================
router.post("/accounts/:id/connect", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const { connect } = z.object({ connect: z.boolean() }).parse(req.body);
    const account = await prisma.mT5Account.findUnique({ where: { id: req.params.id } });
    if (!account) throw new AppError(404, "MT5 account not found");

    const updated = await prisma.mT5Account.update({
      where: { id: req.params.id },
      data: {
        isActiveConn: connect,
        lastConnectedAt: connect ? new Date() : account.lastConnectedAt,
        lastError: connect ? null : account.lastError,
      },
    });

    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "mt5_account",
      resourceId: req.params.id,
      details: { action: connect ? "connect" : "disconnect", label: account.label },
    });

    return success(res, sanitize(updated));
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  PERFORMANCE  —  GET /api/management/mt5/performance
//  Latest live stats + recent equity-curve snapshots for each account.
// ====================================================================
router.get("/performance", requirePermission("MT5_VIEW"), async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 500);

    const accounts = await prisma.mT5Account.findMany({
      where: { isActiveConn: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        login: true,
        label: true,
        broker: true,
        serverRaw: true,
        currency: true,
        leverage: true,
        balance: true,
        equity: true,
        margin: true,
        drawdown: true,
        drawdownPct: true,
        isActiveConn: true,
        lastConnectedAt: true,
      },
    });

    // attach recent performance snapshots (equity curve)
    const withCurve = await Promise.all(
      accounts.map(async (a) => {
        const snapshots = await prisma.performance.findMany({
          where: { mt5AccountId: a.id },
          orderBy: { snapshotTime: "desc" },
          take: limit,
          select: {
            balance: true,
            equity: true,
            drawdownPct: true,
            snapshotTime: true,
          },
        });
        return { ...a, curve: snapshots.reverse() };
      })
    );

    return success(res, withCurve);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  CONNECTOR LOGS  —  GET /api/management/mt5/connector-logs
// ====================================================================
router.get("/connector-logs", requirePermission("LOGS_VIEW"), async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "100"), 10) || 100, 500);
    const level = req.query.level as string | undefined;

    const logs = await prisma.connectorLog.findMany({
      where: level ? { level: level as any } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { account: { select: { login: true, label: true } } },
    });

    return success(res, logs);
  } catch (err) {
    return handleError(res, err);
  }
});

// ====================================================================
//  API KEYS  —  management for Web Connector keys
// ====================================================================

// GET /api/management/mt5/api-keys  — list keys (never returns the hash)
router.get("/api-keys", requirePermission("MT5_VIEW"), async (_req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scope: true,
        isActive: true,
        lastUsedAt: true,
        requestCount: true,
        mt5AccountId: true,
        createdAt: true,
      },
    });
    return success(res, keys);
  } catch (err) {
    return handleError(res, err);
  }
});

// POST /api/management/mt5/api-keys  — generate a new key, returns raw key ONCE
router.post("/api-keys", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const body = z
      .object({
        name: z.string().min(1).max(60),
        mt5AccountId: z.string().optional(),
      })
      .parse(req.body);

    // generate a strong raw key
    const rawKey = "wfb_" + randomBytes(32).toString("hex");
    const keyHash = createHash("sha256").update(rawKey).digest("hex");
    const keyPrefix = rawKey.slice(0, 12);

    const created = await prisma.apiKey.create({
      data: {
        name: body.name,
        keyHash,
        keyPrefix,
        scope: "MT5_INGEST",
        mt5AccountId: body.mt5AccountId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scope: true,
        isActive: true,
        createdAt: true,
      },
    });

    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "api_key",
      resourceId: created.id,
      details: { action: "create", name: body.name },
    });

    // raw key is returned only this once
    return success(res, { ...created, key: rawKey }, 201);
  } catch (err) {
    return handleError(res, err);
  }
});

// PATCH /api/management/mt5/api-keys/:id  — toggle active
router.patch("/api-keys/:id", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    const body = z.object({ isActive: z.boolean() }).parse(req.body);
    const updated = await prisma.apiKey.update({
      where: { id: req.params.id },
      data: { isActive: body.isActive },
      select: { id: true, name: true, isActive: true },
    });
    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "api_key",
      resourceId: req.params.id,
      details: { action: body.isActive ? "enable" : "disable" },
    });
    return success(res, updated);
  } catch (err) {
    return handleError(res, err);
  }
});

// DELETE /api/management/mt5/api-keys/:id
router.delete("/api-keys/:id", requirePermission("MT5_MANAGE"), async (req, res) => {
  try {
    await prisma.apiKey.delete({ where: { id: req.params.id } });
    await auditLog(req, {
      action: "MT5_ACTION",
      resource: "api_key",
      resourceId: req.params.id,
      details: { action: "delete" },
    });
    return success(res, { deleted: true });
  } catch (err) {
    return handleError(res, err);
  }
});

export default router;
