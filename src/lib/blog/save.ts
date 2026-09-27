import "server-only";
import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { WORDS_MIN, type BlogDraft } from "./types";
import { BlogError, POST_COLUMNS, rowToPost, slugTaken, validateDraft } from "./server";

export type SaveAction = "draft" | "submit";

async function authorFallback(db: SupabaseClient, user: User) {
  const { data } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  return (data?.full_name as string)?.trim() || "Job Alert 24 Writer";
}

/**
 * Creates or updates a post. "draft" keeps it private; "submit" sends it for
 * review (admins publish straight away). Published posts are locked.
 */
export async function savePost(
  db: SupabaseClient,
  user: User,
  input: Partial<BlogDraft>,
  action: SaveAction,
  id?: string,
) {
  const admin = isAdminEmail(user.email);
  let existing: Record<string, unknown> | null = null;
  if (id) {
    const { data } = await db.from("blog_posts").select("id, author_id, status").eq("id", id).maybeSingle();
    if (!data || (data.author_id !== user.id && !admin)) throw new BlogError("Post not found.", 404);
    if (data.status === "published" && !admin) throw new BlogError("Published posts can't be edited. Contact us to change one.", 409);
    existing = data;
  } else {
    // A light cap on new posts, well above what a real writer needs.
    const since = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count } = await db.from("blog_posts").select("id", { count: "exact", head: true }).eq("author_id", user.id).gte("created_at", since);
    if (!admin && (count ?? 0) >= 10) throw new BlogError("You've started 10 posts today. Try again tomorrow.", 429);
  }

  const cols = validateDraft(input, await authorFallback(db, user));
  if (await slugTaken(db, cols.slug, id)) throw new BlogError("That URL slug is already used. Pick another.", 409);

  const now = new Date().toISOString();
  const status =
    action === "draft"
      ? existing?.status === "published"
        ? "published"
        : "draft"
      : admin
        ? "published"
        : "pending";
  if (action === "submit" && cols.word_count < WORDS_MIN) {
    throw new BlogError(`Posts need at least ${WORDS_MIN} words to submit (this one has ${cols.word_count}).`);
  }

  const row = {
    ...cols,
    status,
    updated_at: now,
    ...(action === "submit" ? { submitted_at: now, review_note: null } : {}),
    ...(status === "published" && existing?.status !== "published" ? { published_at: now } : {}),
  };

  const q = id
    ? db.from("blog_posts").update(row).eq("id", id)
    : db.from("blog_posts").insert({ ...row, author_id: user.id, created_at: now });
  const { data, error } = await q.select(POST_COLUMNS).single();
  if (error) {
    if (error.code === "23505") throw new BlogError("That URL slug is already used. Pick another.", 409);
    console.error("blog save failed", error.message);
    throw new BlogError("Couldn't save the post. Please try again.", 500);
  }
  // The listing is cached for a minute; refresh it when a live post changes.
  if (status === "published" || existing?.status === "published") revalidatePath("/blog");
  return rowToPost(data);
}
