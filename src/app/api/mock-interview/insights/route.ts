import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import {
  isAnswered,
  type Answer,
  type InsightInterview,
  type Kind,
  type Question,
  type QuestionResult,
  type Summary,
} from "@/lib/interview/types";

export const dynamic = "force-dynamic";

/** Every mock interview of the signed-in user, compacted for the insights page. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { data, error } = await serviceDb()
    .from("mock_interviews")
    .select("id, role, level, status, questions, answers, results, summary, overall_score, time_limit_s, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);
  if (error) return NextResponse.json({ error: "Couldn't load your interviews." }, { status: 500 });

  const items: InsightInterview[] = (data ?? []).map((r) => {
    const questions = (r.questions ?? []) as Question[];
    const answers = (r.answers ?? {}) as Record<string, Answer>;
    const results = (r.results ?? null) as Record<string, QuestionResult> | null;
    const summary = (r.summary ?? null) as Summary | null;
    const secondsSpent = Object.values(answers).reduce((n, a) => n + (a?.seconds ?? 0), 0);

    const byKind: Partial<Record<Kind, number>> = {};
    const graded: InsightInterview["graded"] = [];
    if (results) {
      const sums: Partial<Record<Kind, [number, number]>> = {};
      for (const q of questions) {
        const res = results[q.id];
        if (!res) continue;
        const s = (sums[q.kind] ??= [0, 0]);
        s[0] += res.score;
        s[1] += 1;
        if (isAnswered(q, answers[q.id]) && res.verdict !== "Skipped") {
          graded.push({ id: q.id, kind: q.kind, text: (q.coding?.title ?? q.text).slice(0, 160), score: res.score, verdict: res.verdict });
        }
      }
      for (const [k, [sum, n]] of Object.entries(sums) as [Kind, [number, number]][]) byKind[k] = Math.round((sum / n) * 10) / 10;
    }

    return {
      id: r.id as string,
      role: r.role as string,
      level: r.level as InsightInterview["level"],
      status: r.status as InsightInterview["status"],
      createdAt: r.created_at as string,
      completedAt: (r.completed_at as string) ?? null,
      overallScore: (r.overall_score as number) ?? null,
      dimensions: summary?.dimensions ?? null,
      strengths: summary?.strengths ?? [],
      improvements: summary?.improvements ?? [],
      answered: questions.filter((q) => isAnswered(q, answers[q.id])).length,
      total: questions.length,
      secondsSpent,
      timeLeftS: Math.max(0, (r.time_limit_s as number) - secondsSpent),
      byKind,
      graded,
    };
  });

  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
