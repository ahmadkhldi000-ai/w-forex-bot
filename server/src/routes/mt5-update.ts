// ====================================================================
//  W-FOREX-BOT · /api/mt5/update
//  ------------------------------------------------------------------
//  Ingestion endpoint for the MT5 Web Connector (EA).
//  Authenticated via X-API-Key header (apiKeyAuth middleware).
//  Accepts the JSON envelope { event, time, data } and routes it to
//  the mt5-ingest service, which persists to Postgres and broadcasts
//  to dashboard clients over Socket.io.
// ====================================================================
import { Router } from "express";
import { z } from "zod";
import { success, error, handleError } from "@/utils/errors.js";
import { apiKeyAuth } from "@/middleware/auth.js";
import { config } from "@/config/env.js";
import { ingestEnvelope } from "@/services/mt5-ingest.js";

const router = Router();

// ---- rate-limit the connector endpoint (high-frequency EA bursts) ----
import rateLimit from "express-rate-limit";
const connectorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 req/min is plenty for a single EA
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Connector rate limit exceeded" },
});

// --------------------------------------------------------------------
//  ENVELOPE VALIDATION (zod)
//  We keep this loose on purpose — the EA is the source of truth and
//  field shapes vary per event. We only enforce the top-level contract.
// --------------------------------------------------------------------
const envelopeSchema = z.object({
  event: z.enum([
    "account",
    "trade_open",
    "trade_modify",
    "trade_close",
    "full_sync",
    "connection",
  ]),
  time: z.string().optional(),
  data: z.record(z.unknown()).optional().default({}),
});

// --------------------------------------------------------------------
//  POST /api/mt5/update
// --------------------------------------------------------------------
router.post(
  "/update",
  connectorLimiter,
  apiKeyAuth,
  async (req, res) => {
    // basic body-size guard
    const contentLength = parseInt(req.headers["content-length"] ?? "0", 10);
    const maxBytes = config.connector.maxBodyKb * 1024;
    if (contentLength > maxBytes) {
      return error(res, "Payload too large", 413);
    }

    const parsed = envelopeSchema.safeParse(req.body);
    if (!parsed.success) {
      return error(res, "Invalid envelope", 400, {
        issues: parsed.error.issues,
      });
    }

    const result = await ingestEnvelope(
      {
        event: parsed.data.event,
        time: parsed.data.time,
        data: parsed.data.data,
      },
      {
        apiKeyAccountId: req.apiKey?.mt5AccountId ?? null,
        ip: req.clientIp,
      }
    );

    if (!result.ok) {
      // the bot must keep running — we acknowledge receipt with 202
      // even on partial failure, so the EA doesn't see a hard error.
      return success(res, { received: true, ...result }, 202);
    }

    return success(res, { received: true, ...result });
  }
);

// --------------------------------------------------------------------
//  GET /api/mt5/update  (health probe for the connector)
// --------------------------------------------------------------------
router.get("/update", (_req, res) => {
  return success(res, { status: "ok", endpoint: "/api/mt5/update" });
});

// backwards-compatible alias: some deployments may POST to /api/mt5
router.post(
  "/",
  connectorLimiter,
  apiKeyAuth,
  async (req, res) => {
    const parsed = envelopeSchema.safeParse(req.body);
    if (!parsed.success) {
      return handleError(res, parsed.error);
    }
    const result = await ingestEnvelope(
      {
        event: parsed.data.event,
        time: parsed.data.time,
        data: parsed.data.data,
      },
      {
        apiKeyAccountId: req.apiKey?.mt5AccountId ?? null,
        ip: req.clientIp,
      }
    );
    return success(res, { received: true, ...result }, result.ok ? 200 : 202);
  }
);

export default router;
