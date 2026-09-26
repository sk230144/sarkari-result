"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const LINES = [
  "Reading your answers…",
  "Checking technical depth…",
  "Reviewing your code…",
  "Scoring communication and structure…",
  "Writing model answers…",
  "Putting your debrief together…",
];

const N = 7;

/** Full-screen "EVALUATING" state: a pixel grid that lights up while answers are graded. */
export function Evaluating({ answered, total }: { answered: number; total: number }) {
  const reduce = useReducedMotion();
  const [line, setLine] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const a = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 4500);
    const b = setInterval(() => setTick((t) => t + 1), 420);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Evaluating your interview"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0a0c09]/[0.97] p-6 backdrop-blur-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(163,230,53,0.10) 0%, transparent 65%)" }}
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
          {Array.from({ length: N * N }, (_, i) => {
            const r = Math.floor(i / N);
            const c = i % N;
            // A diagonal sweep plus a little noise, so it reads as "working".
            const phase = (r + c + tick) % (N * 2);
            const noise = ((i * 7919 + tick * 104729) % 17) / 17;
            const on = reduce ? (r + c) % 3 === 0 : phase < 3 || noise > 0.86;
            return (
              <motion.span
                key={i}
                className="h-4 w-4 rounded-[3px] sm:h-5 sm:w-5"
                animate={{
                  backgroundColor: on ? "rgba(163,230,53,0.95)" : "rgba(255,255,255,0.05)",
                  boxShadow: on ? "0 0 14px rgba(163,230,53,0.55)" : "0 0 0 rgba(0,0,0,0)",
                  scale: on ? 1 : 0.86,
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            );
          })}
        </div>

        <p className="mt-9 font-mono text-[22px] font-bold tracking-[0.5em] text-[var(--color-c-lime)] sm:text-[26px]">
          EVALUATING
        </p>
        <div className="mt-3 h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-[13px] font-semibold text-[var(--color-c-text-4)]"
            >
              {LINES[line]}
            </motion.p>
          </AnimatePresence>
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-c-dim)]">
          {answered}/{total} answered · usually 20–40 seconds · don&apos;t close this tab
        </p>
      </div>
    </div>
  );
}
