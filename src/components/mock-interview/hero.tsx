"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Bot, Check, Mic, Star, Timer, User } from "lucide-react";
import { GenerateCta } from "@/components/cover-letter/primitives";
import { EASE } from "@/components/resume-analysis/motion";

const ROUNDS = [
  {
    round: "Technical",
    role: "Frontend Engineer · React",
    q: "How would you stop a large list in React from re-rendering on every keystroke?",
    a: "I'd memoise the rows with React.memo, keep the input state local, and virtualise the list so only visible rows render.",
    score: 8.5,
    tag: "Strong answer",
  },
  {
    round: "Behavioral · STAR",
    role: "Backend Developer",
    q: "Tell me about a production bug you owned end to end.",
    a: "Checkout was double-charging. I traced it to a retry without an idempotency key, shipped a fix, and added an alert.",
    score: 9.0,
    tag: "Clear STAR structure",
  },
  {
    round: "System Design",
    role: "SDE-1",
    q: "Design a URL shortener that handles 10k writes a second.",
    a: "Base62 IDs from a distributed counter, a KV store for lookups, and a cache in front for the hot links.",
    score: 7.5,
    tag: "Good, go deeper on scale",
  },
] as const;

function InterviewSim() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [typedState, setTyped] = useState(0);
  const [score, setScore] = useState(0);
  const r = ROUNDS[i];
  // Reduced motion shows the full answer straight away.
  const typed = reduce ? r.a.length : typedState;
  const answered = typed >= r.a.length;

  // Type the answer, hold on the score, then move to the next round.
  useEffect(() => {
    if (reduce) return;
    if (!answered) {
      const id = setTimeout(() => setTyped((n) => n + 2), typed === 0 ? 1400 : 28);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      setTyped(0);
      setScore(0);
      setI((v) => (v + 1) % ROUNDS.length);
    }, 4200);
    return () => clearTimeout(id);
  }, [typed, answered, r.a.length, reduce]);

  useEffect(() => {
    if (!answered) return;
    const ctrl = animate(0, r.score, { duration: reduce ? 0 : 1.1, ease: EASE, onUpdate: (v) => setScore(v) });
    return () => ctrl.stop();
  }, [answered, r.score, reduce]);

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
        style={{ transformPerspective: 1200 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0b0d0b]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)]"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={r.round}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-[var(--color-c-text-4)]"
            >
              <span className="blink h-1.5 w-1.5 rounded-full bg-red-500" />
              {r.round} round
            </motion.span>
          </AnimatePresence>
          <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--color-c-dim)]">
            <Timer className="h-3 w-3" />
            {`0${i + 1}`}/03
          </span>
        </div>

        <div className="min-h-[300px] space-y-4 p-5 sm:p-7">
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Interviewer */}
              <motion.div
                initial={reduce ? false : { opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex items-start gap-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.07] bg-[#161915] px-3.5 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">Interviewer · {r.role}</p>
                  <p className="mt-1 text-[13px] font-semibold leading-snug text-[var(--color-c-text)]">{r.q}</p>
                </div>
              </motion.div>

              {/* Candidate */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/[0.06] px-3.5 py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-lime)]/80">
                    {typed === 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Mic className="h-3 w-3" /> Thinking…
                      </span>
                    ) : (
                      "Your answer"
                    )}
                  </p>
                  <p className="mt-1 min-h-[3.2em] text-[13px] leading-snug text-[var(--color-c-text-4)]">
                    {r.a.slice(0, typed)}
                    {!answered && (
                      <span aria-hidden className="cl-caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-[var(--color-c-lime)]" />
                    )}
                  </p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[var(--color-c-text-4)]">
                  <User className="h-4 w-4" />
                </span>
              </div>

              {/* Score */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex flex-wrap items-center gap-2 pl-10"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-lime)]/40 bg-[var(--color-c-lime)]/10 px-3 py-1 text-[12px] font-bold text-[var(--color-c-lime)]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {score.toFixed(1)} / 10
                    </span>
                    <span className="text-[12px] text-[var(--color-c-muted)]">{r.tag}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Round progress */}
        <div className="flex gap-1.5 border-t border-white/[0.05] px-5 py-3">
          {ROUNDS.map((x, k) => (
            <span key={x.round} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <motion.span
                className="block h-full rounded-full bg-[var(--color-c-lime)]"
                animate={{ width: k < i ? "100%" : k === i ? (answered ? "100%" : "40%") : "0%" }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0, y: reduce ? 0 : [0, -8, 0] }}
        transition={{ opacity: { delay: 0.8 }, x: { delay: 0.8 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -left-5 -top-8 hidden sm:block"
      >
        <Badge icon={Bot} title="Built from your JD" sub="Not a fixed question bank" />
      </motion.div>
      <motion.div
        initial={reduce ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: reduce ? 0 : [0, 8, 0] }}
        transition={{ opacity: { delay: 1 }, x: { delay: 1 }, y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute -bottom-8 -right-3 hidden sm:block"
      >
        <Badge icon={Check} title="Feedback on every answer" sub="What worked, what to fix" />
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
        <span className="text-[14px] font-extrabold tracking-tight text-[var(--color-c-text)]">{title}</span>
        <span className="text-[11px] text-[var(--color-c-dim)]">{sub}</span>
      </span>
    </div>
  );
}

const WORDS = ["Practise", "the", "interview", "before"];

export function MockInterviewHero() {
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
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-c-text-4)]"
          >
            <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
            AI Mock Interview
          </motion.span>

          <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-[var(--color-c-text)]">
            {WORDS.map((w, i) => (
              <motion.span key={w} {...word(i)} className="mr-[0.25em] inline-block">
                {w}
              </motion.span>
            ))}
            <motion.span {...word(WORDS.length)} className="mr-[0.25em] inline-block">
              it
            </motion.span>
            <motion.span {...word(WORDS.length + 1)} className="relative inline-block whitespace-nowrap">
              counts
              <motion.span
                aria-hidden
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
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
            Technical and HR rounds built from the exact job you&apos;re targeting and your own resume. Answer each
            question, then get a score and honest feedback on what to fix.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.7 }}
          >
            <div className="mt-9">
              <GenerateCta label="Start My Mock Interview" />
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--color-c-dim)]">
              {["Free to start", "Technical, HR and system design", "Feedback on every answer"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[var(--color-c-lime)]" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <InterviewSim />
      </div>
    </section>
  );
}
