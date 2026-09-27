import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPlan, isPremiumActive, type PremiumStatus } from "@/lib/premium";
import { fetchOrder, successfulPayment } from "./cashfree";

export async function getPremiumStatus(db: SupabaseClient, userId: string): Promise<PremiumStatus> {
  const { data } = await db.from("profiles").select("premium_until, premium_plan, premium_since").eq("id", userId).maybeSingle();
  const until = (data?.premium_until as string) ?? null;
  return {
    isPremium: isPremiumActive(until),
    premiumUntil: until,
    plan: isPlan(data?.premium_plan) ? data.premium_plan : null,
    since: (data?.premium_since as string) ?? null,
  };
}

export type SettleState = "paid" | "pending" | "failed" | "not_found";

/**
 * Brings one order up to date from Cashfree's own record (never from what
 * the browser says) and grants premium if it's paid. Safe to call any number
 * of times, from the verify endpoint and the webhook alike.
 */
export async function settleOrder(db: SupabaseClient, orderId: string, expectUser?: string): Promise<SettleState> {
  const { data: row } = await db.from("payments").select("user_id, status, amount, currency").eq("order_id", orderId).maybeSingle();
  if (!row || (expectUser && row.user_id !== expectUser)) return "not_found";
  if (row.status === "paid") return "paid";

  const order = await fetchOrder(orderId);
  if (Number(order.order_amount) !== Number(row.amount) || order.order_currency !== row.currency) {
    console.error("payments: amount mismatch on", orderId);
    return "failed";
  }
  if (order.order_status === "PAID") {
    const pay = await successfulPayment(orderId);
    const { error } = await db.rpc("grant_premium", {
      p_order_id: orderId,
      p_cf_payment_id: pay ? String(pay.cf_payment_id) : null,
      p_method: pay?.payment_group ?? null,
    });
    if (error) {
      console.error("payments: grant failed", error.message);
      throw new Error("grant failed");
    }
    return "paid";
  }
  if (order.order_status === "EXPIRED" || order.order_status === "TERMINATED") {
    await db.from("payments").update({ status: "expired", updated_at: new Date().toISOString() }).eq("order_id", orderId).neq("status", "paid");
    return "failed";
  }
  return "pending";
}
