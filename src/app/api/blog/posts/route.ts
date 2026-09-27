import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { BlogError, CARD_COLUMNS, rowToCard } from "@/lib/blog/server";
import { savePost } from "@/lib/blog/save";

export const dynamic = "force-dynamic";

/** The signed-in user's own posts, every status. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { data, error } = await serviceDb()
    .from("blog_posts")
    .select(`${CARD_COLUMNS}, review_note`)
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "Couldn't load your posts." }, { status: 500 });
  return NextResponse.json(
    { items: (data ?? []).map((r) => ({ ...rowToCard(r), reviewNote: (r.review_note as string) ?? null })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Creates a post. Body: { title, slug, authorName, coverUrl, tags, contentHtml, action: "draft" | "submit" } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    const post = await savePost(serviceDb(), user, body, body.action === "submit" ? "submit" : "draft");
    return NextResponse.json(post);
  } catch (e) {
    const err = e instanceof BlogError ? e : new BlogError("Couldn't save the post.", 500);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
