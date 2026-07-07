import crypto from "crypto";
import { config } from "@/config/env.js";
import { AppError } from "@/utils/errors.js";

// ====================================================================
//  PAYMENTO SERVICE
//  Crypto payment gateway — non-custodial, no KYC
//  Flow: request → token → redirect → IPN → verify
//  Docs: https://app.paymento.io/
//  ====================================================================

const { apiUrl, apiKey, secretKey, merchantId, ipnUrl } = config.paymento;

interface PaymentRequestInput {
  amount: number;
  currency?: string;
  description?: string;
  orderId: string;        // internal payment id
  userId?: string;
  guestEmail?: string;
  method?: string;        // USDT_TRC20, BTC, ETH ...
}

interface PaymentRequestResponse {
  token: string;
  paymentUrl: string;
  paymentoId: string;
}

interface VerifyResponse {
  verified: boolean;
  status: "PAID" | "PENDING" | "FAILED" | "EXPIRED";
  amount: number;
  currency: string;
  txId?: string;
  method?: string;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
    "X-SECRET-KEY": secretKey,
  };
}

// --------------------------------------------------------------------
//  STEP 1-3: Create payment request, receive token, return redirect URL
// --------------------------------------------------------------------
export async function createPaymentRequest(
  input: PaymentRequestInput
): Promise<PaymentRequestResponse> {
  if (!apiKey || !secretKey) {
    throw new AppError(503, "Paymento not configured (missing API/Secret keys)");
  }

  const body = {
    merchant_id: merchantId,
    amount: input.amount,
    currency: input.currency ?? "USD",
    description: input.description ?? "W-Forex Bot Subscription",
    order_id: input.orderId,
    success_url: `${config.server.corsOrigins[0]}/payments/success`,
    fail_url: `${config.server.corsOrigins[0]}/payments/failed`,
    ipn_url: ipnUrl,
    method: input.method,
  };

  const res = await fetch(`${apiUrl}/payment/request`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AppError(502, `Paymento request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    token: string;
    payment_url?: string;
    id?: string;
    paymentId?: string;
  };

  if (!data.token) {
    throw new AppError(502, "Paymento did not return a payment token");
  }

  return {
    token: data.token,
    paymentUrl: data.payment_url ?? `https://app.paymento.io/pay/${data.token}`,
    paymentoId: data.id ?? data.paymentId ?? "",
  };
}

// --------------------------------------------------------------------
//  STEP 5: Verify payment server-side before activating subscription
// --------------------------------------------------------------------
export async function verifyPayment(token: string): Promise<VerifyResponse> {
  if (!apiKey || !secretKey) {
    throw new AppError(503, "Paymento not configured");
  }

  const res = await fetch(`${apiUrl}/payment/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AppError(502, `Paymento verify failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as VerifyResponse & { status?: string };
  return {
    verified: (data.status ?? "").toUpperCase() === "PAID",
    status: (data.status ?? "PENDING").toUpperCase() as VerifyResponse["status"],
    amount: data.amount,
    currency: data.currency,
    txId: data.txId,
    method: data.method,
  };
}

// --------------------------------------------------------------------
//  HMAC SIGNATURE VERIFICATION — validate incoming IPN webhooks
//  Paymento signs notifications; we must verify before trusting.
// --------------------------------------------------------------------
export function verifyIpnSignature(rawBody: string, signatureHeader: string): boolean {
  if (!secretKey) return false;
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signatureHeader, "hex")
    );
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------
//  Generate a simple payment link (no-code option for early stage)
// --------------------------------------------------------------------
export function generatePaymentLink(token: string): string {
  return `https://app.paymento.io/pay/${token}`;
}
