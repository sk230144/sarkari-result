"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCalm } from "./motion-kit";
import { ArrowUp, Sparkles } from "lucide-react";

/** What AI Copilot can actually do, phrased the way people would ask. */
const PROMPTS = [
  "Why did my resume score 62/100 for this JD?",
  "Write a cover letter for a Frontend Developer role at Razorpay",
  "Start a mock interview for a Backend Developer role",
  "Which skills am I missing for this Data Analyst job?",
  "Make my cover letter shorter and more confident",
];

const TYPE_MS = 42;
const ERASE_MS = 18;
const HOLD_MS = 1700;
const GAP_MS = 350;

/**
 * Looks like a prompt box, types and erases example questions, and opens
 * AI Copilot when clicked anywhere (box or arrow).
 */
export function HeroPrompt() {
  const reduce = useCalm();
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [erasing, setErasing] = useState(false);
  const text = PROMPTS[i];

  useEffect(() => {
    if (reduce) return;
    let id: ReturnType<typeof setTimeout>;
    if (!erasing && n < text.length) id = setTimeout(() => setN(n + 1), TYPE_MS);
    else if (!erasing) id = setTimeout(() => setErasing(true), HOLD_MS);
    else if (n > 0) id = setTimeout(() => setN(n - 1), ERASE_MS);
    else
      id = setTimeout(() => {
        setErasing(false);
        setI((v) => (v + 1) % PROMPTS.length);
      }, GAP_MS);
    return () => clearTimeout(id);
  }, [n, erasing, text, reduce]);

  const shown = reduce ? PROMPTS[0] : text.slice(0, n);

  return (
    <Link
      href="/ai-copilot"
      aria-label="Ask AI Copilot: open AI Copilot"
      className="group flex items-center justify-between gap-3 rounded-full border border-[var(--color-c-forest-12)] bg-[var(--color-c-surface-4b)]/95 px-5 py-3 text-left shadow-2xl backdrop-blur-md transition-colors hover:border-[var(--color-c-green)]/60 focus-visible:border-[var(--color-c-green)] focus-visible:outline-none"
    >
      <span className="flex min-w-0 flex-1 cursor-text items-center gap-3">
        <motion.span
          aria-hidden
          animate={reduce ? undefined : { rotate: [0, 12, -6, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
          className="flex shrink-0"
        >
          <Sparkles className="h-5 w-5 text-[var(--color-c-green)]" />
        </motion.span>
        <span aria-hidden className="flex min-w-0 items-center text-sm text-[var(--color-c-text-4)]">
          <span className="truncate whitespace-pre">{shown || " "}</span>
          <motion.span
            className="ml-0.5 inline-block h-4 w-0.5 shrink-0 rounded-full bg-[var(--color-c-green)]"
            animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
          />
        </span>
      </span>
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-green)] text-black transition-transform group-hover:scale-105 group-hover:bg-[var(--color-c-accent)]"
      >
        <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
