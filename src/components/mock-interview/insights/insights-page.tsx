"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Loader2,
  MessageSquareText,
  PlayCircle,
  Plus,
  Target,
  ThumbsUp,
  TrendingUp,
  TriangleAlert,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EASE } from "@/components/resume-analysis/motion";
import { LEVELS, type InsightInterview } from "@/lib/interview/types";
import {
  applyFilters,
  averageDimensions,
  bestAndWorst,
  completedAsc,
  DIMENSIONS,
  fmtDate,
  fmtDuration,
  kindAverages,
  mean,
  practiceDays,
  RANGES,
  readiness,
  recurringPoints,
  type GradedRef,
  type LevelFilter,
  type Point,
  type RangeFilter,
} from "./aggregate";
import { KindBars, PracticeCalendar, ReadinessRing, ScoreTrend, SkillBars } from "./charts";

type Load = { state: "loading" } | { state: "error"; message: string; login?: boolean } | { state: "ready"; items: InsightInterview[] };

export function InterviewInsights() {
  const { user, loading: authLoading } = useAuth();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [level, setLevel] = useState<LevelFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- auth resolved to signed-out
      setLoad({ state: "error", message: "Sign in to see your mock interview history.", login: true });
      return;
    }
    let live = true;
    fetch("/api/mock-interview/insights", { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!live) return;
        if (!r.ok) setLoad({ state: "error", message: j.error ?? "Couldn't load your interviews." });
        else setLoad({ state: "ready", items: j.items });
      })
      .catch(() => live && setLoad({ state: "error", message: "Network error. Check your connection and reload." }));
    return () => {
      live = false;
    };
  }, [user, authLoading]);

  if (load.state === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-c-lime)]" />
      </div>
    );
  }
  if (load.state === "error") {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <TriangleAlert className="h-8 w-8 text-amber-300" />
        <p className="text-[15px] font-semibold text-[var(--color-c-text)]">{load.message}</p>
        <Link
          href={load.login ? "/login?next=/mock-interview/history" : "/mock-interview#generate"}
          className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black"
        >
          {load.login ? "Sign in" : "Start a mock interview"}
        </Link>
      </div>
    );
  }

  return <Dashboard items={load.items} level={level} range={range} setLevel={setLevel} setRange={setRange} />;
}

/* ================================================================ dashboard */

