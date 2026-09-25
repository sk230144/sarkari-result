"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import type { ProgressData } from "@/lib/progress/types";

type Item = { id: string; title: string; body: string; cta: string; href: string; done: boolean; soon?: boolean; hint?: string | null };

/**
 * Readiness is detected from real activity, not ticked by hand:
 * a resume report exists, the public profile is live, a cover letter was
 * generated, a job application was logged. Only "applied" can be marked
 * manually, since people often apply outside the site.
 */
export function ReadinessChecklist({
  readiness,
  onMarkApplied,
}: {
  readiness: ProgressData["readiness"];
  onMarkApplied: () => Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  const items: Item[] = [
    {
      id: "ats",
      title: "ATS resume score checked",
      body: "See exactly what an ATS would flag before a recruiter ever opens your resume.",
      cta: readiness.ats ? "Run another analysis" : "Check my resume score",
      href: "/resume-analysis",
      done: readiness.ats,
    },
    {
      id: "portfolio",
      title: "Portfolio ready",
      body: "A live link recruiters can actually click, not just a PDF.",
      cta: readiness.portfolio ? "View my profile" : "Finish my profile",
      href: "/profile",
      done: readiness.portfolio,
      hint: readiness.portfolioHint,
    },
    {
      id: "cover-letter",
      title: "Cover letter generated",
      body: "Tailored to a real job description, not a generic template.",
      cta: readiness.coverLetter ? "Write another" : "Generate a cover letter",
      href: "/cover-letter",
      done: readiness.coverLetter,
    },
    {
      id: "mock",
      title: "Mock interview practiced",
      body: "Real questions for your role, before the real thing.",
      cta: "Coming soon",
      href: "",
      done: false,
      soon: true,
    },
  ];

  const counted = items.filter((i) => !i.soon);
  const total = counted.length + 1;
  const count = counted.filter((i) => i.done).length + (readiness.applied ? 1 : 0);

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-2c)] p-6 shadow-sm lg:p-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-[var(--color-c-text)]">Are you actually ready to apply?</h2>
          <p className="mt-0.5 text-xs text-[var(--color-c-muted)]">
            Most rejections happen before a human ever reads your resume. These tick themselves off as you use each
            tool.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-[var(--color-c-forest-15)] bg-[var(--color-c-surface-9)] px-3.5 py-1.5 sm:self-auto">
          <span className="text-base font-bold text-[var(--color-c-accent)]">
            {count}/{total}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-muted)]">Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-colors ${
              item.done
                ? "border-[var(--color-c-forest-28)] bg-[var(--color-c-green-dim-3)]"
                : item.soon
                  ? "border-[var(--color-c-forest-4)] bg-[var(--color-c-surface-5d)] opacity-70"
                  : "border-[var(--color-c-forest-4)] bg-[var(--color-c-surface-5d)] hover:border-[var(--color-c-emerald)]/40"
            }`}
          >
            <span
              role="img"
              aria-label={item.done ? "Done" : "Not done yet"}
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                item.done
                  ? "border-[var(--color-c-accent)] bg-[var(--color-c-accent)] text-[var(--color-c-green-dim)]"
                  : "border-[var(--color-c-neutral-9)] text-transparent"
              }`}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[var(--color-c-text)]">
                <span className={item.done ? "line-through decoration-[var(--color-c-accent)]/50" : ""}>{item.title}</span>
                {item.soon && (
                  <span className="rounded-full border border-white/10 px-1.5 py-px font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-muted)]">
                    Soon
                  </span>
                )}
              </span>
              <p className="text-xs text-[var(--color-c-muted)]">{item.body}</p>
              {!item.done && item.hint && <p className="text-[11px] font-medium text-amber-300">Next: {item.hint}</p>}
              {!item.soon && (
                <Link
                  href={item.href}
                  className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-c-accent)] transition-colors hover:text-[var(--color-c-emerald-4)]"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="h-[15px] w-[15px]" />
                </Link>
              )}
            </div>
          </div>
        ))}

        {/* Applied — spans both columns */}
        <div
          className={`flex flex-wrap items-start gap-3.5 rounded-xl border p-4 transition-colors md:col-span-2 ${
            readiness.applied
              ? "border-[var(--color-c-forest-28)] bg-[var(--color-c-green-dim-3)]"
              : "border-[var(--color-c-forest-4)] bg-[var(--color-c-surface-5d)]"
          }`}
        >
          <span
            role="img"
            aria-label={readiness.applied ? "Done" : "Not done yet"}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              readiness.applied
                ? "border-[var(--color-c-accent)] bg-[var(--color-c-accent)] text-[var(--color-c-green-dim)]"
                : "border-[var(--color-c-neutral-9)] text-transparent"
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-c-text)]">
              Applied to at least one job
              {readiness.applied && (
                <span className="rounded bg-[var(--color-c-accent)]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-accent)]">
                  Complete
                </span>
              )}
            </span>
            <p className="text-xs text-[var(--color-c-text-muted-3)]">
              All the prep in the world doesn&apos;t matter until you actually hit apply. Log each application as a done
              &ldquo;Applied&rdquo; task on your Task Board.
            </p>
          </div>
          {!readiness.applied && (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/jobs"
                className="rounded-lg border border-[var(--color-c-forest-15)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-accent)] hover:bg-[var(--color-c-accent)]/10"
              >
                Browse jobs
              </Link>
              <button
                type="button"
                disabled={marking}
                onClick={async () => {
                  setMarking(true);
                  await onMarkApplied();
                  setMarking(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-accent)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-c-green-dim)] disabled:opacity-60"
              >
                {marking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                I&apos;ve applied to a job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
