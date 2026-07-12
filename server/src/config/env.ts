import dotenv from "dotenv";
import { randomBytes } from "crypto";

dotenv.config();

function required(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (val === undefined) {
    throw new Error(`❌ Missing required env var: ${key}`);
  }
  return val;
}

function optional(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional("NODE_ENV", "development"),
  isProd: process.env.NODE_ENV === "production",
  isDev: process.env.NODE_ENV !== "production",

  server: {
    port: parseInt(optional("PORT", "4000"), 10),
    corsOrigins: optional("CORS_ORIGIN", "http://localhost:3000")
      .split(",")
      .map((s) => s.trim()),
  },

  db: {
    url: required("DATABASE_URL"),
  },

  jwt: {
    secret: optional("JWT_SECRET", randomBytes(48).toString("hex")),
    expiresIn: optional("JWT_EXPIRES_IN", "7d"),
    adminSecret: optional(
      "ADMIN_JWT_SECRET",
      randomBytes(48).toString("hex")
    ),
    adminExpiresIn: optional("ADMIN_JWT_EXPIRES_IN", "24h"),
  },

  admin: {
    email: optional("ADMIN_EMAIL", "admin@wforexbot.com"),
  },

  google: {
    clientId: optional("GOOGLE_CLIENT_ID"),
    clientSecret: optional("GOOGLE_CLIENT_SECRET"),
    // Where Google sends the user back after consent.
    // Production: https://wforexbot.vercel.app  Backend: https://api.wforexbot.com
    redirectUrl: optional(
      "GOOGLE_REDIRECT_URL",
      "http://localhost:4000/api/auth/google/callback"
    ),
    // Frontend URL to redirect to after issuing the JWT (with ?token=...)
    frontendUrl: optional("FRONTEND_URL", "http://localhost:3000"),
  },

  encryption: {
    key: optional("ENCRYPTION_KEY", randomBytes(32).toString("hex")),
  },

  paymento: {
    apiUrl: optional("PAYMENTO_API_URL", "https://api.paymento.io/v1"),
    apiKey: optional("PAYMENTO_API_KEY"),
    secretKey: optional("PAYMENTO_SECRET_KEY"),
    merchantId: optional("PAYMENTO_MERCHANT_ID"),
    ipnUrl: optional("PAYMENTO_IPN_URL"),
  },

  usdt: {
    // Master deposit wallet (TRC-20) — all payments go here with a unique memo/id
    depositWallet: optional("USDT_TRC20_WALLET", "TYourMasterWalletAddressHere"),
    network: optional("USDT_NETWORK", "TRC20"),
    // TronGrid API for real on-chain transaction monitoring
    trongridApiKey: optional("TRONGRID_API_KEY"),
    trongridApiUrl: optional("TRONGRID_API_URL", "https://api.trongrid.io"),
    // USDT TRC-20 smart contract address
    usdtContract: optional(
      "USDT_CONTRACT",
      "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    ),
    // Payment window in minutes (how long user has to send payment)
    paymentWindowMinutes: parseInt(
      optional("USDT_PAYMENT_WINDOW_MINUTES", "60"),
      10
    ),
    // Required blockchain confirmations
    requiredConfirmations: parseInt(
      optional("USDT_REQUIRED_CONFIRMATIONS", "12"),
      10
    ),
    // Dev mode: auto-confirm payments after N seconds (0 = disabled)
    devAutoConfirmSeconds: parseInt(
      optional("USDT_DEV_AUTO_CONFIRM_SECONDS", "15"),
      10
    ),
  },

  mt5: {
    bridgeHost: optional("MT5_BRIDGE_HOST", "localhost"),
    bridgePort: parseInt(optional("MT5_BRIDGE_PORT", "5555"), 10),
    login: optional("MT5_LOGIN"),
    password: optional("MT5_PASSWORD"),
    server: optional("MT5_SERVER"),
  },

  // Web Connector (MT5 EA) — HTTPS ingestion from the EA.
  // CONNECTOR_API_KEYS is a comma-separated list of raw API keys.
  // Each is matched against the X-API-Key header (constant-time compare).
  connector: {
    apiKeys: (optional("CONNECTOR_API_KEYS", "") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    // optional per-request body size cap (bytes)
    maxBodyKb: parseInt(optional("CONNECTOR_MAX_BODY_KB", "64"), 10),
  },

  email: {
    host: optional("SMTP_HOST"),
    port: parseInt(optional("SMTP_PORT", "587"), 10),
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
    from: optional("FROM_EMAIL", "noreply@wforexbot.com"),
  },

  telegram: {
    botToken: optional("TELEGRAM_BOT_TOKEN"),
    channelUrl: optional(
      "TELEGRAM_CHANNEL_URL",
      "https://t.me/+iXalBkHABfBkYWQ0"
    ),
  },

  redis: {
    url: optional("REDIS_URL"),
  },
} as const;

export type AppConfig = typeof config;
