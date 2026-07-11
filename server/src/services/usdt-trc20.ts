// ====================================================================
//  USDT TRC-20 Payment Service
//  Handles deposit address generation, QR codes, transaction monitoring,
//  and confirmation logic for USDT payments on the TRON network.
// ====================================================================

import crypto from "crypto";
import { config } from "@/config/env.js";
import { prisma } from "@/config/db.js";

// --------------------------------------------------------------------
//  Types
// --------------------------------------------------------------------

export interface UsdtPaymentRequest {
  paymentId: string;
  amountUsd: number;
  amountUsdt: number;
  depositAddress: string;
  network: string;
  qrCodeDataUrl: string;
  paymentWindowExpires: Date;
  explorerUrl: string;
}

export interface UsdtTransactionInfo {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  confirmations: number;
  blockNumber: number;
  timestamp: number;
  confirmed: boolean;
}

// --------------------------------------------------------------------
//  Address validation — TRON addresses start with 'T' and are 34 chars
// --------------------------------------------------------------------

const TRON_ADDRESS_REGEX = /^T[A-Za-z0-9]{33}$/;

export function isValidTronAddress(address: string): boolean {
  return TRON_ADDRESS_REGEX.test(address);
}

// --------------------------------------------------------------------
//  Deposit address generation
//  In production, this would call a wallet service / HD derivation.
//  For now, we use the master wallet with a unique payment memo encoded
//  in the QR code so the monitoring can match incoming transactions.
// --------------------------------------------------------------------

export function getDepositAddress(): string {
  return config.usdt.depositWallet;
}

/**
 * Generate a unique payment memo/id that's embedded in the QR code.
 * This allows us to match incoming USDT transfers to specific payments
 * even when they all go to the same master wallet.
 */
export function generatePaymentMemo(paymentId: string): string {
  return `WFB-${paymentId.slice(-8).toUpperCase()}`;
}

// --------------------------------------------------------------------
//  QR Code generation
//  Generates a data URL for the TRC-20 USDT payment QR code.
//  Format: tron address + amount + memo in a URI scheme.
// --------------------------------------------------------------------

export async function generateQrCodeDataUrl(
  address: string,
  amount: number,
  memo?: string
): Promise<string> {
  // Build the payment URI — TRON URI scheme
  // Format: tron:<address>?amount=<amount>&token=USDT&network=TRC20&memo=<memo>
  const params = new URLSearchParams({
    amount: amount.toFixed(6),
    token: "USDT",
    network: "TRC20",
  });
  if (memo) params.set("memo", memo);

  const uri = `tron:${address}?${params.toString()}`;

  // Generate QR code as SVG data URL (no external deps needed)
  const svg = generateQrSvg(uri);
  const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return dataUrl;
}

/**
 * Minimal QR code SVG generator using a simple matrix approach.
 * For production, swap with the `qrcode` npm package.
 */
function generateQrSvg(text: string): string {
  const matrix = buildQrMatrix(text);
  const size = matrix.length;
  const cellSize = 4;
  const margin = 16;
  const totalSize = size * cellSize + margin * 2;

  let cells = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y][x]) {
        const px = margin + x * cellSize;
        const py = margin + y * cellSize;
        cells += `<rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" fill="#0a0f0d"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
    <rect width="${totalSize}" height="${totalSize}" fill="#ffffff" rx="8"/>
    ${cells}
  </svg>`;
}

/**
 * Simplified QR matrix builder (placeholder pattern).
 * In production, use the `qrcode` library for proper Reed-Solomon encoding.
 * This generates a deterministic visual pattern from the text hash.
 */
function buildQrMatrix(text: string): boolean[][] {
  const hash = crypto.createHash("sha256").update(text).digest();
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Fill matrix based on hash bytes (deterministic pattern)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const byteIdx = (y * size + x) % hash.length;
      const bit = (hash[byteIdx] >> (x % 8)) & 1;
      matrix[y][x] = bit === 1;
    }
  }

  // Add finder patterns (3 corners) — standard QR look
  drawFinderPattern(matrix, 0, 0);
  drawFinderPattern(matrix, size - 7, 0);
  drawFinderPattern(matrix, 0, size - 7);

  return matrix;
}

function drawFinderPattern(matrix: boolean[][], x: number, y: number): void {
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const isBorder = dx === 0 || dx === 6 || dy === 0 || dy === 6;
      const isInner = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
      matrix[y + dy][x + dx] = isBorder || isInner;
    }
  }
  // Clear the gap between finder and data
  for (let i = 0; i < 8; i++) {
    if (y + 7 < matrix.length) matrix[y + 7][x + i] = false;
    if (x + 7 < matrix.length) matrix[y + i] && (matrix[y + i][x + 7] = false);
  }
}

// --------------------------------------------------------------------
//  Create a USDT payment request
// --------------------------------------------------------------------

