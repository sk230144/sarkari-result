import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { SHEETS } from "@/lib/progress/sheets";
import type { ActivityKind, ProgressData } from "@/lib/progress/types";

export const dynamic = "force-dynamic";

/**
 * Everything the Progress page shows, computed from the signed-in user's
 * real activity: solved sheet questions, finished tasks, generated cover
 * letters and resume analyses. One request, all read-only.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const db = serviceDb();
  const [progress, tasks, letters, reports, profile] = await Promise.all([
    db.from("sheet_progress").select("sheet_key, solved_at").eq("user_id", user.id).eq("solved", true).limit(20000),
    db.from("tasks").select("tag, status, completed_at").eq("user_id", user.id).limit(5000),
    db.from("cover_letters").select("created_at").eq("user_id", user.id).limit(5000),
    db.from("resume_reports").select("created_at").eq("user_id", user.id).limit(5000),
    db.from("profiles").select("is_public, headline, projects, skills, experience").eq("id", user.id).maybeSingle(),
  ]);

  const solvedBySheet = new Map<string, number>();
  const events: ProgressData["events"] = [];
  const known = new Map(SHEETS.map((s) => [s.key, s]));

  for (const row of progress.data ?? []) {
    const key = row.sheet_key as string;
    solvedBySheet.set(key, (solvedBySheet.get(key) ?? 0) + 1);
    const sheet = known.get(key);
    if (row.solved_at && sheet) {
      events.push({ t: row.solved_at as string, k: sheet.kind === "system-design" ? "design" : "problem" });
    }
  }

  let tasksDone = 0;
  let jobsApplied = 0;
  for (const t of tasks.data ?? []) {
    if (t.status !== "done") continue;
    tasksDone++;
    if (t.tag === "Applied") jobsApplied++;
    if (t.completed_at) events.push({ t: t.completed_at as string, k: "task" });
  }
  for (const l of letters.data ?? []) events.push({ t: l.created_at as string, k: "letter" as ActivityKind });
  for (const r of reports.data ?? []) events.push({ t: r.created_at as string, k: "analysis" as ActivityKind });

  const sheets = SHEETS.map((s) => ({ ...s, solved: Math.min(s.total, solvedBySheet.get(s.key) ?? 0) }));
  const problemSheets = sheets.filter((s) => s.kind !== "system-design");
  const design = sheets.find((s) => s.kind === "system-design");

  // A portfolio counts as ready once it's public and has something to show.
  const p = profile.data;
  const projects = Array.isArray(p?.projects) ? p.projects.length : 0;
  const portfolio = Boolean(p?.is_public && projects > 0 && p?.headline);
  const portfolioHint = portfolio
    ? null
    : !p?.headline
      ? "Add a headline to your profile"
      : !projects
        ? "Add at least one project"
        : "Make your profile public";

  const body: ProgressData = {
    sheets,
    counts: {
      problemsSolved: problemSheets.reduce((n, s) => n + s.solved, 0),
      problemsTotal: problemSheets.reduce((n, s) => n + s.total, 0),
      designSolved: design?.solved ?? 0,
      designTotal: design?.total ?? 0,
      coverLetters: letters.data?.length ?? 0,
      analyses: reports.data?.length ?? 0,
      tasksDone,
      jobsApplied,
    },
    events,
    readiness: {
      ats: (reports.data?.length ?? 0) > 0,
      portfolio,
      portfolioHint,
      coverLetter: (letters.data?.length ?? 0) > 0,
      applied: jobsApplied > 0,
    },
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
