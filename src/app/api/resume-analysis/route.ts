import { NextResponse } from "next/server";
import { ROLES } from "@/lib/cover-letter-config";
import { JOB_DESCRIPTION_MAX_CHARS } from "@/lib/resume-text-limits";
import { cleanJobDescription } from "@/lib/jd-clean";
import { GeminiError } from "@/lib/gemini";
import { getSessionUser, serviceDb, remainingAnalyses } from "@/lib/server-auth";
import { buildReport, jdHashFor } from "@/lib/analyzer/server";
import type { AnalysisReport, AnalysisResult } from "@/lib/analyzer/config";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Resume match report. Body: { cvId, role, jd? }
 * Served from cache for a known (resume, JD) pair; otherwise at most three
 * small AI calls, each itself cached (CV profile, shared JD profile, role
 * risk), plus the per-pair judgment call.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: { cvId?: unknown; role?: unknown; jd?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cvId = typeof body.cvId === "string" && UUID.test(body.cvId) ? body.cvId : null;
  const role = typeof body.role === "string" && ROLES.includes(body.role) ? body.role : null;
  const jdRaw = typeof body.jd === "string" ? body.jd : "";
  if (!cvId || !role) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (jdRaw.length > JOB_DESCRIPTION_MAX_CHARS) {
    return NextResponse.json(
      { error: `Job description is too long (max ${JOB_DESCRIPTION_MAX_CHARS} characters).` },
      { status: 413 },
    );
  }

  const db = serviceDb();
  const { data: cv } = await db
    .from("cv_documents")
    .select("id, cleaned_text")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cv) return NextResponse.json({ error: "Resume not found. Please re-select it." }, { status: 404 });

  const jdClean = cleanJobDescription(jdRaw);
  const jdHash = jdHashFor(jdClean, role);

  const remaining = await remainingAnalyses(db, user);

  const { data: existing } = await db
    .from("resume_reports")
    .select("id, report, created_at")
    .eq("cv_id", cv.id)
    .eq("jd_hash", jdHash)
    .maybeSingle();
  if (existing) {
    const result: AnalysisResult = {
      id: existing.id,
      report: existing.report as AnalysisReport,
      cached: true,
      createdAt: existing.created_at,
      remaining,
    };
    return NextResponse.json(result);
  }

  if (remaining === 0) {
    return NextResponse.json(
      { error: "You've reached today's analysis limit. It resets within 24 hours." },
      { status: 429 },
    );
  }

  let report: AnalysisReport;
  try {
    report = await buildReport(db, user.id, cv, jdHash, jdClean, role);
  } catch (err) {
    const e = err instanceof GeminiError ? err : null;
    if (!e) console.error("resume analysis failed", err);
    return NextResponse.json(
      { error: e?.message ?? "Could not analyse your resume. Please try again." },
      { status: e?.status ?? 500 },
    );
  }

  const { data: saved, error } = await db
    .from("resume_reports")
    .upsert({ user_id: user.id, cv_id: cv.id, jd_hash: jdHash, report }, { onConflict: "cv_id,jd_hash" })
    .select("id, created_at")
    .single();
  if (error || !saved) {
    console.error("resume_reports save failed", error?.message);
    return NextResponse.json({ error: "Could not save the report." }, { status: 500 });
  }

  const result: AnalysisResult = {
    id: saved.id,
    report,
    cached: false,
    createdAt: saved.created_at,
    remaining: remaining === null ? null : remaining - 1,
  };
  return NextResponse.json(result);
}
