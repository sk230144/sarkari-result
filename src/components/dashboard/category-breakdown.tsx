"use client";

import { useState } from "react";
import Link from "next/link";
import { BarChart3, ChevronDown, ExternalLink } from "lucide-react";
import type { ProgressData } from "@/lib/progress/types";

export function CategoryBreakdown({
  counts,
  sheets,
}: {
  counts: ProgressData["counts"];
  sheets: ProgressData["sheets"];
}) {
  const [open, setOpen] = useState(false);
  const rows = [
    { label: "DSA problems", count: counts.problemsSolved, href: "/dsa-sheets" },
    { label: "System Design", count: counts.designSolved, href: "/system-design" },
    { label: "Cover Letters", count: counts.coverLetters, href: "/cover-letter" },
    { label: "Mock Interviews", count: 0, href: null, soon: true },
    { label: "Resume Analyses", count: counts.analyses, href: "/resume-analysis" },
    { label: "Tasks completed", count: counts.tasksDone, href: "/task-board" },
  ];
  const max = Math.max(1, ...rows.map((r) => r.count));
  const leadCount = Math.max(...rows.map((r) => r.count));
  const total = rows.reduce((n, r) => n + r.count, 0);
  const started = sheets.filter((s) => s.solved > 0).sort((a, b) => b.solved / b.total - a.solved / a.total);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-c-text)]">Category Breakdown</span>
        <BarChart3 className="h-5 w-5 text-[var(--color-c-muted)]" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {rows.map(({ label, count, href, soon }) => {
          const lead = count > 0 && count === leadCount;
          const labelEl = (
            <span className={lead ? "text-[var(--color-c-text)]" : "text-[var(--color-c-muted)]"}>
              {label}
              {soon && <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim-2)]">soon</span>}
            </span>
          );
          return (
            <div key={label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-medium">
                {href ? (
                  <Link href={href} className="hover:underline">
                    {labelEl}
                  </Link>
                ) : (
                  labelEl
                )}
                <span className={lead ? "font-bold text-[var(--color-c-accent)]" : "text-[var(--color-c-dim-2)]"}>{count}</span>
              </div>
              <div className={`w-full overflow-hidden rounded-full bg-[var(--color-c-surface-9b)] ${lead ? "h-2.5" : "h-2"}`}>
                <div
                  className={`h-full rounded-full bg-[var(--color-c-accent)] transition-[width] duration-700 ${lead ? "shadow-[0_0_10px_#22c55e]" : ""}`}
                  style={{ width: `${count ? Math.max(3, (count / max) * 100) : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="cl-fade mt-5 max-h-64 space-y-2 overflow-y-auto border-t border-[var(--color-c-surface-11)] pt-4">
          {started.length === 0 ? (
            <p className="text-xs text-[var(--color-c-muted)]">
              No sheet started yet.{" "}
              <Link href="/dsa-sheets" className="font-medium text-[var(--color-c-accent)] hover:underline">
                Pick a sheet →
              </Link>
            </p>
          ) : (
            started.map((s) => (
              <Link key={s.key} href={s.href} className="group block">
                <div className="flex justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-[var(--color-c-text-4)] group-hover:text-[var(--color-c-text)]">
                    {s.label}
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </span>
                  <span className="text-[var(--color-c-muted)]">
                    {s.solved}/{s.total} · {Math.round((s.solved / s.total) * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--color-c-surface-9b)]">
                  <div className="h-full rounded-full bg-[var(--color-c-accent)]" style={{ width: `${(s.solved / s.total) * 100}%` }} />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-c-surface-11)] pt-3 text-xs text-[var(--color-c-muted)]">
        <span>Total milestones: {total}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 font-medium text-[var(--color-c-accent)] hover:underline"
        >
          {open ? "Hide" : "View"} per-sheet progress
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}
