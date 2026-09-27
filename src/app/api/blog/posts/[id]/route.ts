import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/admin";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { BlogError, POST_COLUMNS, rowToPost } from "@/lib/blog/server";
import { savePost } from "@/lib/blog/save";

const UUID = /^[0-9a-f-]{36}$/i;

async function mine(id: string) {
  const user = await getSessionUser();
  if (!user) return { user: null, row: null };
  if (!UUID.test(id)) return { user, row: null };
  const { data } = await serviceDb().from("blog_posts").select(POST_COLUMNS).eq("id", id).maybeSingle();
  if (!data || (data.author_id !== user.id && !isAdminEmail(user.email))) return { user, row: null };
  return { user, row: data };
}

/** One of the user's posts, for the editor. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, row } = await mine((await params).id);
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!row) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json(rowToPost(row), { headers: { "Cache-Control": "no-store" } });
}

/** Saves edits. Body as for creating, with action "draft" | "submit". */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const id = (await params).id;
  if (!UUID.test(id)) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    return NextResponse.json(await savePost(serviceDb(), user, body, body.action === "submit" ? "submit" : "draft", id));
  } catch (e) {
    const err = e instanceof BlogError ? e : new BlogError("Couldn't save the post.", 500);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}

/** Deletes a draft, pending or rejected post (published ones stay). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, row } = await mine((await params).id);
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!row) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  if (row.status === "published" && !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Published posts can't be deleted here. Contact us." }, { status: 409 });
  }
  await serviceDb().from("blog_posts").delete().eq("id", row.id);
  revalidatePath("/blog");
  return NextResponse.json({ ok: true });
}
