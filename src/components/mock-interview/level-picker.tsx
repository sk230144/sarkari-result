"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Code2, Monitor, X } from "lucide-react";
import { Modal } from "@/components/cover-letter/modal";
import { EASE } from "@/components/resume-analysis/motion";
import { CODING_COUNT, HR_COUNT, LEVELS, MINUTES, TECH_COUNT, type Level } from "@/lib/interview/types";

export function estimateMinutes(level: Level) {
  const m = MINUTES[level];
  const coding = CODING_COUNT[level];
  return m.intro + m.closing + (TECH_COUNT - coding) * m.technical + coding * m.coding + (HR_COUNT - 2) * m.behavioral;
}

const fmt = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${Math.round(min % 60)}m` : `${Math.round(min)} min`);

export function LevelPicker({
  role,
  remaining,
  onClose,
  onStart,
}: {
  role: string;
  /** Interviews left today; null = unlimited or unknown. */
  remaining: number | null;
  onClose: () => void;
  onStart: (level: Level) => void;
}) {
  const [level, setLevel] = useState<Level>("medium");
  return (
    <Modal label="Choose interview level" onClose={onClose} className="max-w-2xl">
      <div className="flex items-start gap-4 border-b border-white/[0.06] px-6 py-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-c-lime)]/10">
          <Monitor className="h-5 w-5 text-[var(--color-c-lime)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-bold tracking-tight text-[var(--color-c-text)]">Choose your difficulty</p>
          <p className="truncate text-[12px] text-[var(--color-c-muted)]">
            {role} · 20 questions: 10 technical, 10 culture fit
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] hover:bg-white/10 hover:text-[var(--color-c-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-5">
        <div role="radiogroup" aria-label="Level" className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((l, i) => {
            const on = level === l.key;
            return (
              <motion.button
                key={l.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setLevel(l.key)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                className={`relative flex flex-col rounded-2xl border p-4 text-left transition-all duration-300 ${
                  on
                    ? "border-[var(--color-c-lime)]/60 bg-[var(--color-c-lime)]/[0.06] shadow-[0_0_0_4px_rgba(163,230,53,0.06)]"
                    : "border-white/[0.07] bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <span
                  className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                    on ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black" : "border-white/15"
                  }`}
                >
                  {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                </span>
                <span className="text-[16px] font-extrabold tracking-tight text-[var(--color-c-text)]">{l.label}</span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-lime)]">{l.sub}</span>
                <span className="mt-2.5 flex-1 text-[12px] leading-relaxed text-[var(--color-c-muted)]">{l.blurb}</span>
                <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-white/[0.06] pt-3 font-mono text-[10px] font-bold text-[var(--color-c-text-4)]">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {fmt(estimateMinutes(l.key))}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Code2 className="h-3 w-3" />
                    {CODING_COUNT[l.key]} coding
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-c-dim)]">
          Questions come from your resume, the role and the job description, and never repeat ones from your earlier sessions.
          {remaining !== null && ` You have ${remaining} interview${remaining === 1 ? "" : "s"} left today.`}
        </p>
      </div>

      <div className="flex gap-2.5 border-t border-white/[0.06] px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-4 py-3 text-[13px] font-bold text-[var(--color-c-text-4)] hover:border-white/25 hover:text-[var(--color-c-text)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onStart(level)}
          disabled={remaining === 0}
          className="cl-glow flex-1 rounded-xl bg-[var(--color-c-lime)] px-4 py-3 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {remaining === 0 ? "Daily limit reached" : `Generate ${LEVELS.find((l) => l.key === level)!.label.toLowerCase()} interview`}
        </button>
      </div>
    </Modal>
  );
}
