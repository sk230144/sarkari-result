import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { viewerHash } from "@/lib/profile/server";

/**
 * Counts a view of a public profile: once per visitor per day, never the
 * owner viewing their own page. Body: { slug }
 */
export async function POST(request: Request) {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof slug !== "string" || !/^[a-z0-9-]{3,30}$/.test(slug)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = serviceDb();
  const { data: profile } = await db.from("profiles").select("id, is_public").eq("slug", slug).maybeSingle();
  if (!profile?.is_public) return NextResponse.json({ ok: false }, { status: 404 });

  const user = await getSessionUser();
  if (user?.id === profile.id) return NextResponse.json({ ok: true, counted: false });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const ua = request.headers.get("user-agent") ?? "";
  // Crawlers are not people looking at the profile.
  if (/bot|crawler|spider|preview|curl|wget|headless/i.test(ua)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  await db
    .from("profile_views")
    .upsert(
      { profile_id: profile.id, viewer_hash: viewerHash(user?.id ?? ip, ua) },
      { onConflict: "profile_id,viewer_hash,day", ignoreDuplicates: true },
    );
  return NextResponse.json({ ok: true, counted: true });
}
