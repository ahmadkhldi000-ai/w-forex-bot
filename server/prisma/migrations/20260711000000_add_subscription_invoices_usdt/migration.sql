-- ====================================================================
--  Add VIP tier, Invoice model, USDT TRC-20 payment fields
-- ====================================================================

-- Add VIP to SubscriptionTier enum
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'VIP';

-- Add USDT TRC-20 fields to Payment table
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "depositAddress" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "cryptoNetwork" TEXT DEFAULT 'TRC20';
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "cryptoAmount" DECIMAL(18,6);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "txHash" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "confirmations" INTEGER DEFAULT 0;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "paymentWindowExpires" TIMESTAMP(3);

-- Create indexes for USDT payment lookup
CREATE INDEX IF NOT EXISTS "payments_depositAddress_idx" ON "payments"("depositAddress");
CREATE INDEX IF NOT EXISTS "payments_txHash_idx" ON "payments"("txHash");

-- Create InvoiceStatus enum
DO $$ BEGIN
    CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'VOID', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Invoice table
CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "userId" TEXT,
    "subscriptionId" TEXT,
    "paymentId" TEXT,
    "tier" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT,
    "customerEmail" TEXT,
    "notes" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on invoice number
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_number_key" ON "invoices"("number");

-- Create indexes
CREATE INDEX IF NOT EXISTS "invoices_userId_idx" ON "invoices"("userId");
CREATE INDEX IF NOT EXISTS "invoices_subscriptionId_idx" ON "invoices"("subscriptionId");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");

-- Add foreign key constraints
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paymentId_fkey"
    FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
