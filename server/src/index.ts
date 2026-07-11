import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { config } from "@/config/env.js";
import { prisma } from "@/config/db.js";
import { initMT5Socket } from "@/services/mt5-socket.js";
import { ensureDefaultAdmin } from "@/utils/bootstrap.js";

import authRoutes from "@/routes/auth.js";
import paymentsRoutes from "@/routes/payments.js";
import tradesRoutes from "@/routes/trades.js";
import subsRoutes from "@/routes/subscriptions.js";
import adminAuthRoutes from "@/routes/admin-auth.js";
import adminRoutes from "@/routes/admin.js";
import mt5AccountRoutes from "@/routes/mt5-accounts.js";
import mt5UpdateRoutes from "@/routes/mt5-update.js";

// ====================================================================
//  W-FOREX-BOT · API SERVER
//  Reads PORT from env (Render provides a dynamic port)
// ====================================================================

const app = express();
const server = http.createServer(app);

// ---- Security & compression ----
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: config.server.corsOrigins,
    credentials: true,
  })
);
app.use(cookieParser());

// ---- Raw body capture for Paymento IPN HMAC verification ----
app.use(
  "/api/payments/ipn",
  express.raw({ type: "*/*", limit: "1mb" })
);

// ---- JSON body parser for everything else ----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging ----
app.use(morgan(config.isProd ? "combined" : "dev"));

// ---- Rate limiting (global) ----
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.isProd ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, slow down" },
  })
);

// Stricter limit on auth endpoints
app.use(
  "/api/auth/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
);
app.use(
  "/api/admin/auth/login",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })
);

// ---- Health checks ----
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Deep health check — verifies DB connectivity
app.get("/health/ready", async (_req, res) => {
  const checks: Record<string, "ok" | "fail"> = { server: "ok" };
  let allOk = true;

  // Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "fail";
    allOk = false;
  }

  // Redis (optional — warn only)
  try {
    if (config.redis.url) {
      const { default: Redis } = await import("ioredis");
      const redis = new Redis(config.redis.url, { connectTimeout: 2000 });
      await redis.ping();
      redis.disconnect();
      checks.redis = "ok";
    }
  } catch {
    checks.redis = "fail";
  }

  const httpStatus = allOk ? 200 : 503;
  res.status(httpStatus).json({
    status: allOk ? "ready" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

app.get("/", (_req, res) => {
  res.json({
    name: "W-Forex Bot API",
    version: "1.0.0",
    status: "running",
    docs: "/api",
    health: "/health",
    ready: "/health/ready",
  });
});

// ---- Routes ----
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/trades", tradesRoutes);
app.use("/api/subscriptions", subsRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/management", adminRoutes);
app.use("/api/management/mt5", mt5AccountRoutes);
app.use("/api/mt5", mt5UpdateRoutes);

// ---- Initialize MT5 WebSocket bridge ----
initMT5Socket(server);

// ---- 404 handler ----
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// ---- Global error handler ----
app.use(((
  err: Error & { statusCode?: number },
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error("[error]", err);
  const status = err.statusCode ?? 500;
  res.status(status).json({
    success: false,
    error: err.message ?? "Internal server error",
  });
}) as express.ErrorRequestHandler);

// ---- Dynamic PORT (Render requirement) ----
const PORT = config.server.port;

async function start() {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Create default super admin on first startup
    await ensureDefaultAdmin();

    server.listen(PORT, () => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`  🚀 W-Forex Bot API running on port ${PORT}`);
      console.log(`  🔧 Environment: ${config.env}`);
      console.log(`  🌐 CORS: ${config.server.corsOrigins.join(", ")}`);
      console.log(`  💾 DB: connected`);
      console.log(`  ⚡ MT5 Socket: /api/socket`);
      console.log(`${"=".repeat(60)}\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// ---- Graceful shutdown ----
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});

start();
