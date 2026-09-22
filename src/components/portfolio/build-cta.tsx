"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Check, Loader2 } from "lucide-react";

const STEPS = [
  "Reading your resume PDF…",
  "Extracting skills and experience…",
  "Detecting projects and repos…",
  "Structuring your profile…",
  "Deploying your portfolio…",
];

export function BuildCta({
  variant = "primary",
  label = "Build My Portfolio Site",
}: {
  variant?: "primary" | "compact";
  label?: string;
}) {
  const router = useRouter();
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!building) return;

    if (step >= STEPS.length) {
      const done = setTimeout(() => router.push("/profile"), 600);
      return () => clearTimeout(done);
    }

    const next = setTimeout(() => setStep((s) => s + 1), 620);
    return () => clearTimeout(next);
  }, [building, step, router]);

  const pct = Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setBuilding(true);
        }}
        className={
          variant === "primary"
            ? "group inline-flex items-center gap-2 rounded-full border border-[var(--color-c-forest-26)] bg-[var(--color-c-surface-2b)] px-7 py-3.5 text-[13px] font-bold text-[var(--color-c-text)] shadow-[0_0_25px_rgba(163,230,53,0.18)] transition-all hover:border-[var(--color-c-lime)]/50 hover:shadow-[0_0_35px_rgba(163,230,53,0.3)]"
            : "group inline-flex items-center gap-2 rounded-full border border-[var(--color-c-forest-26)] bg-[var(--color-c-surface-2b)] px-6 py-3 text-[12px] font-bold text-[var(--color-c-text)] shadow-[0_0_25px_rgba(163,230,53,0.18)] transition-all hover:border-[var(--color-c-lime)]/50"
        }
      >
        <Sparkles className="h-4 w-4 text-[var(--color-c-lime)]" />
        {label}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      {building && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Building your portfolio"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)] p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-c-chip-easy)]">
                <span className="ripple absolute inset-0 rounded-full border border-[var(--color-c-lime)]/40" />
                <Sparkles className="h-5 w-5 text-[var(--color-c-lime)]" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-[var(--color-c-text)]">
                  Building your portfolio
                </p>
                <p className="text-[11px] text-[var(--color-c-muted)]">
                  This usually takes under a minute.
                </p>
              </div>
            </div>

            <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]">
              <div
                className="h-full rounded-full bg-[var(--color-c-lime)] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <ul className="space-y-2.5">
              {STEPS.map((s, i) => {
                const complete = i < step;
                const active = i === step;
                return (
                  <li key={s} className="flex items-center gap-2.5">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        complete
                          ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black"
                          : active
                            ? "border-[var(--color-c-lime)] text-[var(--color-c-lime)]"
                            : "border-[var(--color-c-border-cool-2)] text-transparent"
                      }`}
                    >
                      {complete ? (
                        <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                      ) : active ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : null}
                    </span>
                    <span
                      className={`text-[11px] transition-colors ${
                        complete
                          ? "text-[var(--color-c-dim)] line-through"
                          : active
                            ? "text-[var(--color-c-text)]"
                            : "text-[var(--color-c-dim)]"
                      }`}
                    >
                      {s}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
