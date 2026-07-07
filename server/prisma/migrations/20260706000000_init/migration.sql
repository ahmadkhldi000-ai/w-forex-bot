-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'VIP', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED', 'PENDING');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PAST_DUE', 'TRIALING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('USDT_TRC20', 'USDT_ERC20', 'BTC', 'ETH', 'TRX');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('USERS_VIEW', 'USERS_MANAGE', 'SUBS_VIEW', 'SUBS_MANAGE', 'PAYMENTS_VIEW', 'PAYMENTS_MANAGE', 'BOT_VIEW', 'BOT_MANAGE', 'MT5_VIEW', 'MT5_MANAGE', 'SETTINGS_VIEW', 'SETTINGS_MANAGE', 'NOTIFS_MANAGE', 'REPORTS_VIEW', 'REPORTS_EXPORT', 'LOGS_VIEW', 'LOGS_EXPORT', 'ADMINS_MANAGE');

-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('LOGIN', 'LOGOUT', 'REGISTER', 'CREATE', 'UPDATE', 'DELETE', 'PAYMENT', 'SUBSCRIPTION_CHANGE', 'RISK_CONSENT', 'BOT_ACTION', 'MT5_ACTION', 'SETTINGS_CHANGE', 'FAILED_LOGIN', 'EXPORT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "riskAccepted" BOOLEAN NOT NULL DEFAULT false,
    "riskAcceptedAt" TIMESTAMP(3),
    "riskAcceptedIp" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "copyTradingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "copyRiskPercent" REAL NOT NULL DEFAULT 2,
    "copyMaxLeverage" INTEGER NOT NULL DEFAULT 30,
    "copyLotSize" REAL NOT NULL DEFAULT 0.01,
    "mt5Login" TEXT,
    "mt5PasswordEnc" TEXT,
    "mt5Server" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "permissions" "Permission"[],
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "forcePasswordChange" BOOLEAN NOT NULL DEFAULT true,
    "ipWhitelist" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "googleId" TEXT,
    "githubId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "newDeviceNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "couponCode" TEXT,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "paymentoToken" TEXT,
    "paymentoTxId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod",
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "guestEmail" TEXT,
    "ipnReceived" BOOLEAN NOT NULL DEFAULT false,
    "ipnVerified" BOOLEAN NOT NULL DEFAULT false,
    "ipnPayload" JSONB,
    "description" TEXT,
    "invoiceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "mt5Ticket" BIGINT NOT NULL,
    "mt5Login" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "type" "TradeType" NOT NULL,
    "volume" REAL NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "closePrice" DOUBLE PRECISION,
    "sl" DOUBLE PRECISION,
    "tp" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "swap" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TradeStatus" NOT NULL DEFAULT 'OPEN',
    "isCopyTrade" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TIMESTAMP(3) NOT NULL,
    "closeTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "adminId" TEXT,
    "action" "LogAction" NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" REAL NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT -1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appliedTo" "SubscriptionTier",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMonthly" DECIMAL(12,2) NOT NULL,
    "priceYearly" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "maxAccounts" INTEGER NOT NULL DEFAULT 1,
    "maxLotSize" REAL NOT NULL DEFAULT 0.01,
    "maxLeverage" INTEGER NOT NULL DEFAULT 30,
    "features" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE INDEX "admins_email_idx" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "admin_sessions"("token");

-- CreateIndex
CREATE INDEX "admin_sessions_adminId_idx" ON "admin_sessions"("adminId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentoToken_key" ON "payments"("paymentoToken");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentoTxId_key" ON "payments"("paymentoTxId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentoTxId_idx" ON "payments"("paymentoTxId");

-- CreateIndex
CREATE UNIQUE INDEX "trades_mt5Ticket_key" ON "trades"("mt5Ticket");

-- CreateIndex
CREATE INDEX "trades_userId_idx" ON "trades"("userId");

-- CreateIndex
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");

-- CreateIndex
CREATE INDEX "trades_status_idx" ON "trades"("status");

-- CreateIndex
CREATE INDEX "trades_mt5Login_idx" ON "trades"("mt5Login");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_adminId_idx" ON "audit_logs"("adminId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "plans_tier_key" ON "plans"("tier");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

