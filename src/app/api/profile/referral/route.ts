import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";

/**
 * Credits an invite once, right after a new user verifies their email.
 * Body: { ref } — the inviter's profile slug from /signup?ref=…
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  let ref: unknown;
  try {
    ({ ref } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof ref !== "string" || !/^[a-z0-9-]{3,30}$/.test(ref)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Only brand-new accounts can be credited, so nobody re-assigns an old one.
  const ageMs = Date.now() - Date.parse(user.created_at);
  if (!(ageMs < 24 * 3600 * 1000)) return NextResponse.json({ ok: false }, { status: 409 });

  const db = serviceDb();
  const { data: inviter } = await db.from("profiles").select("id").eq("slug", ref).maybeSingle();
  if (!inviter || inviter.id === user.id) return NextResponse.json({ ok: false }, { status: 404 });

  await db.from("profiles").update({ referred_by: inviter.id }).eq("id", user.id).is("referred_by", null);
  return NextResponse.json({ ok: true });
}
