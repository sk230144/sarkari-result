"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, EyeOff, Mic, ShieldCheck, Sparkles } from "lucide-react";
import { useCalm } from "@/components/landing/motion-kit";
import { APP_NAME } from "@/lib/desktop-app";

const QUESTION =
  "Can you walk me through how you'd design an LRU cache with get and put in O(1) time?";

const POINTS = [
  ["Core idea", "Pair a hash map with a doubly linked list. The map points each key straight at its node."],
  ["O(1) updates", "On every get or put, unlink the node and move it to the front. The least recently used item is always at the back."],
  ["Clean edges", "Dummy head and tail nodes remove the empty-list and single-item special cases."],
];

const CODE = [
  ["k", "class ", "t", "LRUCache", "p", ":"],
  ["p", "    ", "k", "def ", "f", "__init__", "p", "(self, capacity):"],
  ["p", "        self.cap, self.map = capacity, {}"],
  ["p", "        self.head, self.tail = Node(), Node()"],
  ["p", "    ", "k", "def ", "f", "get", "p", "(self, key):"],
  ["p", "        ", "k", "if ", "p", "key ", "k", "not in ", "p", "self.map: ", "k", "return ", "p", "-1"],
  ["p", "        self._move_to_front(self.map[key])"],
];

const TONE: Record<string, string> = {
  k: "text-[var(--color-c-green)]",
  t: "text-emerald-300",
  f: "text-lime-300",
  p: "text-[var(--color-c-text)]",
};

/** How far the looping demo has got: characters of the question typed, then answer steps shown. */
function useScript(calm: boolean) {
  const [typed, setTyped] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (calm) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(() => !cancelled && fn(), ms));

    const run = () => {
      setTyped(0);
      setStep(0);
      for (let i = 1; i <= QUESTION.length; i++) at(400 + i * 32, () => setTyped(i));
      const done = 400 + QUESTION.length * 32;
      for (let s = 1; s <= POINTS.length + CODE.length + 1; s++) at(done + 500 + s * 420, () => setStep(s));
      at(done + 500 + (POINTS.length + CODE.length + 1) * 420 + 4500, run);
    };
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [calm]);

  return calm ? { typed: QUESTION.length, step: 99 } : { typed, step };
}

export function HudDemo() {
  const calm = useCalm();
  const { typed, step } = useScript(calm);
  const listening = typed < QUESTION.length;

  return (
    <div className="rounded-[28px] border border-[var(--color-c-forest-16)] bg-[var(--color-c-canvas-deep)] p-2 shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35)] sm:p-3">
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[22px] bg-[var(--color-c-surface-4)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-3 w-3 rounded-full bg-red-400/80" />
            <span className="h-3 w-3 rounded-full bg-amber-400/80" />
            <span className="h-3 w-3 rounded-full bg-[var(--color-c-green)]/80" />
          </div>
          <span className="text-xs font-semibold text-[var(--color-c-text)]">{APP_NAME}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-c-green-dim-5)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-green)]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Hidden from screen share
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-b-[22px] bg-[var(--color-c-surface-3)] p-3 text-left lg:grid-cols-12">
        {/* Transcript */}
        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-c-canvas-deep)] p-4 sm:p-5 lg:col-span-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-c-text)]">
              <Mic className="h-4 w-4 text-[var(--color-c-green)]" />
              Live transcription
            </span>
            <span className={`text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-green)] ${listening ? "animate-pulse" : ""}`}>
              {listening ? "Listening…" : "Question heard"}
            </span>
          </div>
          <Waveform active={listening && !calm} />
          <div className="rounded-xl bg-[var(--color-c-surface-4)] p-4">
            <span className="text-[11px] font-semibold text-[var(--color-c-text-dim)]">Interviewer</span>
            <p className="mt-1.5 min-h-[4.5rem] text-sm leading-relaxed text-[var(--color-c-text)]">
              &ldquo;{QUESTION.slice(0, typed)}
              {listening && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-[var(--color-c-green)]" />}
              {!listening && "”"}
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between rounded-xl bg-[var(--color-c-surface-4)] px-4 py-3 text-xs">
            <span className="flex items-center gap-2 text-[var(--color-c-text)]">
              <Camera className="h-4 w-4 text-[var(--color-c-green)]" />
              Screenshot a coding question
            </span>
            <span className="text-[var(--color-c-text-dim)]">1 click</span>
          </div>
        </div>

        {/* Answer */}
        <div className="flex flex-col gap-3 rounded-2xl bg-[var(--color-c-canvas-deep)] p-4 sm:p-5 lg:col-span-7">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-c-green-dim-5)]">
              <Sparkles className="h-4 w-4 text-[var(--color-c-green)]" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-c-text)]">AI answer</p>
              <p className="text-[11px] text-[var(--color-c-green)]">{step > 0 ? "Short points you can say out loud" : "Waiting for the question…"}</p>
            </div>
          </div>

          <ul className="min-h-[9.5rem] space-y-2.5 rounded-xl bg-[var(--color-c-surface-4)] p-4 text-[13px] leading-relaxed text-[var(--color-c-text)]">
            <AnimatePresence initial={false}>
              {POINTS.slice(0, Math.min(step, POINTS.length)).map(([title, text], i) => (
                <motion.li
                  key={title}
                  className="flex gap-2.5"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="font-bold text-[var(--color-c-green)]">{i + 1}.</span>
                  <span>
                    <strong className="font-semibold">{title}:</strong> {text}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="overflow-x-auto rounded-xl bg-[var(--color-c-surface-4)] p-4">
            <div className="mb-2 flex items-center justify-between text-[11px] text-[var(--color-c-text-dim)]">
              <span>Python</span>
              <span className="text-[var(--color-c-green)]">O(1) get and put</span>
            </div>
            <pre className="min-h-[8.5rem] font-mono text-[12px] leading-relaxed">
              {CODE.slice(0, Math.max(0, step - POINTS.length)).map((line, i) => (
                <motion.div key={i} initial={calm ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                  {Array.from({ length: line.length / 2 }, (_, j) => (
                    <span key={j} className={TONE[line[j * 2]]}>
                      {line[j * 2 + 1]}
                    </span>
                  ))}
                </motion.div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-[var(--color-c-surface-4)] px-4 py-3 text-xs text-[var(--color-c-text-dim)] sm:px-5">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--color-c-green)]" />
          Listening to system audio
        </span>
        <span className="flex items-center gap-1.5 text-[var(--color-c-green)]">
          <EyeOff className="h-3.5 w-3.5" />
          Not visible to the other side
        </span>
      </div>
    </div>
  );
}

const BARS = [10, 18, 8, 24, 14, 28, 12, 20, 9, 26, 16, 22, 11, 19, 7, 25, 13, 21, 10, 17, 8, 23, 15, 12];

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-12 items-center justify-between gap-[3px] rounded-xl bg-[var(--color-c-surface-4)] px-4" aria-hidden>
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-[var(--color-c-green)]"
          style={{ height: 4 }}
          animate={{ height: active ? [4, h, 6, h * 0.7, 4] : 4 }}
          transition={active ? { duration: 1.1 + (i % 4) * 0.2, repeat: Infinity, ease: "easeInOut", delay: (i % 6) * 0.08 } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}
