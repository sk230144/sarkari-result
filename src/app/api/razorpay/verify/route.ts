import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getUser } from "@/lib/actions/auth";
import { createServiceClient } from "@/lib/supabase/service";

const PLAN_EXPIRY_DAYS: Record<string, number | null> = {
  monthly: 30,
  "half-yearly": 180,
  yearly: 365,
  lifetime: null, // never expires
};

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Calculate expiry
    const expiryDays = PLAN_EXPIRY_DAYS[plan];
    const premiumExpiresAt = expiryDays
      ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Activate premium using service role (bypasses RLS)
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        premium_plan: plan,
        premium_expires_at: premiumExpiresAt,
        premium_order_id: razorpay_order_id,
        premium_payment_id: razorpay_payment_id,
      })
      .eq("id", user.id);

    if (error) {
      console.error("Supabase update error:", error.message);
      return NextResponse.json({ error: "Failed to activate premium" }, { status: 500 });
    }

    return NextResponse.json({ success: true, plan, premiumExpiresAt });
  } catch (err) {
    console.error("Razorpay verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
