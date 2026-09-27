import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { issueKey } from "@/lib/access-key";
import { hasProAccess } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/** The signed-in user's current access key (PRO+ and admin only). A new one is issued every 12 hours. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  // Free accounts see the section but never receive a key, so it can't be read from the network either.
  if (!(await hasProAccess(serviceDb(), user))) {
    return NextResponse.json({ locked: true }, { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const k = await issueKey(serviceDb(), user.id, user.created_at);
    return NextResponse.json(k, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("access key issue failed", e);
    return NextResponse.json(
      { error: "Access keys aren't set up yet. Run migration 0018_access_keys.sql in Supabase." },
      { status: 503 },
    );
  }
}
