import { NextResponse } from "next/server";
import { ROLES } from "@/lib/cover-letter-config";
import { JOB_DESCRIPTION_MAX_CHARS } from "@/lib/resume-text-limits";
import { cleanJobDescription } from "@/lib/jd-clean";
import { GeminiError } from "@/lib/gemini";
import { getSessionUser, serviceDb, remainingInterviews } from "@/lib/server-auth";
import { generateQuestions, previousQuestions, INTERVIEW_COLUMNS, rowToInterview } from "@/lib/interview/server";
import {
  LEVELS,
  isAnswered,
  totalMinutes,
  type Answer,
  type InterviewListItem,
  type Level,
  type Question,
} from "@/lib/interview/types";

export const maxDuration = 60;
const UUID = /^[0-9a-f-]{36}$/i;

/** The user's recent mock interviews. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const db = serviceDb();
  const [list, open] = await Promise.all([
    db
      .from("mock_interviews")
      .select("id, role, level, status, overall_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    // Unfinished ones also need their answers, to show progress.
    db
      .from("mock_interviews")
      .select("id, questions, answers, time_limit_s")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const progress = new Map(
    (open.data ?? []).map((r) => {
      const questions = r.questions as Question[];
      const answers = (r.answers ?? {}) as Record<string, Answer>;
      const used = Object.values(answers).reduce((n, a) => n + (a.seconds ?? 0), 0);
      return [
        r.id as string,
        {
          answered: questions.filter((q) => isAnswered(q, answers[q.id])).length,
          total: questions.length,
          timeLeftS: Math.max(0, (r.time_limit_s as number) - used),
        },
      ];
    }),
  );
  const items: InterviewListItem[] = (list.data ?? []).map((r) => ({
    id: r.id,
    role: r.role,
    level: r.level,
    status: r.status,
    overallScore: r.overall_score,
    createdAt: r.created_at,
    ...progress.get(r.id),
  }));
  return NextResponse.json({ items, remaining: await remainingInterviews(db, user) });
}

/** Creates a new interview. Body: { cvId, role, jd?, level } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const cvId = typeof b.cvId === "string" && UUID.test(b.cvId) ? b.cvId : null;
  const role = typeof b.role === "string" && ROLES.includes(b.role) ? b.role : null;
  const level = LEVELS.find((l) => l.key === b.level)?.key as Level | undefined;
  const jdRaw = typeof b.jd === "string" ? b.jd : "";
  if (!cvId || !role || !level) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (jdRaw.length > JOB_DESCRIPTION_MAX_CHARS) return NextResponse.json({ error: "Job description is too long." }, { status: 413 });

  const db = serviceDb();
  const remaining = await remainingInterviews(db, user);
  if (remaining === 0) {
    return NextResponse.json({ error: "You've reached today's mock interview limit. It resets within 24 hours." }, { status: 429 });
  }

  const { data: cv } = await db.from("cv_documents").select("id, cleaned_text").eq("id", cvId).eq("user_id", user.id).maybeSingle();
  if (!cv) return NextResponse.json({ error: "Resume not found. Please re-select it." }, { status: 404 });

  let questions;
  try {
    questions = await generateQuestions(db, user.id, {
      cvText: cv.cleaned_text as string,
      role,
      jd: cleanJobDescription(jdRaw),
      level,
      avoid: await previousQuestions(db, user.id),
    });
  } catch (err) {
    const e = err instanceof GeminiError ? err : null;
    if (!e) console.error("interview generation failed", err);
    return NextResponse.json({ error: e?.message ?? "Couldn't prepare your interview. Please try again." }, { status: e?.status ?? 500 });
  }

  const { data: row, error } = await db
    .from("mock_interviews")
    .insert({
      user_id: user.id,
      cv_id: cv.id,
      role,
      level,
      questions,
      time_limit_s: Math.round(totalMinutes(questions) * 60),
    })
    .select(INTERVIEW_COLUMNS)
    .single();
  if (error || !row) {
    console.error("interview insert failed", error?.message);
    return NextResponse.json({ error: "Couldn't save your interview." }, { status: 500 });
  }
  return NextResponse.json(rowToInterview(row));
}
