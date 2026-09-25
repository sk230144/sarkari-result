import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";

const UUID = /^[0-9a-f-]{36}$/i;
const SEND_LIMIT_PER_DAY = 10;

/** A signed-in visitor messages a public profile's owner. Body: { slug, body } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to send a message." }, { status: 401 });

  let b: { slug?: unknown; body?: unknown };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = typeof b.body === "string" ? b.body.replace(/\r\n?/g, "\n").trim() : "";
  if (body.length < 10) return NextResponse.json({ error: "Write at least 10 characters." }, { status: 400 });
  if (body.length > 1000) return NextResponse.json({ error: "Keep it under 1000 characters." }, { status: 400 });

  const db = serviceDb();
  const { data: profile } = await db
    .from("profiles")
    .select("id, is_public")
    .eq("slug", typeof b.slug === "string" ? b.slug : "")
    .maybeSingle();
  if (!profile?.is_public) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  if (profile.id === user.id) return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await db
    .from("profile_messages")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= SEND_LIMIT_PER_DAY) {
    return NextResponse.json({ error: "You've sent a lot of messages today. Try again tomorrow." }, { status: 429 });
  }

  const { data: sender } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { error } = await db.from("profile_messages").insert({
    profile_id: profile.id,
    sender_id: user.id,
    sender_name: (sender?.full_name as string) || user.email?.split("@")[0] || "Member",
    sender_email: user.email ?? "",
    body,
  });
  if (error) return NextResponse.json({ error: "Could not send your message." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Owner marks a message read/unread. Body: { id, read } */
export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let b: { id?: unknown; read?: unknown };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof b.id !== "string" || !UUID.test(b.id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await serviceDb()
    .from("profile_messages")
    .update({ read: b.read === true })
    .eq("id", b.id)
    .eq("profile_id", user.id);
  return NextResponse.json({ ok: true });
}

/** Owner deletes a message. Body: { id } */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof id !== "string" || !UUID.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await serviceDb().from("profile_messages").delete().eq("id", id).eq("profile_id", user.id);
  return NextResponse.json({ ok: true });
}
