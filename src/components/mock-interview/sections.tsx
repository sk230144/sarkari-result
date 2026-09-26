"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  MessagesSquare,
  Code2,
  Users,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Star,
  Bot,
} from "lucide-react";
import { GenerateCta, Kicker, TypeLoop } from "@/components/cover-letter/primitives";
import { EASE, FadeUp, Stagger, staggerChild } from "@/components/resume-analysis/motion";

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

function SetupVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-c-lime)]/10">
          <Code2 className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
        </span>
        <span className="text-[12px] font-semibold text-[var(--color-c-text)]">
          <TypeLoop texts={["Frontend Developer", "Backend Developer", "Data Analyst"]} caretClassName="bg-[var(--color-c-text)]" />
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10">
          <FileText className="h-3.5 w-3.5 text-red-400" />
        </span>
        <span className="flex-1 text-[12px] font-semibold text-[var(--color-c-text-4)]">resume.pdf</span>
        <motion.span
          animate={reduce ? undefined : { scale: [0.8, 1.1, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1 }}
        >
          <CircleCheck className="h-4 w-4 text-[var(--color-c-lime)]" />
        </motion.span>
      </div>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-c-lime)]">
        <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
        Saved once, reused for every round
      </p>
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
          texts={["React, TypeScript, performance…", "Node.js, PostgreSQL, AWS…", "SQL, Power BI, stakeholders…"]}
          caretClassName="bg-[var(--color-c-text)]"
        />
        <span className="mt-2 block h-1 w-4/5 rounded-full bg-white/[0.05]" />
        <span className="mt-1.5 block h-1 w-3/5 rounded-full bg-white/[0.05]" />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-c-lime)]">
        <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
        Writing questions for this exact role…
      </p>
    </>
  );
}

function AnswerVisual() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-lime)]/15">
          <Bot className="h-3 w-3 text-[var(--color-c-lime)]" />
        </span>
        <p className="rounded-xl bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-c-text)]">
          Tell me about a challenging bug you fixed.
        </p>
      </div>
      <p className="ml-8 rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-1.5 text-[11px] text-[var(--color-c-text-4)]">
        <TypeLoop
          texts={["I traced a race condition in our checkout flow to a stale closure…"]}
          speed={40}
          hold={2600}
          caretClassName="bg-[var(--color-c-text)]"
        />
      </p>
      <motion.span
        className="ml-8 inline-flex items-center gap-1 rounded-full bg-[var(--color-c-lime)]/15 px-2.5 py-1 text-[10px] font-bold text-[var(--color-c-lime)]"
        animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Star className="h-3 w-3 fill-current" />
        8.5 / 10 · Strong answer
      </motion.span>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    title: "Pick a role, add your resume",
    body: "Choose the role you're interviewing for. Your saved resume is used so questions probe your real projects.",
    cta: "Set up my interview",
    visual: <SetupVisual />,
  },
  {
    n: "02",
    icon: FileText,
    title: "Paste the job description",
    body: "Drop in the JD. Questions are generated for its exact stack and seniority, not pulled from a generic bank.",
    cta: "Add job description",
    visual: <JdVisual />,
  },
  {
    n: "03",
    icon: MessagesSquare,
    title: "Answer & get scored",
    body: "Answer technical and HR questions, then get a score and feedback on every single response.",
    cta: "Start my mock interview",
    visual: <AnswerVisual />,
  },
];

export function InterviewHowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead kicker="How it works" sub="Three steps from a job post to a full practice round, in a couple of minutes.">
          3 simple steps to <span className="text-[var(--color-c-lime)]">interview-ready</span>
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

