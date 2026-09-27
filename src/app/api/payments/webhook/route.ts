import { NextResponse } from "next/server";
import { serviceDb } from "@/lib/server-auth";
import { validWebhook } from "@/lib/payments/cashfree";
import { settleOrder } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/**
 * Cashfree webhook. Only signed requests are accepted, and even then the
 * order is re-read from Cashfree before premium is granted, so the body is
 * never trusted on its own. This is what activates premium when the buyer
 * closes the tab before returning to the site.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!validWebhook(raw, request.headers.get("x-webhook-timestamp"), request.headers.get("x-webhook-signature"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let orderId = "";
  try {
    const body = JSON.parse(raw) as { type?: string; data?: { order?: { order_id?: string } } };
    orderId = body.data?.order?.order_id ?? "";
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (!orderId.startsWith("ja24_")) return NextResponse.json({ ok: true });

  try {
    await settleOrder(serviceDb(), orderId);
    return NextResponse.json({ ok: true });
  } catch {
    // A 5xx makes Cashfree retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