function Dashboard({
  items,
  level,
  range,
  setLevel,
  setRange,
}: {
  items: InsightInterview[];
  level: LevelFilter;
  range: RangeFilter;
  setLevel: (l: LevelFilter) => void;
  setRange: (r: RangeFilter) => void;
}) {
  const reduce = useReducedMotion();
  const filtered = useMemo(() => applyFilters(items, level, range), [items, level, range]);
  const done = useMemo(() => completedAsc(filtered), [filtered]);
  const open = filtered.filter((i) => i.status !== "completed");

  const scores = done.map((d) => d.overallScore!);
  const avg = Math.round(mean(scores));
  const best = done.reduce<InsightInterview | null>((b, d) => (!b || d.overallScore! > b.overallScore! ? d : b), null);
  const first = done[0];
  const latest = done[done.length - 1];
  const change = done.length > 1 ? latest.overallScore! - first.overallScore! : null;
  const current = Math.round(mean(scores.slice(-3)));
  const ready = readiness(current);
  const practice = filtered.reduce((n, i) => n + i.secondsSpent, 0);
  const answered = filtered.reduce((n, i) => n + i.answered, 0);

  const avgDims = averageDimensions(done);
  const latestDims = [...done].reverse().find((d) => d.dimensions)?.dimensions ?? null;
  const kinds = kindAverages(done);
  const { perDay, streak, activeDays } = practiceDays(filtered);
  const strengths = recurringPoints(done, (i) => i.strengths);
  const weaknesses = recurringPoints(done, (i) => i.improvements);
  const { best: bestAnswers, worst: worstAnswers } = bestAndWorst(done);

  const dimRank = avgDims ? DIMENSIONS.map((d) => ({ ...d, v: avgDims[d.key] })).sort((a, b) => b.v - a.v) : [];
  const strongest = dimRank[0];
  const weakest = dimRank[dimRank.length - 1];

  const fade = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay: 0.05 + i * 0.06 },
  });

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 h-72 w-[46rem] max-w-full -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(ellipse, rgba(163,230,53,0.08) 0%, transparent 70%)" }} />

      {/* ---------- heading ---------- */}
      <motion.div {...fade(0)} className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-c-lime)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-c-lime)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-c-lime)]" />
            </span>
            Mock interview history
          </p>
          <h1 className="mt-2 text-[clamp(1.7rem,4vw,2.6rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Your interview <span className="text-[var(--color-c-lime)]">journey</span>
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">Scores, strengths and the gaps to close, from every mock interview you&apos;ve taken.</p>
        </div>
        <Link
          href="/mock-interview#generate"
          className="cl-glow inline-flex items-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-2.5 text-[13px] font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New mock interview
        </Link>
      </motion.div>

      {/* ---------- filters: one row, scope everything below ---------- */}
      <motion.div {...fade(1)} className="relative mt-6 flex flex-wrap items-center gap-2.5">
        <Segmented
          id="range"
          value={range}
          onChange={(v) => setRange(v as RangeFilter)}
          options={RANGES.map((r) => ({ key: r.key, label: r.label }))}
        />
        <Segmented
          id="level"
          value={level}
          onChange={(v) => setLevel(v as LevelFilter)}
          options={[{ key: "all", label: "All levels" }, ...LEVELS.map((l) => ({ key: l.key, label: l.label }))]}
        />
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-c-dim)]">
          {filtered.length} interview{filtered.length === 1 ? "" : "s"}
        </span>
      </motion.div>

      {items.length === 0 ? (
        <EmptyState title="No mock interviews yet" body="Take your first mock interview and your scores, strengths and weak spots will show up here." />
      ) : filtered.length === 0 ? (
        <EmptyState title="Nothing in this range" body="No interviews match these filters. Try a longer time range or all levels." />
      ) : (
        <>
          {/* ---------- KPI row ---------- */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Kpi i={0} icon={CheckCircle2} label="Interviews completed" value={done.length} sub={open.length ? `+${open.length} in progress` : "All finished"} />
            <Kpi
              i={1}
              icon={BarChart3}
              label="Average score"
              value={done.length ? avg : null}
              suffix="/100"
              delta={change}
              deltaLabel="since your first"
            />
            <Kpi i={2} icon={Trophy} label="Best score" value={best?.overallScore ?? null} suffix="/100" sub={best ? best.role : "—"} />
            <Kpi i={3} icon={Clock} label="Practice time" text={fmtDuration(practice)} sub={`${answered} answers given`} />
            <Kpi i={4} className="col-span-2 md:col-span-1" icon={Flame} label="Practice streak" value={streak} suffix={streak === 1 ? " day" : " days"} sub={`${activeDays} active day${activeDays === 1 ? "" : "s"}`} />
          </div>

          {/* ---------- readiness + trend ---------- */}
          <div className="relative mt-5 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
            <Card i={2} className="flex flex-col items-center text-center">
              <CardTitle icon={Target} title="Interview readiness" />
              {done.length ? (
                <>
                  <div className="relative mt-4 h-40 w-40">
                    <ReadinessRing value={current} tone={ready.tone} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <CountUp value={current} className="text-[44px] font-extrabold leading-none tracking-tight text-[var(--color-c-text)]" />
                      <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">out of 100</span>
                    </div>
                  </div>
                  <p
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-bold ${
                      ready.tone === "good"
                        ? "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
                        : ready.tone === "warn"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-red-400/30 bg-red-400/10 text-red-300"
                    }`}
                  >
                    {ready.tone === "good" ? <Award className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
                    {ready.label}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[var(--color-c-dim)]">Average of your last {Math.min(3, done.length)} interview{done.length === 1 ? "" : "s"}</p>
                  <div className="mt-5 w-full space-y-2 border-t border-white/[0.06] pt-4 text-left">
                    {change !== null && (
                      <Insight icon={change >= 0 ? TrendingUp : ArrowDownRight} tone={change >= 0 ? "good" : "bad"}>
                        {change >= 0 ? "Up" : "Down"} <b>{Math.abs(change)} points</b> since your first interview.
                      </Insight>
                    )}
                    {strongest && (
                      <Insight icon={ThumbsUp} tone="good">
                        Strongest area: <b>{strongest.label}</b> ({strongest.v}).
                      </Insight>
                    )}
                    {weakest && weakest !== strongest && (
                      <Insight icon={Target} tone="warn">
                        Focus next: <b>{weakest.label}</b> ({weakest.v}).
                      </Insight>
                    )}
                  </div>
                </>
              ) : (
                <p className="my-auto py-10 text-[13px] text-[var(--color-c-muted)]">Finish an interview to get your readiness score.</p>
              )}
            </Card>

            <Card i={3}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle icon={Activity} title="Score trend" sub="Overall score of each completed interview" />
                {latest && (
                  <span className="rounded-lg border border-white/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-muted)]">
                    Latest <span className="text-[var(--color-c-text)]">{latest.overallScore}</span>
                  </span>
                )}
              </div>
              <div className="mt-5">
                {done.length ? (
                  <>
                    <ScoreTrend points={done} />
                    {done.length === 1 && (
                      <p className="mt-2 text-center text-[12px] text-[var(--color-c-dim)]">Complete another interview to see your trend line.</p>
                    )}
                  </>
                ) : (
                  <p className="py-16 text-center text-[13px] text-[var(--color-c-muted)]">Your completed interviews will plot here.</p>
                )}
              </div>
            </Card>
          </div>

          {/* ---------- skills / question types / calendar ---------- */}
          <div className="relative mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <Card i={4}>
              <CardTitle icon={Layers} title="Skill breakdown" sub="Latest interview against your average" />
              <div className="mt-5">
                {latestDims ? <SkillBars latest={latestDims} average={done.length > 1 ? avgDims : null} /> : <Empty text="No graded interviews yet." />}
              </div>
            </Card>
            <Card i={5}>
              <CardTitle icon={MessageSquareText} title="By question type" sub="Average score per question type" />
              <div className="mt-5">
                <KindBars rows={kinds} />
              </div>
            </Card>
            <Card i={6} className="lg:col-span-2 xl:col-span-1">
              <CardTitle icon={CalendarDays} title="Practice calendar" sub="Interviews started, last 17 weeks" />
              <div className="mt-5">
                <PracticeCalendar perDay={perDay} />
              </div>
            </Card>
          </div>

          {/* ---------- strong / weak ---------- */}
          <div className="relative mt-5 grid gap-5 lg:grid-cols-2">
            <PointsCard
              i={7}
              tone="good"
              title="Strong points"
              sub="What interviewers would notice, and how often"
              points={strengths}
              answers={bestAnswers}
              answersTitle="Your best answers"
              total={done.length}
            />
            <PointsCard
              i={8}
              tone="bad"
              title="Weak points"
              sub="What keeps coming up to fix"
              points={weaknesses}
              answers={worstAnswers}
              answersTitle="Answers to redo"
              total={done.length}
            />
          </div>

          {/* ---------- in progress ---------- */}
          {open.length > 0 && (
            <Card i={9} className="relative mt-5">
              <CardTitle icon={PlayCircle} title="In progress" sub="Answers are saved and the clock is paused" />
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {open.map((o) => (
                  <Link
                    key={o.id}
                    href={`/mock-interview/${o.id}`}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-colors hover:border-[var(--color-c-lime)]/40"
                  >
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-c-lime)] opacity-60" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-c-lime)]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-[var(--color-c-text)]">{o.role}</span>
                      <span className="mt-1 block h-1 overflow-hidden rounded-full bg-white/[0.07]">
                        <span className="block h-full rounded-full bg-[var(--color-c-lime)]" style={{ width: `${(o.answered / (o.total || 20)) * 100}%` }} />
                      </span>
                      <span className="mt-1 block font-mono text-[10px] text-[var(--color-c-dim)]">
                        {o.answered}/{o.total} answered · {fmtDuration(o.timeLeftS)} left
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-[var(--color-c-dim)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-c-lime)]" />
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* ---------- all interviews (also the table view of the trend) ---------- */}
          <Card i={10} className="relative mt-5 !p-0">
            <div className="p-5 pb-3 sm:p-6 sm:pb-3">
              <CardTitle icon={BarChart3} title="All interviews" sub="Every session in this range, newest first" />
            </div>
            <div className="hidden grid-cols-[110px_minmax(0,1fr)_90px_80px_100px_80px_90px] gap-3 border-y border-white/[0.06] px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-dim)] md:grid">
              <span>Date</span>
              <span>Role</span>
              <span>Level</span>
              <span className="text-right">Score</span>
              <span className="text-right">Answered</span>
              <span className="text-right">Time</span>
              <span />
            </div>
            <ul>
              {[...filtered]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((it) => (
                  <InterviewRow key={it.id} it={it} />
                ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

/* ================================================================ pieces */

function Segmented({ id, value, options, onChange }: { id: string; value: string; options: { key: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" className="flex rounded-xl border border-white/[0.07] bg-[#131612] p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={`relative rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${value === o.key ? "text-black" : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"}`}
        >
          {value === o.key && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-lg bg-[var(--color-c-lime)]" transition={{ duration: 0.3, ease: EASE }} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Card({ i, className = "", children }: { i: number; className?: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.08 + i * 0.05 }}
      className={`rounded-3xl border border-white/[0.07] bg-[#131612] p-5 sm:p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardTitle({ icon: Icon, title, sub }: { icon: typeof Activity; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-c-lime)]/10">
        <Icon className="h-4 w-4 text-[var(--color-c-lime)]" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-bold tracking-tight text-[var(--color-c-text)]">{title}</p>
        {sub && <p className="text-[11px] text-[var(--color-c-dim)]">{sub}</p>}
      </div>
    </div>
  );
}

function CountUp({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, value, { duration: 1.1, ease: EASE, onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  return <span className={className}>{reduce ? value : shown}</span>;
}

function Kpi({
  i,
  className = "",
  icon: Icon,
  label,
  value,
  text,
  suffix,
  sub,
  delta,
  deltaLabel,
}: {
  i: number;
  className?: string;
  icon: typeof Activity;
  label: string;
  value?: number | null;
  text?: string;
  suffix?: string;
  sub?: string;
  delta?: number | null;
  deltaLabel?: string;
}) {
  return (
    <Card i={i} className={`!p-4 sm:!p-5 ${className}`}>
      <p className="flex items-center gap-2 text-[12px] font-semibold text-[var(--color-c-muted)]">
        <Icon className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
        {label}
      </p>
      <p className="mt-2.5 text-[28px] font-extrabold leading-none tracking-tight text-[var(--color-c-text)]">
        {text ?? (value === null || value === undefined ? "—" : <CountUp value={value} />)}
        {suffix && value !== null && value !== undefined && <span className="text-[13px] font-semibold text-[var(--color-c-dim)]">{suffix}</span>}
      </p>
      {delta !== undefined && delta !== null ? (
        <p className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold ${delta >= 0 ? "text-[var(--color-c-lime)]" : "text-red-300"}`}>
          {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {delta >= 0 ? "+" : ""}
          {delta} <span className="font-medium text-[var(--color-c-dim)]">{deltaLabel}</span>
        </p>
      ) : (
        <p className="mt-2 truncate text-[11px] text-[var(--color-c-dim)]">{sub ?? " "}</p>
      )}
    </Card>
  );
}

function Insight({ icon: Icon, tone, children }: { icon: typeof Activity; tone: "good" | "warn" | "bad"; children: React.ReactNode }) {
  const c = tone === "good" ? "text-[var(--color-c-lime)]" : tone === "warn" ? "text-amber-300" : "text-red-300";
  return (
    <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[var(--color-c-text-4)] [&_b]:font-bold [&_b]:text-[var(--color-c-text)]">
      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${c}`} />
      <span>{children}</span>
    </p>
  );
}

function PointsCard({
  i,
  tone,
  title,
  sub,
  points,
  answers,
  answersTitle,
  total,
}: {
  i: number;
  tone: "good" | "bad";
  title: string;
  sub: string;
  points: Point[];
  answers: GradedRef[];
  answersTitle: string;
  total: number;
}) {
  const reduce = useReducedMotion();
  const good = tone === "good";
  const accent = good ? "text-[var(--color-c-lime)]" : "text-amber-300";
  const Icon = good ? ThumbsUp : TriangleAlert;
  return (
    <Card i={i} className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full"
        style={{ background: `radial-gradient(circle, ${good ? "rgba(163,230,53,0.10)" : "rgba(251,191,36,0.08)"} 0%, transparent 70%)` }}
      />
      <div className="relative flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${good ? "bg-[var(--color-c-lime)]/10" : "bg-amber-400/10"}`}>
          <Icon className={`h-4 w-4 ${accent}`} />
        </span>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-[var(--color-c-text)]">{title}</p>
          <p className="text-[11px] text-[var(--color-c-dim)]">{sub}</p>
        </div>
      </div>

      {points.length === 0 ? (
        <Empty text={good ? "Strengths appear once you complete an interview with real answers." : "Nothing flagged yet."} />
      ) : (
        <ul className="relative mt-5 space-y-2.5">
          <AnimatePresence initial={false}>
            {points.map((p, k) => (
              <motion.li
                key={p.text}
                initial={reduce ? false : { opacity: 0, x: good ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.2 + k * 0.06 }}
                className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3"
              >
                <span className={`mt-0.5 font-mono text-[11px] font-bold ${accent}`}>{String(k + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{p.text}</span>
                {total > 1 && (
                  <span
                    title={`Mentioned in ${p.interviews} of ${total} interviews`}
                    className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--color-c-muted)]"
                  >
                    {p.interviews}/{total}
                  </span>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {answers.length > 0 && (
        <div className="relative mt-6 border-t border-white/[0.06] pt-4">
          <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">{answersTitle}</p>
          <div className="space-y-1.5">
            {answers.map((a) => (
              <Link
                key={`${a.interviewId}-${a.id}`}
                href={`/mock-interview/${a.interviewId}`}
                className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-[12px] font-bold ${
                    a.score >= 7
                      ? "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
                      : a.score >= 5
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                        : "border-red-400/30 bg-red-400/10 text-red-300"
                  }`}
                >
                  {a.score}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-[12px] font-semibold text-[var(--color-c-text-4)] group-hover:text-[var(--color-c-text)]">{a.text}</span>
                  <span className="block truncate font-mono text-[10px] text-[var(--color-c-dim)]">
                    {a.role} · {fmtDate(a.createdAt)}
                  </span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--color-c-dim)] transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function InterviewRow({ it }: { it: InsightInterview }) {
  const lvl = LEVELS.find((l) => l.key === it.level)?.label;
  const done = it.status === "completed";
  const s = it.overallScore;
  const chip =
    s === null
      ? "text-[var(--color-c-dim)]"
      : s >= 75
        ? "text-[var(--color-c-lime)]"
        : s >= 50
          ? "text-amber-300"
          : "text-red-300";
  return (
    <li className="border-t border-white/[0.05] first:border-t-0 md:first:border-t-0">
      <Link
        href={`/mock-interview/${it.id}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-5 py-3.5 transition-colors hover:bg-white/[0.025] sm:px-6 md:grid-cols-[110px_minmax(0,1fr)_90px_80px_100px_80px_90px]"
      >
        <span className="order-3 font-mono text-[11px] text-[var(--color-c-dim)] md:order-none">{fmtDate(it.createdAt, true)}</span>
        <span className="order-1 truncate text-[13px] font-bold text-[var(--color-c-text)] md:order-none">{it.role}</span>
        <span className="order-4 hidden text-[12px] text-[var(--color-c-muted)] md:order-none md:block">{lvl}</span>
        <span className={`order-2 text-right text-[14px] font-extrabold md:order-none ${chip}`}>
          {done ? s : <span className="text-[11px] font-bold text-[var(--color-c-lime)]">{it.status === "evaluating" ? "Grading" : "Live"}</span>}
        </span>
        <span className="hidden text-right font-mono text-[12px] tabular-nums text-[var(--color-c-text-4)] md:block">
          {it.answered}/{it.total}
        </span>
        <span className="hidden text-right font-mono text-[12px] tabular-nums text-[var(--color-c-text-4)] md:block">{fmtDuration(it.secondsSpent)}</span>
        <span className="order-5 hidden items-center justify-end gap-1 font-mono text-[10px] font-bold uppercase text-[var(--color-c-lime)] md:flex">
          {done ? "Report" : "Continue"} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="order-4 text-right font-mono text-[10px] text-[var(--color-c-dim)] md:hidden">
          {lvl} · {it.answered}/{it.total}
        </span>
      </Link>
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-[12px] text-[var(--color-c-dim)]">{text}</p>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative mt-8 flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-c-lime)]/10">
        <BarChart3 className="h-6 w-6 text-[var(--color-c-lime)]" />
      </span>
      <p className="mt-4 text-[17px] font-bold text-[var(--color-c-text)]">{title}</p>
      <p className="mt-1.5 max-w-sm text-[13px] text-[var(--color-c-muted)]">{body}</p>
      <Link href="/mock-interview#generate" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
        <Plus className="h-4 w-4" /> Start a mock interview
      </Link>
    </div>
  );
}
