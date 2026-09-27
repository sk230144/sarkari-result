import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import { serviceDb } from "@/lib/server-auth";

/** Admin review. Body: { action: "approve" | "reject", note? } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const id = (await params).id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });
  let body: { action?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";
  const update =
    body.action === "approve"
      ? { status: "published", published_at: now, review_note: null, updated_at: now }
      : body.action === "reject"
        ? { status: "rejected", review_note: note || "Needs changes before it can be published.", updated_at: now }
        : null;
  if (!update) return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  const { data, error } = await serviceDb().from("blog_posts").update(update).eq("id", id).eq("status", "pending").select("id, status").maybeSingle();
  if (error) return NextResponse.json({ error: "Couldn't update the post." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "That post is no longer waiting for review." }, { status: 409 });
  revalidatePath("/blog");
  return NextResponse.json(data);
}
