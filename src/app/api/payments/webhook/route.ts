import { NextResponse } from "next/server";
import { serviceDb } from "@/lib/server-auth";
import { validWebhook } from "@/lib/payments/cashfree";
import { settleOrder } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/**
 * Our order id from any webhook version: data.order.order_id (2023/2025
 * versions), with a shallow search as a fallback in case a newer version
 * moves it. Only ids we issued (ja24_…) are accepted.
 */
function findOrderId(body: unknown): string | null {
  const ours = (v: unknown) => (typeof v === "string" && /^ja24_[a-z0-9]+_[0-9a-f]{8}$/.test(v) ? v : null);
  const b = body as { data?: { order?: { order_id?: unknown }; order_id?: unknown } };
  const direct = ours(b?.data?.order?.order_id) ?? ours(b?.data?.order_id);
  if (direct) return direct;
  const walk = (v: unknown, depth: number): string | null => {
    if (!v || typeof v !== "object" || depth > 4) return null;
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (k === "order_id" && ours(val)) return val as string;
      const found = walk(val, depth + 1);
      if (found) return found;
    }
    return null;
  };
  return walk(body, 0);
}

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
  let type = "";
  try {
    const body = JSON.parse(raw) as { type?: string };
    type = String(body.type ?? "");
    orderId = findOrderId(body) ?? "";
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (!orderId) {
    // Test pings and events for other orders; log the type only, never the body.
    console.warn("payments webhook: no ja24 order id in", type || "event");
    return NextResponse.json({ ok: true });
  }

  try {
    await settleOrder(serviceDb(), orderId);
    return NextResponse.json({ ok: true });
  } catch {
    // A 5xx makes Cashfree retry later.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