const ROUNDS = [
  {
    icon: Code2,
    title: "Technical Round",
    sample: "Walk me through how you'd find the longest substring without repeating characters. What's the complexity?",
    points: [
      "DSA and problem-solving calibrated to the JD's stack",
      "System design fundamentals for the seniority level",
      "Databases, SQL and OOP where the JD calls for it",
    ],
  },
  {
    icon: Users,
    title: "Behavioral (STAR)",
    sample: "Tell me about a time you disagreed with a teammate on a technical decision. What did you do?",
    points: [
      "Real HR-round questions in the STAR format",
      "Built to probe how you actually handled a situation",
      "Not a memorised script, scored on your real answer",
    ],
  },
  {
    icon: CircleCheck,
    title: "Feedback On Every Answer",
    sample: "Good structure. You named the fix but not the impact: add how many users it affected and how you verified it.",
    points: [
      "What was correct, what was missing, how to improve",
      "Delivered per answer, not just a final score",
      "Retake as many times as you need before the real thing",
    ],
  },
];

export function InterviewWhatYouGet() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || reduce) return;
    const id = setTimeout(() => setActive((v) => (v + 1) % ROUNDS.length), 6000);
    return () => clearTimeout(id);
  }, [active, touched, reduce]);

  const pick = (i: number) => {
    setTouched(true);
    setActive((i + ROUNDS.length) % ROUNDS.length);
  };

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
            <SectionHead kicker="What you get" sub="Questions are generated from the JD's stack and seniority, not a one-size-fits-all bank.">
              Every round <span className="text-[var(--color-c-lime)]">the real interview covers</span>
            </SectionHead>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {ROUNDS.map((r, i) => {
              const on = i === active;
              return (
                <motion.button
                  key={r.title}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  animate={{ y: on ? -6 : 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className={`flex flex-col overflow-hidden rounded-2xl border text-left transition-colors duration-500 ${
                    on
                      ? "border-[var(--color-c-lime)]/50 bg-[#1a1f17] shadow-[0_24px_60px_-24px_rgba(163,230,53,0.4)]"
                      : "border-white/[0.06] bg-[#171a15] hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex items-center gap-2.5 border-b px-5 py-4 transition-colors ${
                      on ? "border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/[0.08]" : "border-white/[0.05] bg-white/[0.02]"
                    }`}
                  >
                    <r.icon className="h-4 w-4 text-[var(--color-c-lime)]" />
                    <span className="text-[14px] font-bold text-[var(--color-c-text)]">{r.title}</span>
                  </span>
                  <span className="block min-h-[96px] px-5 py-5">
                    <AnimatePresence mode="wait">
                      {on ? (
                        <motion.span
                          key="sample"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="block text-[12.5px] italic leading-relaxed text-[var(--color-c-text-4)]"
                        >
                          &ldquo;{r.sample}&rdquo;
                        </motion.span>
                      ) : (
                        <motion.span key="lines" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="block space-y-2.5 pt-1">
                          <span className="block h-1.5 w-11/12 rounded-full bg-white/[0.08]" />
                          <span className="block h-1.5 w-full rounded-full bg-white/[0.08]" />
                          <span className="block h-1.5 w-3/4 rounded-full bg-white/[0.08]" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className="flex flex-col gap-2.5 border-t border-white/[0.05] px-5 py-4">
                    {r.points.map((p) => (
                      <span key={p} className="flex gap-2 text-[12px] leading-snug text-[var(--color-c-muted)]">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-c-lime)]" strokeWidth={3} />
                        {p}
                      </span>
                    ))}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="relative mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => pick(active - 1)}
              aria-label="Previous round"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-[var(--color-c-text)] transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex gap-1.5">
              {ROUNDS.map((r, i) => (
                <span key={r.title} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-[var(--color-c-lime)]" : "w-1.5 bg-white/20"}`} />
              ))}
            </span>
            <button
              type="button"
              onClick={() => pick(active + 1)}
              aria-label="Next round"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[var(--color-c-text)] transition-colors hover:bg-white/15"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ----------------------------------------------------------- banner */

export function FirstRepBanner() {
  const reduce = useReducedMotion();
  return (
    <section className="px-6 py-12 lg:px-8">
      <FadeUp>
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#1d231b] to-[#0f110e] px-7 py-14 sm:px-12 md:grid-cols-2">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <h2 className="text-[clamp(1.8rem,3.8vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--color-c-text)]">
              Don&apos;t let the real interview be your first rep.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[var(--color-c-muted)]">
              Practise technical and HR rounds built from the exact JD you&apos;re targeting, with feedback on every
              answer.
            </p>
            <div className="mt-7">
              <GenerateCta size="md" label="Start My Mock Interview" />
            </div>
          </div>
          <motion.div
            className="relative rounded-2xl border border-white/10 bg-[#171a17]/95 p-5 shadow-2xl"
            animate={reduce ? undefined : { y: [0, -8, 0], rotate: [-1.5, -0.5, -1.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="mb-4 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
              <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
              <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
            </span>
            <p className="rounded-md bg-[var(--color-c-lime)]/15 px-2 py-1.5 text-[12px] font-semibold text-[var(--color-c-lime)]">
              <TypeLoop texts={["Q1 · Explain the event loop", "Q2 · Design a rate limiter", "Q3 · A time you failed"]} speed={50} hold={1600} />
            </p>
            {[1, 0.85, 0.66].map((w, i) => (
              <motion.span
                key={i}
                className="mt-2.5 block h-1.5 rounded-full bg-white/[0.08]"
                initial={{ width: 0 }}
                whileInView={{ width: `${w * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.3 + i * 0.15 }}
              />
            ))}
          </motion.div>
        </div>
      </FadeUp>
    </section>
  );
}

/* ------------------------------------------------------- comparison */

const ROWS = [
  ["A fixed question bank with model answers to memorise", "Questions generated from the actual JD you're applying to"],
  ["No feedback on what you actually said", "AI feedback on every single answer you give"],
  ["Generic programming trivia", "Specific to the stack in the JD: React, Node.js, Python and more"],
];

export function InterviewComparison() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <FadeUp className="text-center">
          <Kicker>The difference</Kicker>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Real feedback, not a static question bank
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141713]">
            <div className="grid grid-cols-2 border-b border-white/[0.06] text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
              <span className="px-4 py-4 text-[var(--color-c-dim)]">Generic tools</span>
              <span className="border-l border-white/[0.06] bg-[var(--color-c-lime)]/[0.05] px-4 py-4 text-[var(--color-c-lime)]">Job Alert 24</span>
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

/* --------------------------------------------------------- article */

export function WhyPracticeMatters() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <FadeUp>
        <article className="mx-auto max-w-2xl">
          <h2 className="text-[clamp(1.5rem,3.2vw,2rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">
            Why interview practice matters more than interview knowledge
          </h2>
          <div className="mt-5 space-y-4 text-[14px] leading-[1.8] text-[var(--color-c-muted)]">
            <p>
              Most freshers who fail a technical interview don&apos;t fail because they didn&apos;t know the material.
              They fail because they&apos;d never had to explain it out loud, under time pressure, to someone
              evaluating every word. Solving a problem alone in an editor and solving it while narrating your thinking
              to an interviewer are different skills, and the second one is what actually gets tested.
            </p>
            <p>
              Static prep resources (question banks, video playlists, lists of &ldquo;top DSA questions&rdquo;) teach
              the first skill, not the second. They also rarely match the role you&apos;re interviewing for: a fixed
              question bank doesn&apos;t know whether the job needs React specifically, system design fundamentals or
              SQL, so it gives you a little of everything and a lot of nothing.
            </p>
            <p>
              Job Alert 24&apos;s mock interviews generate questions from the actual job description you&apos;re
              applying to and the projects on your resume: technical questions calibrated to the stack and seniority,
              and HR questions in the STAR format. Every answer gets specific feedback, so each practice round makes
              the next one, and the real one, better.
            </p>
          </div>
        </article>
      </FadeUp>
    </section>
  );
}
