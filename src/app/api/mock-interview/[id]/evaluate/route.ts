import { NextResponse } from "next/server";
import { GeminiError } from "@/lib/gemini";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { evaluateInterview, INTERVIEW_COLUMNS, rowToInterview } from "@/lib/interview/server";
import { cleanAnswers } from "@/lib/interview/answers";
import type { Level, Question } from "@/lib/interview/types";

export const maxDuration = 120;
const UUID = /^[0-9a-f-]{36}$/i;

/** Submits the interview: saves final answers, grades them, stores the debrief. Body: { answers } */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const id = (await params).id;
  if (!UUID.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  let body: { answers?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* evaluate with what's already saved */
  }

  const db = serviceDb();
  const { data: row } = await db
    .from("mock_interviews")
    .select("id, role, level, status, questions, answers, cv_id, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  if (row.status === "completed") {
    const { data: done } = await db.from("mock_interviews").select(INTERVIEW_COLUMNS).eq("id", id).single();
    return NextResponse.json(rowToInterview(done!));
  }

  const questions = row.questions as Question[];
  const answers = body.answers ? cleanAnswers(body.answers, questions) : (row.answers as Record<string, never>);

  // Claim the row so a double click can't grade (and bill) it twice. A claim
  // older than 3 minutes is a run that died, so it can be taken over.
  const stale = new Date(Date.now() - 3 * 60_000).toISOString();
  const { data: claimed } = await db
    .from("mock_interviews")
    .update({ status: "evaluating", answers, updated_at: new Date().toISOString() })
    .eq("id", id)
    .or(`status.eq.in_progress,and(status.eq.evaluating,updated_at.lt.${stale})`)
    .select("id")
    .maybeSingle();
  if (!claimed) {
    return NextResponse.json({ error: "This interview is already being evaluated.", evaluating: true }, { status: 409 });
  }

  const { data: cv } = row.cv_id
    ? await db.from("cv_documents").select("cleaned_text").eq("id", row.cv_id).maybeSingle()
    : { data: null };

  try {
    const { results, summary, overall } = await evaluateInterview(
      db,
      user.id,
      { role: row.role as string, level: row.level as Level, questions, answers },
      (cv?.cleaned_text as string) ?? "",
    );
    const { data: done, error } = await db
      .from("mock_interviews")
      .update({
        status: "completed",
        results,
        summary,
        overall_score: overall,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(INTERVIEW_COLUMNS)
      .single();
    if (error || !done) throw new Error(error?.message ?? "save failed");
    return NextResponse.json(rowToInterview(done));
  } catch (err) {
    // Hand the interview back so the user can retry.
    await db.from("mock_interviews").update({ status: "in_progress" }).eq("id", id);
    const e = err instanceof GeminiError ? err : null;
    if (!e) console.error("interview evaluation failed", err);
    return NextResponse.json({ error: e?.message ?? "Couldn't evaluate your interview. Please try again." }, { status: e?.status ?? 500 });
  }
}
