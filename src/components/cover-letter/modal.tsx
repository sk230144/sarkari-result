"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { LogoClimb } from "@/components/ui/logo";
import { prefersReducedMotion } from "./primitives";

export function Modal({
  label,
  onClose,
  children,
  className = "",
}: {
  label: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="cl-overlay-in absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`cl-modal-in relative flex max-h-full w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#131612] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Full-screen checklist that ticks through steps, then hands off.
 * Holds on the last step until `done` is true, and races through the rest
 * once it is, so a fast (cached) result isn't held behind the animation.
 */
export function StepLoader({
  title,
  steps,
  done,
  onDone,
}: {
  title: string;
  steps: string[];
  /** Omit for a purely timed run; pass false/true to follow a real request. */
  done?: boolean;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const fast = prefersReducedMotion();
    if (step >= steps.length) {
      const id = setTimeout(onDone, fast ? 0 : 350);
      return () => clearTimeout(id);
    }
    if (step === steps.length - 1 && done === false) return;
    const id = setTimeout(() => setStep((s) => s + 1), fast || done === true ? 140 : 750);
    return () => clearTimeout(id);
  }, [step, steps.length, done, onDone]);

  const pct = Math.round((Math.min(step, steps.length) / steps.length) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className="cl-overlay-in fixed inset-0 z-[70] flex items-center justify-center bg-[#0b0d0a]/95 p-6 backdrop-blur-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="cl-modal-in relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3 text-center">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/[0.07]">
            <span className="ripple absolute inset-0 rounded-2xl border border-[var(--color-c-lime)]/40" />
            <LogoClimb animate="always" className="h-9 w-9 text-[var(--color-c-lime)]" />
          </span>
          <p className="text-[15px] font-extrabold tracking-tight text-[var(--color-c-text)]">
            {title}
          </p>
          <div className="h-1 w-40 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-[var(--color-c-lime)] transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="space-y-3.5">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={s}
                className="flex items-center gap-3 transition-opacity duration-500"
                style={{ opacity: done || active ? 1 : Math.max(0.25, 0.8 - (i - step) * 0.15) }}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    done
                      ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black"
                      : active
                        ? "border-[var(--color-c-lime)] text-[var(--color-c-lime)]"
                        : "border-white/25 text-white/40"
                  }`}
                >
                  {done ? (
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </span>
                <span
                  className={`text-[13px] font-semibold ${
                    active
                      ? "text-[var(--color-c-lime)]"
                      : done
                        ? "text-[var(--color-c-text)]"
                        : "text-[var(--color-c-text-4)]"
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
  );
}
