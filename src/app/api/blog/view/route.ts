import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { viewerHash } from "@/lib/profile/server";
import { SLUG_RE } from "@/lib/blog/types";

/** Counts a view of a published post: once per visitor per day, not the author. Body: { slug } */
export async function POST(request: Request) {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) return NextResponse.json({ ok: false }, { status: 400 });

  const ua = request.headers.get("user-agent") ?? "";
  if (/bot|crawler|spider|preview|curl|wget|headless/i.test(ua)) return NextResponse.json({ ok: true, counted: false });

  const db = serviceDb();
  const { data: post } = await db.from("blog_posts").select("id, author_id").eq("slug", slug).eq("status", "published").maybeSingle();
  if (!post) return NextResponse.json({ ok: false }, { status: 404 });
  const user = await getSessionUser();
  if (user && user.id === post.author_id) return NextResponse.json({ ok: true, counted: false });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
  const { data } = await db.rpc("blog_count_view", { p_post: post.id, p_viewer: viewerHash(user?.id ?? ip, ua) });
  return NextResponse.json({ ok: true, counted: Boolean(data) });
}
