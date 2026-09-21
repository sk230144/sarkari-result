"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

const ITEMS = [
  {
    id: "ats",
    title: "ATS resume score checked",
    body: "See exactly what an ATS would flag before a recruiter ever opens your resume.",
    cta: "Check my resume score",
    href: "#resume-analysis",
  },
  {
    id: "portfolio",
    title: "Portfolio ready",
    body: "A live link recruiters can actually click, not just a PDF.",
    cta: "Build my portfolio",
    href: "#portfolio",
  },
  {
    id: "cover-letter",
    title: "Cover letter generated",
    body: "Tailored to a real job description, not a generic template.",
    cta: "Generate a cover letter",
    href: "#cover-letter",
  },
  {
    id: "mock",
    title: "Mock interview practiced",
    body: "Real questions for your role, before the real thing.",
    cta: "Practice a mock interview",
    href: "#mock-interview",
  },
];

const APPLIED_ID = "applied";
const TOTAL = ITEMS.length + 1;

export function ReadinessChecklist() {
  // "Applied" starts complete, matching the design's 1/5 state.
  const [done, setDone] = useState<string[]>([APPLIED_ID]);

  function toggle(id: string) {
    setDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const count = done.length;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[#1e2920] bg-[#111712] p-6 shadow-sm lg:p-7">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[15px] font-bold tracking-tight text-white">
            Are you actually ready to apply?
          </h2>
          <p className="mt-0.5 text-xs text-[#8c9c90]">
            Most rejections happen before a human ever reads your resume. Check
            these off before you start applying, not after.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-[#27382b] bg-[#18231a] px-3.5 py-1.5 sm:self-auto">
          <span className="text-base font-bold text-[#22c55e]">
            {count}/{TOTAL}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8c9c90]">
            Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        {ITEMS.map((item) => {
          const checked = done.includes(item.id);
          return (
            <div
              key={item.id}
              className={`group flex items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                checked
                  ? "border-[#1b4324] bg-[#102416]"
                  : "border-[#223024] bg-[#141d16] hover:border-[#10b981]/40"
              }`}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                aria-label={item.title}
                onClick={() => toggle(item.id)}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  checked
                    ? "border-[#22c55e] bg-[#22c55e] text-[#06200f]"
                    : "border-[#4a5f4f] text-transparent hover:border-[#10b981] group-hover:border-[#10b981]"
                }`}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={checked ? 3 : 2} />
              </button>

              <div className="flex min-w-0 flex-col gap-1">
                <span
                  className={`text-[13px] font-semibold ${
                    checked ? "text-white line-through decoration-[#22c55e]/50" : "text-white"
                  }`}
                >
                  {item.title}
                </span>
                <p className="text-xs text-[#8c9c90]">{item.body}</p>
                <a
                  href={item.href}
                  className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-[#22c55e] transition-colors hover:text-[#4edea3]"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="h-[15px] w-[15px]" />
                </a>
              </div>
            </div>
          );
        })}

        {/* Applied — spans both columns */}
        <div
          className={`flex items-start gap-3.5 rounded-xl border p-4 transition-colors md:col-span-2 ${
            done.includes(APPLIED_ID)
              ? "border-[#1b4324] bg-[#102416]"
              : "border-[#223024] bg-[#141d16]"
          }`}
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={done.includes(APPLIED_ID)}
            aria-label="Applied to at least one job"
            onClick={() => toggle(APPLIED_ID)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
              done.includes(APPLIED_ID)
                ? "border-[#22c55e] bg-[#22c55e] text-[#06200f]"
                : "border-[#4a5f4f] text-transparent hover:border-[#10b981]"
            }`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </button>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-white">
              Applied to at least one job
              {done.includes(APPLIED_ID) && (
                <span className="rounded bg-[#22c55e]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">
                  Complete
                </span>
              )}
            </span>
            <p className="text-xs text-[#93ba9b]">
              All the prep in the world doesn&apos;t matter until you actually
              hit apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
