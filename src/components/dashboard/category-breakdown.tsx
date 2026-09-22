import { BarChart3 } from "lucide-react";

const ROWS = [
  { label: "DSA", count: 6, width: "82%", lead: true },
  { label: "System Design", count: 0, width: "0%", lead: false },
  { label: "Cover Letters", count: 0, width: "0%", lead: false },
  { label: "Mock Interviews", count: 0, width: "0%", lead: false },
  { label: "Resume Analyses", count: 0, width: "0%", lead: false },
];

export function CategoryBreakdown() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--color-c-text)]">
          Category Breakdown
        </span>
        <BarChart3 className="h-5 w-5 text-[var(--color-c-muted)]" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {ROWS.map(({ label, count, width, lead }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className={lead ? "text-[var(--color-c-text)]" : "text-[var(--color-c-muted)]"}>
                {label}
              </span>
              <span className={lead ? "font-bold text-[var(--color-c-accent)]" : "text-[var(--color-c-dim-2)]"}>
                {count}
              </span>
            </div>
            <div
              className={`w-full overflow-hidden rounded-full bg-[var(--color-c-surface-9b)] ${
                lead ? "h-2.5" : "h-2"
              }`}
            >
              <div
                className={`h-full rounded-full bg-[var(--color-c-accent)] ${
                  lead ? "shadow-[0_0_10px_#22c55e]" : ""
                }`}
                style={{ width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-c-surface-11)] pt-3 text-xs text-[var(--color-c-muted)]">
        <span>Total verified milestones: 6</span>
        <a href="#syllabus" className="font-medium text-[var(--color-c-accent)] hover:underline">
          View detailed syllabus →
        </a>
      </div>
    </div>
  );
}
