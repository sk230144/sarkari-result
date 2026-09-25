"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Check, CheckCircle2, FileText, Sparkles, Target, TrendingUp } from "lucide-react";
import { GenerateCta } from "@/components/cover-letter/primitives";
import { EASE } from "./motion";

const SCENARIOS = [
  {
    role: "Senior Frontend Engineer",
    score: 92,
    matched: 14,
    total: 16,
    keywords: [
      ["System Design", true],
      ["CI/CD Pipelines", true],
      ["GraphQL", false],
    ],
  },
  {
    role: "Backend Developer",
    score: 78,
    matched: 11,
    total: 15,
    keywords: [
      ["Node.js", true],
      ["PostgreSQL", true],
      ["Kubernetes", false],
    ],
  },
  {
    role: "GenAI Engineer",
    score: 86,
    matched: 13,
    total: 15,
    keywords: [
      ["LangChain", true],
      ["RAG pipelines", true],
      ["Fine-tuning", false],
    ],
  },
] as const;

const R = 44;
const C = 2 * Math.PI * R;

function MatchEngine() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const s = SCENARIOS[i];

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % SCENARIOS.length), 6500);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    const ctrl = animate(0, s.score, {
      duration: reduce ? 0 : 1.5,
      ease: EASE,
      delay: reduce ? 0 : 0.5,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [s.score, reduce]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-12 rounded-[48px] opacity-80 blur-2xl"
        style={{ background: "radial-gradient(55% 50% at 55% 50%, rgba(163,230,53,0.16), transparent 70%)" }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0b0d0b]/95 p-5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)] sm:p-7"
        style={{ transformPerspective: 1200 }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(163,230,53,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.5) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-[var(--color-c-text-4)]">
            <Sparkles className="h-3 w-3 text-[var(--color-c-lime)]" />
            Job Alert 24 Match Engine
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={s.role}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="truncate rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[var(--color-c-text-4)]"
            >
              {s.role}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Resume → beam → score */}
        <div className="relative mt-8 flex items-center justify-between gap-3 px-1 sm:px-4">
          <motion.div
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#161915] sm:h-28 sm:w-28"
          >
            <FileText className="h-6 w-6 text-[var(--color-c-text-4)]" />
            <span className="text-[10px] font-medium text-[var(--color-c-dim)]">Your Resume</span>
          </motion.div>

          <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.span
              className="absolute inset-y-0 w-1/2 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, #a3e635, transparent)" }}
              animate={reduce ? undefined : { x: ["-100%", "220%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative h-28 w-28 shrink-0 sm:h-32 sm:w-32">
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full border border-[var(--color-c-lime)]/40"
              animate={reduce ? undefined : { scale: [1, 1.25], opacity: [0.6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
            />
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r={R} fill="#0e110d" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
              <motion.circle
                key={s.role}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="#a3e635"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: C * (1 - s.score / 100) }}
                transition={{ duration: reduce ? 0 : 1.5, ease: EASE, delay: reduce ? 0 : 0.5 }}
                style={{ filter: "drop-shadow(0 0 6px rgba(163,230,53,0.6))" }}
              />
            </svg>
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-extrabold leading-none tracking-tight text-[var(--color-c-text)]">
                {shown}
                <span className="text-[14px]">%</span>
              </span>
              <span className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-c-lime)]">
                Match
              </span>
            </span>
          </div>
        </div>

        {/* Keyword check */}
        <div className="relative mt-8 rounded-2xl border border-white/[0.06] bg-[#121510] p-4">
          <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text)]">
            <Target className="h-4 w-4 text-[var(--color-c-lime)]" />
            ATS Keyword Check
          </p>
          <AnimatePresence mode="wait">
            <motion.ul
              key={s.role}
              className="space-y-2.5"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.35, delayChildren: reduce ? 0 : 0.9 } } }}
            >
              {s.keywords.map(([kw, ok]) => (
                <motion.li
                  key={kw}
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                  className="flex items-center justify-between text-[12px] text-[var(--color-c-text-4)]"
                >
                  {kw}
                  {ok ? (
                    <motion.span
                      variants={{ hidden: { scale: 0 }, show: { scale: 1 } }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </motion.span>
                  ) : (
                    <span className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                      Missing
                    </span>
                  )}
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating badges */}
      <motion.div
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: reduce ? 0 : [0, -8, 0] }}
        transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -left-4 -top-7 hidden sm:block"
      >
        <Badge icon={TrendingUp} title={`${s.score}% Match`} sub="ATS compatibility score" />
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: reduce ? 0 : [0, 8, 0] }}
        transition={{ opacity: { delay: 1 }, x: { delay: 1 }, y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -bottom-7 -right-3 hidden sm:block"
      >
        <Badge icon={Check} title={`${s.matched} / ${s.total}`} sub="Skills matched to JD" />
      </motion.div>
    </div>
  );
}

function Badge({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0f0d]/95 py-3 pl-3 pr-5 shadow-2xl backdrop-blur">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/10">
        <Icon className="h-[18px] w-[18px] text-[var(--color-c-lime)]" />
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-extrabold tracking-tight text-[var(--color-c-text)]">{title}</span>
        <span className="text-[11px] text-[var(--color-c-dim)]">{sub}</span>
      </span>
    </div>
  );
}

const WORDS = ["Check", "match", "against", "your"];

export function ResumeAnalysisHero() {
  const reduce = useReducedMotion();
  const word = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 },
  });

  return (
    <section className="relative px-6 pb-24 pt-8 lg:px-8 lg:pb-32 lg:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[20%] top-[35%] h-[520px] w-[720px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(163,230,53,0.09) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-c-text-4)]"
          >
            <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
            AI ATS Resume Checker
          </motion.span>

          <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-[var(--color-c-text)]">
            {WORDS.map((w, i) => (
              <motion.span key={w} {...word(i)} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
            <motion.span {...word(WORDS.length)} className="relative inline-block whitespace-nowrap">
              dream job
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.8 }}
                className="absolute -bottom-1.5 left-0 h-[5px] w-full origin-left rounded-full bg-[var(--color-c-lime)] shadow-[0_0_18px_rgba(163,230,53,0.6)]"
              />
            </motion.span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
            className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--color-c-muted)]"
          >
            Upload your resume and paste a job description to see how well you rank. We score your skills,
            experience and seniority against the exact role, then tell you precisely what to fix.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          >
            <div className="mt-9">
              <GenerateCta label="Check My Resume Score" />
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--color-c-dim)]">
              {["Free to start", "No credit card required", "Scored against the actual JD, not a template"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[var(--color-c-lime)]" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <MatchEngine />
      </div>
    </section>
  );
}
