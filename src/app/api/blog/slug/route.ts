import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { slugTaken } from "@/lib/blog/server";
import { SLUG_MAX, SLUG_RE } from "@/lib/blog/types";

/** Is this slug free? GET ?slug=...&id=<the post being edited, optional> */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const q = new URL(request.url).searchParams;
  const slug = (q.get("slug") ?? "").trim().toLowerCase();
  const id = q.get("id") ?? undefined;
  if (slug.length < 3 || slug.length > SLUG_MAX || !SLUG_RE.test(slug)) {
    return NextResponse.json({ available: false, reason: "Use 3-90 lowercase letters, numbers and single dashes." });
  }
  const taken = await slugTaken(serviceDb(), slug, id && /^[0-9a-f-]{36}$/i.test(id) ? id : undefined);
  return NextResponse.json({ available: !taken, reason: taken ? "Already used by another post." : null });
}
