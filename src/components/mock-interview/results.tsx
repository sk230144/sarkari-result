"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  ChevronDown,
  Code2,
  Lightbulb,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Target,
  Share2,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { EASE } from "@/components/resume-analysis/motion";
import { CODE_LANGUAGES, LEVELS, ordered, type Interview, type Question } from "@/lib/interview/types";
import { ShareModal } from "./share-modal";

/** Set when someone other than the owner is viewing a shared report. */
export type SharedBy = { by: string | null; profileUrl: string | null };

const tone = (score: number, outOf = 100) => {
  const p = score / outOf;
  return p >= 0.75
    ? { text: "text-[var(--color-c-lime)]", bg: "bg-[var(--color-c-lime)]", soft: "bg-[var(--color-c-lime)]/12 text-[var(--color-c-lime)] border-[var(--color-c-lime)]/25" }
    : p >= 0.5
      ? { text: "text-amber-300", bg: "bg-amber-400", soft: "bg-amber-400/12 text-amber-300 border-amber-400/25" }
      : { text: "text-red-300", bg: "bg-red-400", soft: "bg-red-400/12 text-red-300 border-red-400/25" };
};

const KIND_LABEL: Record<Question["kind"], string> = {
  intro: "Introduction",
  technical: "Technical",
  coding: "Coding",
  behavioral: "Behavioural",
  closing: "Closing",
};

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}m ${r.toString().padStart(2, "0")}s` : `${r}s`;
}

export function InterviewResults({ iv, shared }: { iv: Interview; shared?: SharedBy }) {
  const reduce = useReducedMotion();
  const [sharing, setSharing] = useState(false);
  const [filter, setFilter] = useState<"all" | "tech" | "hr">("all");
  const [open, setOpen] = useState<string | null>(null);
  const qs = useMemo(() => ordered(iv.questions), [iv.questions]);
  const score = iv.overallScore ?? 0;
  const t = tone(score);
  const level = LEVELS.find((l) => l.key === iv.level);
  const answered = qs.filter((q) => iv.results?.[q.id]?.verdict !== "Skipped").length;
  const spent = qs.reduce((n, q) => n + (iv.answers[q.id]?.seconds ?? 0), 0);
  const shown = qs.filter((q) => filter === "all" || q.phase === filter);

  const R = 54;
  const C = 2 * Math.PI * R;
  const dims = iv.summary
    ? [
        { label: "Communication", value: iv.summary.dimensions.communication, icon: MessageSquare },
        { label: "Technical depth", value: iv.summary.dimensions.technical, icon: Brain },
        { label: "Problem solving", value: iv.summary.dimensions.problemSolving, icon: Target },
        { label: "Culture fit", value: iv.summary.dimensions.cultureFit, icon: Users },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      {/* header */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-c-lime)]">
            {shared ? "Shared mock interview result" : "Interview debrief"}
          </p>
          <h1 className="mt-2 text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">{iv.role}</h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-c-dim)]">
            {level?.label} · {level?.sub} · {answered}/{qs.length} answered · {fmtDuration(spent)} spent
            {iv.completedAt && ` · ${new Date(iv.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
          {shared?.by && (
            <p className="mt-2.5 inline-flex items-center gap-2 text-[13px] text-[var(--color-c-muted)]">
              <UserRound className="h-4 w-4 text-[var(--color-c-lime)]" />
              Interview taken by{" "}
              {shared.profileUrl ? (
                <Link href={shared.profileUrl} className="font-bold text-[var(--color-c-text)] hover:text-[var(--color-c-lime)] hover:underline">
                  {shared.by}
                </Link>
              ) : (
                <span className="font-bold text-[var(--color-c-text)]">{shared.by}</span>
              )}
            </p>
          )}
        </div>
        {!shared && (
          <button
            type="button"
            onClick={() => setSharing(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#131612] px-4 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] transition-colors hover:border-[var(--color-c-lime)]/40 hover:text-[var(--color-c-lime)]"
          >
            <Share2 className="h-4 w-4" /> Share result
          </button>
        )}
      </motion.div>
      {sharing && <ShareModal id={iv.id} role={iv.role} score={score} onClose={() => setSharing(false)} />}

      {/* score + summary */}
      <div className="mt-7 grid gap-5 lg:grid-cols-[320px_1fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#181c16] to-[#121510] p-7"
        >
          <div aria-hidden className="pointer-events-none absolute -top-20 h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.14) 0%, transparent 70%)" }} />
          <div className="relative h-36 w-36">
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
              <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <motion.circle
                cx="64"
                cy="64"
                r={R}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className={t.text}
                stroke="currentColor"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (1 - score / 100) }}
                transition={{ duration: reduce ? 0 : 1.4, ease: EASE, delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-[40px] font-extrabold leading-none tracking-tight ${t.text}`}>{score}</span>
              <span className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">out of 100</span>
            </div>
          </div>
          <p className="mt-5 flex items-center gap-2 text-[14px] font-bold text-[var(--color-c-text)]">
            <Award className={`h-4 w-4 ${t.text}`} />
            {score >= 80 ? "Interview ready" : score >= 60 ? "Almost there" : score >= 40 ? "Building up" : "Needs practice"}
          </p>
          <div className="mt-5 flex w-full flex-col gap-2">
            <Link
              href="/mock-interview#generate"
              className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-3 text-[13px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              <RotateCcw className="h-4 w-4" />
              {shared ? "Try a free mock interview" : "New mock interview"}
            </Link>
            {shared ? (
              <p className="text-center text-[11px] leading-relaxed text-[var(--color-c-dim)]">
                Questions from your own resume and target role, graded with feedback on every answer.
              </p>
            ) : (
              <Link
                href="/mock-interview/history"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-[13px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
              >
                All sessions <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.12 }}
          className="rounded-3xl border border-white/[0.07] bg-[#131612] p-6 sm:p-7"
        >
          <p className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-c-lime)]">
            <Sparkles className="h-3.5 w-3.5" /> Overall feedback
          </p>
          <p className="mt-3 text-[16px] font-semibold leading-relaxed text-[var(--color-c-text)]">{iv.summary?.headline}</p>

          {dims.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {dims.map((d, i) => {
                const dt = tone(d.value);
                return (
                  <div key={d.label}>
                    <p className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-[var(--color-c-text-4)]">
                      <d.icon className="h-3.5 w-3.5 text-[var(--color-c-dim)]" />
                      {d.label}
                      <span className={`ml-auto font-mono text-[12px] font-bold ${dt.text}`}>{d.value}</span>
                    </p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        className={`h-full rounded-full ${dt.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${d.value}%` }}
                        transition={{ duration: reduce ? 0 : 1, ease: EASE, delay: 0.3 + i * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 grid gap-4 border-t border-white/[0.06] pt-6 md:grid-cols-2">
            <ListBlock title="What went well" icon={CheckCircle2} tone="text-[var(--color-c-lime)]" items={iv.summary?.strengths ?? []} empty="Answer more questions to surface strengths." />
            <ListBlock title="Work on next" icon={TrendingUp} tone="text-amber-300" items={iv.summary?.improvements ?? []} empty="Nothing major. Keep practising at a harder level." />
          </div>
        </motion.div>
      </div>

      {/* per question */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">Question by question</h2>
          <p className="mt-0.5 text-[12px] text-[var(--color-c-muted)]">Your answer, the score, what to fix and a model answer for every question.</p>
        </div>
        <div className="flex rounded-xl border border-white/[0.07] bg-[#131612] p-1">
          {(
            [
              ["all", "All"],
              ["tech", "Tech depth"],
              ["hr", "Culture fit"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`relative rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-colors ${filter === k ? "text-black" : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"}`}
            >
              {filter === k && <motion.span layoutId="res-filter" className="absolute inset-0 rounded-lg bg-[var(--color-c-lime)]" transition={{ duration: 0.3, ease: EASE }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {shown.map((q, i) => {
          const r = iv.results?.[q.id];
          const a = iv.answers[q.id];
          const st = tone(r?.score ?? 0, 10);
          const isOpen = open === q.id;
          const idx = qs.indexOf(q) + 1;
          return (
            <motion.div
              key={q.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, ease: EASE, delay: Math.min(i, 6) * 0.04 }}
              className={`overflow-hidden rounded-2xl border transition-colors ${isOpen ? "border-white/15 bg-[#151914]" : "border-white/[0.06] bg-[#121510] hover:border-white/12"}`}
            >
              <button type="button" onClick={() => setOpen(isOpen ? null : q.id)} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5">
                <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-[var(--color-c-dim)]">{String(idx).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-white/10 px-1.5 py-px font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-muted)]">{KIND_LABEL[q.kind]}</span>
                    {r?.verdict && <span className={`text-[11px] font-semibold ${st.text}`}>{r.verdict}</span>}
                  </span>
                  <span className="line-clamp-2 block text-[14px] font-semibold leading-snug text-[var(--color-c-text)]">{q.coding?.title ?? q.text}</span>
                </span>
                <span className={`shrink-0 rounded-xl border px-2.5 py-1 font-mono text-[13px] font-bold ${st.soft}`}>
                  {r?.score ?? 0}
                  <span className="text-[10px] opacity-70">/10</span>
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--color-c-dim)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <div className="space-y-4 border-t border-white/[0.06] px-4 pb-5 pt-4 sm:px-5">
                      {q.kind === "coding" && q.coding && <p className="text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{q.coding.prompt}</p>}

                      <div>
                        <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">{shared ? "Answer" : "Your submission"}</p>
                        {q.kind === "coding" && a?.code?.trim() ? (
                          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b0d0a]">
                            <p className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-1.5 font-mono text-[10px] text-[var(--color-c-dim)]">
                              <Code2 className="h-3 w-3" />
                              {CODE_LANGUAGES.find((l) => l.key === a.language)?.label ?? "Code"}
                              {a.tests && (
                                <span className={a.tests.passed === a.tests.total ? "text-[var(--color-c-lime)]" : "text-amber-300"}>
                                  · {a.tests.passed}/{a.tests.total} examples passed
                                </span>
                              )}
                            </p>
                            <pre className="max-h-72 overflow-auto p-3 font-mono text-[12px] leading-5 text-[#e6f0da]">{a.code}</pre>
                          </div>
                        ) : null}
                        {a?.text?.trim() ? (
                          <p className="mt-2 whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{a.text}</p>
                        ) : !(q.kind === "coding" && a?.code?.trim()) ? (
                          <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-[12px] italic text-[var(--color-c-dim)]">{shared ? "Skipped." : "You skipped this question."}</p>
                        ) : null}
                      </div>

                      {r?.feedback && (
                        <div className="rounded-xl border border-blue-400/15 bg-blue-400/[0.05] px-4 py-3">
                          <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                            <Brain className="h-3 w-3" /> AI feedback
                          </p>
                          <p className="text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{r.feedback}</p>
                        </div>
                      )}

                      {r && r.improvements.length > 0 && (
                        <div>
                          <p className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">What to improve</p>
                          <ul className="space-y-1.5">
                            {r.improvements.map((s, k) => (
                              <li key={k} className="flex gap-2 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {r?.idealAnswer && (
                        <div className="rounded-xl border border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/[0.04] px-4 py-3">
                          <p className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-lime)]">
                            <Lightbulb className="h-3 w-3" /> Recommended answer
                          </p>
                          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{r.idealAnswer}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ListBlock({
  title,
  icon: Icon,
  tone,
  items,
  empty,
}: {
  title: string;
  icon: typeof CheckCircle2;
  tone: string;
  items: string[];
  empty: string;
}) {
  return (
    <div>
      <p className={`mb-2.5 flex items-center gap-2 text-[13px] font-bold ${tone}`}>
        <Icon className="h-4 w-4" /> {title}
      </p>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[12px] text-[var(--color-c-dim)]">{empty}</p>
      )}
    </div>
  );
}
