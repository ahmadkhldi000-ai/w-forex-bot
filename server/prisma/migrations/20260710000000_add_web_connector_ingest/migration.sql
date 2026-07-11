-- ====================================================================
--  W-FOREX-BOT · add_web_connector_ingest
--  Adds: ApiKey, Performance, ConnectorLog models + new live fields on
--  mt5_accounts (broker, serverRaw, margin, drawdown, drawdownPct).
-- ====================================================================

-- CreateEnum
CREATE TYPE "ConnectorLogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateEnum
CREATE TYPE "ApiKeyScope" AS ENUM ('MT5_INGEST', 'READ_ONLY', 'FULL_ACCESS');

-- AlterTable: add live connector fields to mt5_accounts
ALTER TABLE "mt5_accounts" ADD COLUMN "broker"      TEXT,
                            ADD COLUMN "serverRaw"   TEXT,
                            ADD COLUMN "margin"      REAL      DEFAULT 0,
                            ADD COLUMN "drawdown"    REAL      DEFAULT 0,
                            ADD COLUMN "drawdownPct" REAL      DEFAULT 0;

-- CreateTable: performance_snapshots
CREATE TABLE "performance_snapshots" (
    "id"            TEXT              NOT NULL,
    "mt5AccountId"  TEXT              NOT NULL,
    "balance"       REAL              NOT NULL,
    "equity"        REAL              NOT NULL,
    "margin"        REAL              NOT NULL,
    "drawdown"      REAL              DEFAULT 0,
    "drawdownPct"   REAL              DEFAULT 0,
    "openTrades"    INTEGER           DEFAULT 0,
    "totalTrades"   INTEGER           DEFAULT 0,
    "wins"          INTEGER           DEFAULT 0,
    "losses"        INTEGER           DEFAULT 0,
    "winRate"       REAL              DEFAULT 0,
    "realizedPnl"   REAL              DEFAULT 0,
    "floatingPnl"   REAL              DEFAULT 0,
    "snapshotTime"  TIMESTAMP(3)      DEFAULT CURRENT_TIMESTAMP,
    "createdAt"     TIMESTAMP(3)      DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable: connector_logs
CREATE TABLE "connector_logs" (
    "id"            TEXT                   NOT NULL,
    "mt5AccountId"  TEXT,
    "level"         "ConnectorLogLevel"    DEFAULT 'INFO',
    "event"         TEXT                   NOT NULL,
    "message"       TEXT                   NOT NULL,
    "source"        TEXT                   DEFAULT 'web_connector',
    "ipAddress"     TEXT,
    "createdAt"     TIMESTAMP(3)           DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connector_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: api_keys
CREATE TABLE "api_keys" (
    "id"            TEXT                   NOT NULL,
    "name"          TEXT                   NOT NULL,
    "keyHash"       TEXT                   NOT NULL,
    "keyPrefix"     TEXT                   NOT NULL,
    "scope"         "ApiKeyScope"          DEFAULT 'MT5_INGEST',
    "mt5AccountId"  TEXT,
    "isActive"      BOOLEAN                DEFAULT true,
    "lastUsedAt"    TIMESTAMP(3),
    "requestCount"  INTEGER                DEFAULT 0,
    "createdAt"     TIMESTAMP(3)           DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx"        ON "api_keys"("isActive");
CREATE INDEX "api_keys_keyHash_idx"         ON "api_keys"("keyHash");

CREATE INDEX "performance_snapshots_mt5AccountId_idx" ON "performance_snapshots"("mt5AccountId");
CREATE INDEX "performance_snapshots_snapshotTime_idx" ON "performance_snapshots"("snapshotTime");

CREATE INDEX "connector_logs_mt5AccountId_idx" ON "connector_logs"("mt5AccountId");
CREATE INDEX "connector_logs_event_idx"        ON "connector_logs"("event");
CREATE INDEX "connector_logs_createdAt_idx"    ON "connector_logs"("createdAt");
CREATE INDEX "connector_logs_level_idx"        ON "connector_logs"("level");

-- AddForeignKey
ALTER TABLE "performance_snapshots"
  ADD CONSTRAINT "performance_snapshots_mt5AccountId_fkey"
  FOREIGN KEY ("mt5AccountId") REFERENCES "mt5_accounts"("id")
  ON DELETE CASCADE;

ALTER TABLE "connector_logs"
  ADD CONSTRAINT "connector_logs_mt5AccountId_fkey"
  FOREIGN KEY ("mt5AccountId") REFERENCES "mt5_accounts"("id")
  ON DELETE SET NULL;

ALTER TABLE "api_keys"
  ADD CONSTRAINT "api_keys_mt5AccountId_fkey"
  FOREIGN KEY ("mt5AccountId") REFERENCES "mt5_accounts"("id")
  ON DELETE SET NULL;
