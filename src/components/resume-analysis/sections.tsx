"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import {
  Target,
  ListChecks,
  Lightbulb,
  UploadCloud,
  FileText,
  ScanSearch,
  Check,
  X,
  CircleCheck,
  Circle,
} from "lucide-react";
import { GenerateCta, Kicker, TypeLoop } from "@/components/cover-letter/primitives";
import { EASE, FadeUp, Stagger, staggerChild } from "./motion";

const GRID = {
  backgroundImage:
    "linear-gradient(rgba(163,230,53,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.09) 1px,transparent 1px)",
  backgroundSize: "16px 16px",
};

/** Number that counts up the first time it scrolls into view. */
function CountUp({ to, className = "" }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, { duration: reduce ? 0 : 1.4, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, to, reduce]);
  return (
    <span ref={ref} className={className}>
      {n}
    </span>
  );
}

function Ring({ value, size = 64 }: { value: number; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true });
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <svg ref={ref} viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="#0e110d" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
      <motion.circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="#a3e635"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: inView ? c * (1 - value / 100) : c }}
        transition={{ duration: 1.4, ease: EASE }}
      />
    </svg>
  );
}

function SectionHead({ kicker, children, sub }: { kicker: string; children: React.ReactNode; sub?: string }) {
  return (
    <FadeUp className="text-center">
      <Kicker solid>{kicker}</Kicker>
      <h2 className="mx-auto mt-5 max-w-2xl text-[clamp(1.9rem,4.6vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--color-c-text)]">
        {children}
      </h2>
      {sub && <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--color-c-muted)]">{sub}</p>}
    </FadeUp>
  );
}

/* ------------------------------------------------------ why it works */

function PreviewTarget() {
  const reduce = useReducedMotion();
  return (
    <span className="relative flex h-12 w-12 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border border-[var(--color-c-lime)]/50"
          animate={reduce ? undefined : { scale: [0.6, 1.6], opacity: [0.8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      <Target className="relative h-6 w-6 text-[var(--color-c-lime)]" />
    </span>
  );
}

function PreviewChecklist() {
  const reduce = useReducedMotion();
  return (
    <span className="flex flex-col gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center gap-2">
          <motion.span
            animate={reduce ? undefined : { scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, delay: i * 0.45, times: [0, 0.15, 0.85, 1] }}
            className="flex h-3.5 w-3.5 items-center justify-center rounded-[4px] bg-[var(--color-c-lime)]"
          >
            <Check className="h-2.5 w-2.5 text-black" strokeWidth={4} />
          </motion.span>
          <span className="h-1.5 rounded-full bg-white/15" style={{ width: 60 - i * 12 }} />
        </span>
      ))}
    </span>
  );
}

function PreviewIdea() {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/30 bg-[#1b2613]"
      animate={reduce ? undefined : { boxShadow: ["0 0 0px rgba(163,230,53,0)", "0 0 28px rgba(163,230,53,0.55)", "0 0 0px rgba(163,230,53,0)"] }}
      transition={{ duration: 2.6, repeat: Infinity }}
    >
      <Lightbulb className="h-6 w-6 text-[var(--color-c-lime)]" />
    </motion.span>
  );
}

const REASONS = [
  {
    preview: <PreviewTarget />,
    title: "Scored like a real ATS, not a guess",
    body: "Your resume is checked against the same skill-matching signals applicant tracking systems use, not a vague, unexplained 'resume grade'.",
  },
  {
    preview: <PreviewChecklist />,
    title: "Exact missing keywords",
    body: "See precisely which skills from the JD are absent from your resume, marked required or preferred so you know what matters most.",
  },
  {
    preview: <PreviewIdea />,
    title: "A fix-it plan, not just a score",
    body: "Get concrete projects to build, topics to learn and a realistic timeline, not just a number with no explanation.",
  },
];

