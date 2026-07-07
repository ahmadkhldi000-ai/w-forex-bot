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

  mt5: {
    bridgeHost: optional("MT5_BRIDGE_HOST", "localhost"),
    bridgePort: parseInt(optional("MT5_BRIDGE_PORT", "5555"), 10),
    login: optional("MT5_LOGIN"),
    password: optional("MT5_PASSWORD"),
    server: optional("MT5_SERVER"),
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
