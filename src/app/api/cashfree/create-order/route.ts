import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { getUser } from "@/lib/actions/auth";

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 49,
  "half-yearly": 250,
  yearly: 450,
  lifetime: 2500,
};

const cashfree = new Cashfree(
  process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
    ? CFEnvironment.PRODUCTION
    : CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID!,
  process.env.CASHFREE_KEY_SECRET!
);

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    const amount = PLAN_AMOUNTS[plan];
    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const orderId = `order_${user.id.slice(0, 8)}_${Date.now()}`;

    const response = await cashfree.PGCreateOrder({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: user.id,
        customer_email: user.email || "",
        customer_phone: "9999999999",
        customer_name: user.user_metadata?.full_name || user.email || "User",
      },
      order_meta: {
        notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/cashfree/webhook`,
      },
      order_tags: { plan, user_id: user.id },
    });

    const order = response.data;

    return NextResponse.json({
      orderId: order.order_id,
      paymentSessionId: order.payment_session_id,
      amount,
      plan,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Cashfree create-order error:", msg);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
