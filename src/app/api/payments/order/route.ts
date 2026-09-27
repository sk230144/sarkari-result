import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { CashfreeError, checkoutMode, createOrder } from "@/lib/payments/cashfree";
import { PLANS, isPlan } from "@/lib/premium";

export const dynamic = "force-dynamic";

/** Starts a PRO+ payment. Body: { plan: "monthly" | "quarterly", phone } -> { orderId, paymentSessionId, mode } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: { plan?: unknown; phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isPlan(body.plan)) return NextResponse.json({ error: "Choose a plan." }, { status: 400 });
  // Cashfree needs a phone number on every order (it's used for UPI and receipts).
  const phone = String(body.phone ?? "").replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });

  const db = serviceDb();
  const since = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count } = await db.from("payments").select("order_id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 20) return NextResponse.json({ error: "Too many payment attempts today. Try again tomorrow." }, { status: 429 });

  const plan = PLANS[body.plan];
  const orderId = `ja24_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
  const { data: prof } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  const { error: insErr } = await db.from("payments").insert({ order_id: orderId, user_id: user.id, plan: plan.key, amount: plan.total, currency: "INR" });
  if (insErr) {
    console.error("payments insert failed", insErr.message);
    return NextResponse.json({ error: "Payments aren't set up yet. Please try again later." }, { status: 503 });
  }

  // Cashfree only accepts https return/notify URLs, so they're sent from the live site only.
  const origin = new URL(request.url).origin;
  const https = origin.startsWith("https://");
  try {
    const order = await createOrder({
      order_id: orderId,
      order_amount: plan.total,
      order_currency: "INR",
      customer_details: {
        customer_id: user.id,
        customer_email: user.email ?? undefined,
        customer_phone: phone,
        customer_name: ((prof?.full_name as string) || user.email || "Job Alert 24 user").slice(0, 100),
      },
      order_meta: https
        ? { return_url: `${origin}/pricing?order_id={order_id}`, notify_url: `${origin}/api/payments/webhook` }
        : undefined,
      order_note: `PRO+ ${plan.label}`,
      order_tags: { plan: plan.key },
    });
    await db.from("payments").update({ cf_order_id: String(order.cf_order_id) }).eq("order_id", orderId);
    if (!order.payment_session_id) throw new CashfreeError("The payment gateway didn't start a session.");
    return NextResponse.json({ orderId, paymentSessionId: order.payment_session_id, mode: checkoutMode, amount: plan.total });
  } catch (e) {
    await db.from("payments").update({ status: "failed", updated_at: new Date().toISOString() }).eq("order_id", orderId);
    const err = e instanceof CashfreeError ? e : new CashfreeError("Couldn't start the payment.");
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