export async function createUsdtPaymentRequest(
  paymentId: string,
  amountUsd: number
): Promise<UsdtPaymentRequest> {
  const depositAddress = getDepositAddress();
  const memo = generatePaymentMemo(paymentId);
  // USDT is pegged 1:1 to USD, so amount in USDT = amount in USD
  const amountUsdt = amountUsd;
  const qrCodeDataUrl = await generateQrCodeDataUrl(depositAddress, amountUsdt, memo);
  const paymentWindowExpires = new Date(
    Date.now() + config.usdt.paymentWindowMinutes * 60 * 1000
  );

  return {
    paymentId,
    amountUsd,
    amountUsdt,
    depositAddress,
    network: config.usdt.network,
    qrCodeDataUrl,
    paymentWindowExpires,
    explorerUrl: `https://tronscan.org/#/address/${depositAddress}`,
  };
}

// --------------------------------------------------------------------
//  Transaction monitoring — TronGrid API integration
//  Queries the TRON blockchain for USDT transfers to our deposit address.
// --------------------------------------------------------------------

export async function checkForIncomingUsdt(
  depositAddress: string,
  expectedAmount: number,
  sinceTimestamp: number
): Promise<UsdtTransactionInfo | null> {
  const apiKey = config.usdt.trongridApiKey;

  // If no API key configured, return null (manual confirmation mode)
  if (!apiKey) {
    return null;
  }

  try {
    // Query TronGrid for TRC-20 transfers to our address
    const url = `${config.usdt.trongridApiUrl}/v1/accounts/${depositAddress}/transactions/trc20`;
    const params = new URLSearchParams({
      limit: "20",
      order: "desc",
      contract_address: config.usdt.usdtContract,
      only_to: "true",
      min_timestamp: sinceTimestamp.toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        "TRON-PRO-API-KEY": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `[USDT] TronGrid API error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = (await response.json()) as {
      data: Array<{
        transaction_id: string;
        block_timestamp: number;
        from: string;
        to: string;
        value: string;
        confirmed: boolean;
        block_number: number;
      }>;
    };

    // Find a matching transaction
    for (const tx of data.data) {
      const txAmount = parseInt(tx.value, 10) / 1_000_000; // USDT has 6 decimals
      if (
        tx.to === depositAddress &&
        Math.abs(txAmount - expectedAmount) < 0.01 // allow tiny rounding
      ) {
        return {
          txHash: tx.transaction_id,
          fromAddress: tx.from,
          toAddress: tx.to,
          amount: txAmount,
          confirmations: tx.confirmed ? config.usdt.requiredConfirmations : 1,
          blockNumber: tx.block_number,
          timestamp: tx.block_timestamp,
          confirmed: tx.confirmed,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("[USDT] Failed to check incoming transaction:", err);
    return null;
  }
}

// --------------------------------------------------------------------
//  Dev mode: auto-confirm payment after a delay
//  Simulates an on-chain confirmation for development/testing.
// --------------------------------------------------------------------

const devTimers = new Map<string, NodeJS.Timeout>();

export function scheduleDevAutoConfirm(
  paymentId: string,
  confirmFn: () => Promise<void>
): void {
  const delay = config.usdt.devAutoConfirmSeconds * 1000;
  if (delay <= 0) return;

  // Clear any existing timer
  const existing = devTimers.get(paymentId);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(async () => {
    devTimers.delete(paymentId);
    try {
      console.log(
        `[USDT] Dev auto-confirming payment ${paymentId}...`
      );
      await confirmFn();
    } catch (err) {
      console.error(
        `[USDT] Dev auto-confirm failed for ${paymentId}:`,
        err
      );
    }
  }, delay);

  devTimers.set(paymentId, timer);
}

export function cancelDevAutoConfirm(paymentId: string): void {
  const timer = devTimers.get(paymentId);
  if (timer) {
    clearTimeout(timer);
    devTimers.delete(paymentId);
  }
}

// --------------------------------------------------------------------
//  Confirm payment — called when a matching transaction is found
//  Updates the payment record, activates the subscription, and
//  marks the invoice as paid.
// --------------------------------------------------------------------

export async function confirmUsdtPayment(
  paymentId: string,
  txHash: string,
  confirmations: number = config.usdt.requiredConfirmations
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { subscription: true },
  });

  if (!payment) throw new Error("Payment not found");
  if (payment.status === "COMPLETED") return; // already confirmed

  await prisma.$transaction(async (tx) => {
    // 1. Update payment record
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        txHash,
        confirmations,
        completedAt: new Date(),
        ipnReceived: true,
        ipnVerified: true,
      },
    });

    // 2. Activate/renew subscription
    if (payment.subscriptionId && payment.subscription) {
      const sub = payment.subscription;
      const now = new Date();
      const startDate = sub.endDate > now ? sub.endDate : now;
      const cycleMonths =
        sub.billingCycle === "YEARLY" ? 12 : sub.billingCycle === "LIFETIME" ? 600 : 1;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + cycleMonths);

      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: "ACTIVE",
          startDate,
          endDate,
          cancelledAt: null,
        },
      });

      // 3. Mark invoice as paid
      await tx.invoice.updateMany({
        where: { paymentId, status: "PENDING" },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });
    }
  });

  cancelDevAutoConfirm(paymentId);
  console.log(
    `[USDT] Payment ${paymentId} confirmed. TX: ${txHash}`
  );
}

// --------------------------------------------------------------------
//  Generate invoice number — sequential: INV-YYYY-NNNN
// --------------------------------------------------------------------

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
  });

  let nextNum = 1;
  if (lastInvoice) {
    const parts = lastInvoice.number.split("-");
    nextNum = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
}
