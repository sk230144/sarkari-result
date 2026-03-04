import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getUser } from "@/lib/actions/auth";

const PLAN_AMOUNTS: Record<string, number> = {
  monthly: 4900,       // ₹49 in paise
  "half-yearly": 25000, // ₹250 in paise
  yearly: 45000,        // ₹450 in paise
  lifetime: 250000,     // ₹2,500 in paise
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

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

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${user.id}_${Date.now()}`,
      notes: {
        plan,
        user_id: user.id,
        email: user.email || "",
      },
    });

    return NextResponse.json({ orderId: order.id, amount, plan });
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
