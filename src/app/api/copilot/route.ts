import { NextResponse } from "next/server";
import {
  getSessionUser,
  serviceDb,
  remainingAiCalls,
  remainingAnalyses,
  DAILY_AI_LIMIT,
  DAILY_ANALYSIS_LIMIT,
} from "@/lib/server-auth";
import { LETTER_COLUMNS, toLetterResult, type LetterRow } from "@/lib/cover-letter-server";
import type { AnalysisReport } from "@/lib/analyzer/config";
import type { CopilotData } from "@/lib/copilot-types";

export const dynamic = "force-dynamic";

/** "…at Razorpay…" / "Join Stripe" → company name, when the JD names one. */
function companyFrom(jd: string | null): string | null {
  const m = jd?.match(/\b(?:[Aa]t|[Jj]oin)\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*){0,2})/);
  return m?.[1] ?? null;
}

/** The AI Copilot dashboard: recent letters and analyses, today's usage, invite link. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const db = serviceDb();
  const [letters, reports, profile, referrals, lettersLeft, analysesLeft] = await Promise.all([
    db
      .from("cover_letters")
      .select(`${LETTER_COLUMNS}, jd_clean`)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(6),
    db
      .from("resume_reports")
      .select("id, report, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    db.from("profiles").select("slug").eq("id", user.id).maybeSingle(),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", user.id),
    remainingAiCalls(db, user),
    remainingAnalyses(db, user),
  ]);

  const letterResults = await Promise.all(
    ((letters.data ?? []) as (LetterRow & { jd_clean: string | null })[]).map(async (row) => ({
      ...(await toLetterResult(db, user, row, true, lettersLeft)),
      company: companyFrom(row.jd_clean),
      jd: row.jd_clean ?? "",
    })),
  );

  const body: CopilotData = {
    letters: letterResults,
    analyses: (reports.data ?? []).map((r) => ({
      id: r.id as string,
      report: r.report as AnalysisReport,
      cached: true,
      createdAt: r.created_at as string,
      remaining: analysesLeft,
    })),
    usage: {
      letters: lettersLeft === null ? null : { used: DAILY_AI_LIMIT - lettersLeft, limit: DAILY_AI_LIMIT },
      analyses: analysesLeft === null ? null : { used: DAILY_ANALYSIS_LIMIT - analysesLeft, limit: DAILY_ANALYSIS_LIMIT },
    },
    invite: { slug: (profile.data?.slug as string) ?? null, referrals: referrals.count ?? 0 },
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
