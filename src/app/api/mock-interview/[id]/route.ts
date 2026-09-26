import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { INTERVIEW_COLUMNS, rowToInterview } from "@/lib/interview/server";
import { cleanAnswers } from "@/lib/interview/answers";
import type { Question } from "@/lib/interview/types";

const UUID = /^[0-9a-f-]{36}$/i;

async function load(id: string, userId: string) {
  if (!UUID.test(id)) return null;
  const { data } = await serviceDb().from("mock_interviews").select(INTERVIEW_COLUMNS).eq("id", id).eq("user_id", userId).maybeSingle();
  return data;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const row = await load((await params).id, user.id);
  if (!row) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  return NextResponse.json(rowToInterview(row), { headers: { "Cache-Control": "no-store" } });
}

/** Autosave answers while the interview is in progress. Body: { answers } */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > 300_000) {
    return NextResponse.json({ error: "Too large." }, { status: 413 });
  }
  const row = await load((await params).id, user.id);
  if (!row) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  if (row.status !== "in_progress") return NextResponse.json({ error: "This interview is already submitted." }, { status: 409 });

  let body: { answers?: unknown; start?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // The clock starts when the candidate presses Start, not when questions were generated.
  if (body.start === true) {
    const hasAnswers = Object.keys((row.answers as object) ?? {}).length > 0;
    const startedAt = hasAnswers ? (row.started_at as string) : new Date().toISOString();
    if (!hasAnswers) await serviceDb().from("mock_interviews").update({ started_at: startedAt }).eq("id", row.id);
    return NextResponse.json({ ok: true, startedAt });
  }
  const answers = cleanAnswers(body.answers, row.questions as Question[]);
  await serviceDb()
    .from("mock_interviews")
    .update({ answers, updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .eq("status", "in_progress");
  return NextResponse.json({ ok: true });
}

/** Deletes an interview (from the history list). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const id = (await params).id;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await serviceDb().from("mock_interviews").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
