import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { isAdmin } from "@/lib/admin";

const CATEGORIES = ["bug", "idea", "praise", "other"];
const DAILY_LIMIT = 10;

/** Signed-in users send feedback. Body: { category, rating?, message, page? } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in to send feedback." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const category = typeof b.category === "string" && CATEGORIES.includes(b.category) ? b.category : null;
  const message = typeof b.message === "string" ? b.message.replace(/\r\n?/g, "\n").trim() : "";
  const rating = typeof b.rating === "number" && Number.isInteger(b.rating) && b.rating >= 1 && b.rating <= 5 ? b.rating : null;
  const page = typeof b.page === "string" && /^\/[\w\-/#?=&.%]*$/.test(b.page) ? b.page.slice(0, 200) : null;

  if (!category) return NextResponse.json({ error: "Pick what your feedback is about." }, { status: 400 });
  if (message.length < 5) return NextResponse.json({ error: "Please write a little more (at least 5 characters)." }, { status: 400 });
  if (message.length > 2000) return NextResponse.json({ error: "Keep it under 2000 characters." }, { status: 400 });

  const db = serviceDb();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await db.from("feedback").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json({ error: "Thanks! You've sent a lot of feedback today. Please try again tomorrow." }, { status: 429 });
  }

  const { data: profile } = await db.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
  const { error } = await db.from("feedback").insert({
    user_id: user.id,
    name: (profile?.full_name as string) || null,
    email: user.email ?? "",
    category,
    rating,
    message,
    page,
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 300),
  });
  if (error) {
    console.error("feedback insert failed", error.message);
    return NextResponse.json({ error: "Couldn't send your feedback. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Admin only: mark resolved / reopen. Body: { id, resolved } */
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not found." }, { status: 404 });
  let b: { id?: unknown; resolved?: unknown };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof b.id !== "string" || !/^[0-9a-f-]{36}$/i.test(b.id)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { error } = await serviceDb()
    .from("feedback")
    .update({ resolved_at: b.resolved === true ? new Date().toISOString() : null })
    .eq("id", b.id);
  if (error) return NextResponse.json({ error: "Couldn't update it." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Admin only: delete. Body: { id } */
export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not found." }, { status: 404 });
  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await serviceDb().from("feedback").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
