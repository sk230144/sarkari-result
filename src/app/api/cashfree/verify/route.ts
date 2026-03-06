import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { getUser } from "@/lib/actions/auth";
import { createServiceClient } from "@/lib/supabase/service";

const PLAN_EXPIRY_DAYS: Record<string, number | null> = {
  monthly: 30,
  "half-yearly": 180,
  yearly: 365,
  lifetime: null,
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

    const { orderId, plan } = await req.json();

    // Fetch order status from Cashfree
    const response = await cashfree.PGFetchOrder(orderId);
    const order = response.data;

    if (order.order_status !== "PAID") {
      return NextResponse.json(
        { error: `Payment not completed. Status: ${order.order_status}` },
        { status: 400 }
      );
    }

    // Calculate expiry
    const expiryDays = PLAN_EXPIRY_DAYS[plan];
    const premiumExpiresAt = expiryDays
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Activate premium
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_plan: plan,
        premium_expires_at: premiumExpiresAt,
        premium_order_id: orderId,
        premium_payment_id: order.cf_order_id?.toString() || orderId,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Supabase update error:", error.message);
      return NextResponse.json({ error: "Failed to activate premium" }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan, premiumExpiresAt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Cashfree verify error:", msg);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
