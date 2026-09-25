"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LogIn, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { countByDay, streaks } from "@/lib/progress/days";
import type { ProgressData } from "@/lib/progress/types";
import { MetricCards } from "./metric-cards";
import { ActivityChart } from "./activity-chart";
import { StreakCalendar } from "./streak-calendar";
import { ReadinessChecklist } from "./readiness-checklist";
import { SkillAnalysis, type SkillAxis } from "./skill-analysis";
import { CategoryBreakdown } from "./category-breakdown";

/** Targets that count as "interview-ready" on the skill radar. */
const TARGETS = { dsa: 150, letters: 5, analyses: 3 };

const pct = (n: number, of: number) => (of ? Math.min(100, Math.round((n / of) * 100)) : 0);

function Skeleton() {
  const box = "animate-pulse rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)]";
  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${box} h-[92px] rounded-xl`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className={`${box} h-[330px] lg:col-span-8`} />
        <div className={`${box} h-[330px] lg:col-span-4`} />
      </div>
      <div className={`${box} h-[260px]`} />
    </>
  );
}

export function ProgressView() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/progress", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load your progress.");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your progress.");
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    load();
    // Solving a problem in another tab should show up when the user comes back.
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, authLoading, load]);

  const byDay = useMemo(() => countByDay(data?.events ?? []), [data]);
  const streak = useMemo(() => streaks(byDay), [byDay]);

  const axes: SkillAxis[] = useMemo(() => {
    const c = data?.counts;
    if (!c) return [];
    return [
      { label: "DSA", score: pct(c.problemsSolved, TARGETS.dsa), detail: `${c.problemsSolved} solved, target ${TARGETS.dsa}` },
      { label: "System Design", score: pct(c.designSolved, c.designTotal), detail: `${c.designSolved}/${c.designTotal} questions` },
      { label: "Cover Letters", score: pct(c.coverLetters, TARGETS.letters), detail: `${c.coverLetters} written, target ${TARGETS.letters}` },
      { label: "Mock Interviews", score: 0, detail: "coming soon" },
      { label: "Resume Analyses", score: pct(c.analyses, TARGETS.analyses), detail: `${c.analyses} run, target ${TARGETS.analyses}` },
    ];
  }, [data]);

  async function markApplied() {
    if (!user) return;
    const { error: err } = await supabaseBrowser()
      .from("tasks")
      .insert({ user_id: user.id, title: "Applied to a job", tag: "Applied", status: "done" });
    if (err) setError("Couldn't save that. Please try again.");
    else await load();
  }

  if (!authLoading && !user) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-c-emerald)]/15 text-[var(--color-c-emerald)]">
          <LogIn className="h-6 w-6" />
        </span>
        <h2 className="text-[18px] font-bold text-[var(--color-c-text)]">Sign in to see your progress</h2>
        <p className="max-w-md text-[13px] text-[var(--color-c-muted)]">
          Your solved problems, streaks, tasks and readiness are tracked on your account, so they follow you across
          devices.
        </p>
        <Link
          href="/login?next=/resources"
          className="rounded-lg bg-[var(--color-c-emerald)] px-5 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] hover:bg-[var(--color-c-forest-13)]"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.06] px-6 py-10 text-center">
        <p className="text-[13px] text-red-300">{error}</p>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-[var(--color-c-text)] hover:bg-white/5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  if (!data) return <Skeleton />;

  return (
    <>
      <MetricCards
        solved={data.counts.problemsSolved}
        total={data.counts.problemsTotal}
        currentStreak={streak.current}
        longestStreak={streak.longest}
        jobsApplied={data.counts.jobsApplied}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <ActivityChart byDay={byDay} />
        <StreakCalendar byDay={byDay} currentStreak={streak.current} />
      </div>

      <ReadinessChecklist readiness={data.readiness} onMarkApplied={markApplied} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <SkillAnalysis axes={axes} />
        <CategoryBreakdown counts={data.counts} sheets={data.sheets} />
      </div>

      {error && <p className="text-center text-[12px] text-red-300">{error}</p>}
    </>
  );
}
