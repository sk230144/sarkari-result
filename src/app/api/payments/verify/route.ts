import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { CashfreeError } from "@/lib/payments/cashfree";
import { getPremiumStatus, settleOrder } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** After checkout: GET ?orderId=… -> { state: paid | pending | failed, premium } (checked with Cashfree). */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const orderId = new URL(request.url).searchParams.get("orderId") ?? "";
  if (!/^ja24_[a-z0-9]+_[0-9a-f]{8}$/.test(orderId)) return NextResponse.json({ error: "Unknown order." }, { status: 400 });

  const db = serviceDb();
  try {
    const state = await settleOrder(db, orderId, user.id);
    if (state === "not_found") return NextResponse.json({ error: "Unknown order." }, { status: 404 });
    return NextResponse.json({ state, premium: await getPremiumStatus(db, user.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof CashfreeError ? e.status : 500;
    return NextResponse.json({ error: "Couldn't confirm the payment yet. If money was debited, it will update automatically." }, { status });
  }
}