export function WhyTrust() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <FadeUp>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.05] bg-gradient-to-b from-[#1a2414] to-[#131711] px-5 py-16 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-[720px] max-w-[140vw] -translate-x-1/2 -translate-y-1/3 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(163,230,53,0.16) 0%, transparent 65%)" }}
          />
          <div className="relative">
            <SectionHead kicker="Why it works">
              Why developers trust Job Alert 24&apos;s{" "}
              <span className="text-[var(--color-c-lime)]">ATS Resume Checker</span>
            </SectionHead>
          </div>

          <Stagger className="relative mt-12 grid gap-4 md:grid-cols-3">
            {REASONS.map((r) => (
              <motion.article
                key={r.title}
                variants={staggerChild}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group rounded-2xl border border-white/[0.06] bg-[#171a15] p-4 transition-colors hover:border-[var(--color-c-lime)]/30"
              >
                <div className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl border border-[var(--color-c-lime)]/20 bg-gradient-to-br from-[var(--color-c-lime)]/[0.07] to-transparent">
                  <div aria-hidden className="absolute inset-0" style={GRID} />
                  <div className="absolute left-4 right-4 top-4 space-y-2">
                    <span className="block h-1.5 w-2/3 rounded-full bg-[var(--color-c-lime)]/45 transition-all duration-500 group-hover:w-[85%]" />
                    <span className="block h-1.5 w-1/3 rounded-full bg-white/10 transition-all duration-500 group-hover:w-1/2" />
                  </div>
                  <span className="relative mt-6">{r.preview}</span>
                </div>
                <h3 className="mt-5 px-1 text-[15px] font-bold tracking-tight text-[var(--color-c-text)]">{r.title}</h3>
                <p className="mt-1.5 px-1 pb-1 text-[13px] leading-relaxed text-[var(--color-c-muted)]">{r.body}</p>
              </motion.article>
            ))}
          </Stagger>

          <div className="relative mt-12 flex justify-center">
            <GenerateCta size="md" label="Check My Resume Score" />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------ how it works */

function Frame({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotate: -0.4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative rounded-[22px] border border-[var(--color-c-lime)]/25 bg-gradient-to-br from-[#2a3b1c] via-[#1d2917] to-[#151b12] p-5 shadow-[0_30px_60px_-30px_rgba(163,230,53,0.35)] sm:p-7"
    >
      <div className="relative min-h-[170px] overflow-hidden rounded-2xl border border-white/[0.05] bg-[#171a15] p-5">{children}</div>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-5 select-none text-[64px] font-extrabold leading-none tracking-tighter text-[var(--color-c-lime)]/[0.14]"
      >
        {n}
      </span>
    </motion.div>
  );
}

function UploadVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <motion.span
        animate={reduce ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[var(--color-c-lime)]/50 bg-[var(--color-c-lime)]/[0.06]"
      >
        <UploadCloud className="h-5 w-5 text-[var(--color-c-lime)]" />
      </motion.span>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-c-text-4)]">
        <FileText className="h-3 w-3" />
        resume.pdf
      </span>
      <div className="w-full max-w-[200px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-[var(--color-c-lime)]"
            animate={reduce ? { width: "100%" } : { width: ["0%", "100%", "100%"] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.75, 1], ease: "easeInOut" }}
          />
        </div>
        <p className="mt-1.5 text-center font-mono text-[9px] text-[var(--color-c-dim)]">Saved for every Job Alert 24 tool</p>
      </div>
    </div>
  );
}

function JdVisual() {
  return (
    <>
      <p className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-c-lime)]/10">
          <FileText className="h-3 w-3 text-[var(--color-c-lime)]" />
        </span>
        Job description
      </p>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-3 text-[12px] font-semibold text-[var(--color-c-text)]">
        <span aria-hidden className="cl-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-c-lime)]/60 to-transparent" />
        <TypeLoop
          texts={["Senior Frontend Engineer · React", "Backend Developer · Node.js, AWS", "GenAI Engineer · LangChain, RAG"]}
          caretClassName="bg-[var(--color-c-text)]"
        />
        <span className="mt-2 block h-1 w-4/5 rounded-full bg-white/[0.05]" />
        <span className="mt-1.5 block h-1 w-3/5 rounded-full bg-white/[0.05]" />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-c-lime)]">
        <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
        Analyzing against your resume…
      </p>
    </>
  );
}

function ScoreVisual() {
  return (
    <div className="flex h-full items-center justify-center pt-4">
      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#11140f] p-4 pr-6">
        <div className="relative">
          <Ring value={82} size={72} />
          <span className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold text-[var(--color-c-text)]">
            <CountUp to={82} />%
          </span>
        </div>
        <div>
          <p className="text-[13px] font-bold text-[var(--color-c-text)]">Match score</p>
          <p className="text-[11px] text-[var(--color-c-dim)]">Senior Frontend Engineer</p>
          <p className="mt-1.5 inline-flex rounded-full bg-[var(--color-c-lime)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-c-lime)]">
            Strong match
          </p>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Upload your resume",
    body: "Add your resume once as a PDF. It's saved for this and every other Job Alert 24 tool.",
    cta: "Upload resume",
    visual: <UploadVisual />,
  },
  {
    n: "02",
    icon: FileText,
    title: "Paste the job description",
    body: "Drop in the JD you're targeting. We read it alongside your resume, not in isolation.",
    cta: "Add job description",
    visual: <JdVisual />,
  },
  {
    n: "03",
    icon: ScanSearch,
    title: "Get your match score",
    body: "See your match score, the exact skills you're missing, and a prioritised plan to close the gap.",
    cta: "Check my resume score",
    visual: <ScoreVisual />,
  },
];

