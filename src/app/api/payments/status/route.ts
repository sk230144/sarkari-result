import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { getPremiumStatus } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** The signed-in user's PRO+ status, plus their saved phone to prefill checkout. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const db = serviceDb();
  const [premium, prof] = await Promise.all([
    getPremiumStatus(db, user.id),
    db.from("profiles").select("apply_details").eq("id", user.id).maybeSingle(),
  ]);
  const phone = ((prof.data?.apply_details as Record<string, string> | null)?.phone ?? "").replace(/\D/g, "").slice(-10);
  return NextResponse.json({ ...premium, phone }, { headers: { "Cache-Control": "no-store" } });
}
