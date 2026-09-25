import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { RELATIONSHIPS } from "@/lib/profile/types";

/**
 * Signed-in visitors endorse a public profile (one each, editable by
 * re-posting). Body: { slug, relationship, body }
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to write an endorsement." }, { status: 401 });

  let b: { slug?: unknown; relationship?: unknown; body?: unknown };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const slug = typeof b.slug === "string" ? b.slug : "";
  const relationship = typeof b.relationship === "string" && RELATIONSHIPS.includes(b.relationship) ? b.relationship : null;
  const body = typeof b.body === "string" ? b.body.replace(/\s+/g, " ").trim() : "";
  if (!relationship) return NextResponse.json({ error: "Pick how you know them." }, { status: 400 });
  if (body.length < 20) return NextResponse.json({ error: "Write at least 20 characters." }, { status: 400 });
  if (body.length > 600) return NextResponse.json({ error: "Keep it under 600 characters." }, { status: 400 });

  const db = serviceDb();
  const { data: profile } = await db.from("profiles").select("id, is_public").eq("slug", slug).maybeSingle();
  if (!profile?.is_public) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  if (profile.id === user.id) return NextResponse.json({ error: "You can't endorse yourself." }, { status: 400 });

  const { data: author } = await db.from("profiles").select("full_name, headline").eq("id", user.id).maybeSingle();
  const { error } = await db.from("endorsements").upsert(
    {
      profile_id: profile.id,
      author_id: user.id,
      author_name: (author?.full_name as string) || user.email?.split("@")[0] || "Member",
      author_headline: (author?.headline as string) || null,
      relationship,
      body,
      created_at: new Date().toISOString(),
    },
    { onConflict: "profile_id,author_id" },
  );
  if (error) return NextResponse.json({ error: "Could not save your endorsement." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** The profile owner or the author can remove an endorsement. Body: { id } */
export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = serviceDb();
  const { error } = await db
    .from("endorsements")
    .delete()
    .eq("id", id)
    .or(`profile_id.eq.${user.id},author_id.eq.${user.id}`);
  if (error) return NextResponse.json({ error: "Could not remove it." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