export function AnalysisHowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead
          kicker="How it works"
          sub="No guesswork, no vague grade. Just what an ATS would actually see, in under a minute."
        >
          3 simple steps to your <span className="text-[var(--color-c-lime)]">honest ATS score</span>
        </SectionHead>

        <div className="relative mt-16 flex flex-col gap-16 lg:gap-20">
          <motion.span
            aria-hidden
            initial={reduce ? false : { scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.6, ease: EASE }}
            className="pointer-events-none absolute bottom-10 left-1/2 top-10 hidden w-px origin-top -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-c-lime)]/40 to-transparent lg:block"
          />
          {STEPS.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={s.n} className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
                <motion.span
                  aria-hidden
                  initial={reduce ? false : { scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.3 }}
                  className="absolute left-1/2 top-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-c-lime)] shadow-[0_0_0_6px_rgba(163,230,53,0.12),0_0_20px_rgba(163,230,53,0.6)] lg:block"
                />
                <motion.div
                  className={flip ? "lg:order-2" : ""}
                  initial={reduce ? false : { opacity: 0, x: flip ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.06] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-lime)]">
                    <s.icon className="h-3 w-3" />
                    Step {i + 1}
                  </span>
                  <h3 className="mt-3 text-[26px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[var(--color-c-muted)]">{s.body}</p>
                  <div className="mt-5">
                    <GenerateCta variant="outline" label={s.cta} />
                  </div>
                </motion.div>
                <motion.div
                  className={flip ? "lg:order-1" : ""}
                  initial={reduce ? false : { opacity: 0, x: flip ? -40 : 40, scale: 0.96 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                >
                  <Frame n={s.n}>{s.visual}</Frame>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ what you get */

function ScoreCardVisual() {
  const bars = [
    ["Skills", 72],
    ["Experience", 85],
    ["Seniority", 64],
  ] as const;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex items-center gap-4">
      <div className="relative shrink-0">
        <Ring value={74} size={68} />
        <span className="absolute inset-0 flex items-center justify-center text-[14px] font-extrabold text-[var(--color-c-text)]">
          <CountUp to={74} />%
        </span>
      </div>
      <div className="flex-1 space-y-2">
        {bars.map(([label, v], i) => (
          <div key={label}>
            <p className="mb-0.5 flex justify-between text-[9px] text-[var(--color-c-dim)]">
              {label}
              <span>{v}</span>
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.div
                className="h-full rounded-full bg-[var(--color-c-lime)]"
                initial={{ width: 0 }}
                animate={{ width: inView ? `${v}%` : 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.2 + i * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KeywordsVisual() {
  const chips = [
    ["GraphQL", "Required"],
    ["Docker", "Preferred"],
    ["System design", "Required"],
    ["Kafka", "Preferred"],
  ] as const;
  return (
    <Stagger className="flex flex-wrap gap-1.5">
      {chips.map(([s, t]) => (
        <motion.span
          key={s}
          variants={staggerChild}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-[var(--color-c-text)]"
        >
          {s}
          <span
            className={`rounded px-1 font-mono text-[8px] font-bold uppercase ${
              t === "Required" ? "bg-red-500/20 text-red-300" : "bg-amber-400/20 text-amber-300"
            }`}
          >
            {t}
          </span>
        </motion.span>
      ))}
    </Stagger>
  );
}

function ChecklistVisual() {
  const reduce = useReducedMotion();
  const items = ["Add a GraphQL project", "Mirror the JD title", "Show Docker in a project"];
  const [done, setDone] = useState(reduce ? items.length : 0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setDone((d) => (d >= items.length ? 0 : d + 1)), 1100);
    return () => clearInterval(id);
  }, [inView, reduce, items.length]);
  return (
    <div ref={ref} className="space-y-2">
      {items.map((t, i) => {
        const on = i < done;
        return (
          <div key={t} className="flex items-center gap-2 text-[11px]">
            <motion.span animate={{ scale: on ? [0.6, 1.15, 1] : 1 }} transition={{ duration: 0.35 }}>
              {on ? (
                <CircleCheck className="h-4 w-4 text-[var(--color-c-lime)]" />
              ) : (
                <Circle className="h-4 w-4 text-[var(--color-c-dim)]" />
              )}
            </motion.span>
            <span className={on ? "text-[var(--color-c-dim)] line-through" : "text-[var(--color-c-text-4)]"}>{t}</span>
          </div>
        );
      })}
    </div>
  );
}

const GETS = [
  {
    icon: Target,
    title: "Match Score",
    visual: <ScoreCardVisual />,
    points: [
      "An honest 0-100 score against the exact JD you paste",
      "Broken into skills, experience and seniority fit",
      "No inflated grades to keep you engaged",
    ],
  },
  {
    icon: ListChecks,
    title: "Missing Keywords",
    visual: <KeywordsVisual />,
    points: [
      "The exact skills the JD wants that your resume doesn't show",
      "Tagged required or preferred, so you fix what matters first",
      "Matched on meaning: React.js and ReactJS count as React",
    ],
  },
  {
    icon: Lightbulb,
    title: "Fix-It Plan",
    visual: <ChecklistVisual />,
    points: [
      "Concrete projects to build for each gap",
      "Topics to learn and a realistic timeline",
      "Re-run after each edit to confirm it worked",
    ],
  },
];

export function WhatYouGet() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <FadeUp>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.05] bg-gradient-to-b from-[#1c2716] to-[#141811] px-5 py-16 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 65%)" }}
          />
          <div className="relative">
            <SectionHead kicker="What you get" sub="Not just a number: a full breakdown of what's working and what to fix.">
              What your match report <span className="text-[var(--color-c-lime)]">actually includes</span>
            </SectionHead>
          </div>
          <Stagger className="relative mt-12 grid gap-4 md:grid-cols-3">
            {GETS.map((g) => (
              <motion.div
                key={g.title}
                variants={staggerChild}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#171a15] transition-colors hover:border-[var(--color-c-lime)]/35"
              >
                <div className="flex items-center gap-2.5 border-b border-white/[0.05] bg-[var(--color-c-lime)]/[0.05] px-5 py-4">
                  <g.icon className="h-4 w-4 text-[var(--color-c-lime)]" />
                  <span className="text-[14px] font-bold text-[var(--color-c-text)]">{g.title}</span>
                </div>
                <div className="min-h-[110px] border-b border-white/[0.05] px-5 py-5">{g.visual}</div>
                <ul className="flex flex-1 flex-col gap-2.5 px-5 py-4">
                  {g.points.map((p) => (
                    <li key={p} className="flex gap-2 text-[12px] leading-snug text-[var(--color-c-muted)]">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-c-lime)]" strokeWidth={3} />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </FadeUp>
    </section>
  );
}

/* -------------------------------------------------------- comparison */

const ROWS = [
  ["A vague score with no explanation", "Exact missing skills, tagged by how much each one matters"],
  ["One generic keyword list for every resume", "Scored against the specific job description you paste"],
  ["A number and nothing else", "A prioritised plan: projects, topics and a timeline"],
];

export function AnalysisComparison() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <FadeUp className="text-center">
          <Kicker>The difference</Kicker>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            A real ATS score, not a guessing game
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141713]">
            <div className="grid grid-cols-2 border-b border-white/[0.06] text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
              <span className="px-4 py-4 text-[var(--color-c-dim)]">Generic tools</span>
              <span className="border-l border-white/[0.06] bg-[var(--color-c-lime)]/[0.05] px-4 py-4 text-[var(--color-c-lime)]">
                Job Alert 24
              </span>
            </div>
            <Stagger>
              {ROWS.map(([bad, good], i) => (
                <motion.div
                  key={bad}
                  variants={staggerChild}
                  className={`group grid grid-cols-2 ${i < ROWS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
                >
                  <span className="flex items-start gap-2.5 px-4 py-5 text-[13px] text-[var(--color-c-dim)] sm:px-6">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {bad}
                  </span>
                  <span className="flex items-start gap-2.5 border-l border-white/[0.06] bg-[var(--color-c-lime)]/[0.04] px-4 py-5 text-[13px] font-semibold text-[var(--color-c-text)] transition-colors group-hover:bg-[var(--color-c-lime)]/[0.08] sm:px-6">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-c-lime)]" strokeWidth={3} />
                    {good}
                  </span>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
