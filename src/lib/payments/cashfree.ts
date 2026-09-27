import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Minimal Cashfree Payment Gateway client (REST, no SDK).
 * Env: CASHFREE_APP_ID, CASHFREE_KEY_SECRET, NEXT_PUBLIC_CASHFREE_ENV ("production" | anything else = sandbox).
 */

const PROD = process.env.NEXT_PUBLIC_CASHFREE_ENV?.trim() === "production";
const BASE = PROD ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
const API_VERSION = process.env.CASHFREE_API_VERSION || "2023-08-01";

export class CashfreeError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

function headers() {
  const id = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_KEY_SECRET;
  if (!id || !secret) throw new CashfreeError("Payments aren't configured.", 503);
  return { "Content-Type": "application/json", "x-client-id": id, "x-client-secret": secret, "x-api-version": API_VERSION };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: headers(), signal: AbortSignal.timeout(20_000), cache: "no-store" });
  } catch {
    throw new CashfreeError("Couldn't reach the payment gateway. Please try again.", 504);
  }
  const json = (await res.json().catch(() => ({}))) as T & { message?: string; code?: string };
  if (!res.ok) {
    // Log Cashfree's reason (never the keys) so a bad config is diagnosable.
    console.error("cashfree", path.split("/").slice(0, 2).join("/"), res.status, json.code, json.message);
    throw new CashfreeError(res.status === 401 ? "Payment gateway rejected our credentials." : "The payment gateway couldn't process this.", 502);
  }
  return json;
}

export type CfOrder = {
  cf_order_id: string | number;
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED" | "TERMINATION_REQUESTED";
  payment_session_id?: string;
};

export type CfPayment = {
  cf_payment_id: string | number;
  payment_status: string;
  payment_amount: number;
  payment_group?: string;
};

export function createOrder(body: Record<string, unknown>) {
  return call<CfOrder>("/orders", { method: "POST", body: JSON.stringify(body) });
}

export function fetchOrder(orderId: string) {
  return call<CfOrder>(`/orders/${encodeURIComponent(orderId)}`);
}

export function fetchPayments(orderId: string) {
  return call<CfPayment[]>(`/orders/${encodeURIComponent(orderId)}/payments`);
}

/** The successful payment on an order, for the method (upi / card …) and id. */
export async function successfulPayment(orderId: string) {
  try {
    const list = await fetchPayments(orderId);
    return list.find((p) => p.payment_status === "SUCCESS") ?? null;
  } catch {
    return null;
  }
}

/** Cashfree webhook signature: base64(HMAC-SHA256(timestamp + rawBody, secret)). */
export function validWebhook(rawBody: string, timestamp: string | null, signature: string | null) {
  const secret = process.env.CASHFREE_KEY_SECRET;
  if (!secret || !timestamp || !signature) return false;
  const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const checkoutMode = PROD ? "production" : "sandbox";
