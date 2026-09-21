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
    <div className="flex flex-col justify-between rounded-2xl border border-[#1e2920] bg-[#121914] p-6 shadow-sm lg:col-span-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-white">
          Category Breakdown
        </span>
        <BarChart3 className="h-5 w-5 text-[#8c9c90]" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {ROWS.map(({ label, count, width, lead }) => (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className={lead ? "text-white" : "text-[#8c9c90]"}>
                {label}
              </span>
              <span className={lead ? "font-bold text-[#22c55e]" : "text-[#647668]"}>
                {count}
              </span>
            </div>
            <div
              className={`w-full overflow-hidden rounded-full bg-[#18231b] ${
                lead ? "h-2.5" : "h-2"
              }`}
            >
              <div
                className={`h-full rounded-full bg-[#22c55e] ${
                  lead ? "shadow-[0_0_10px_#22c55e]" : ""
                }`}
                style={{ width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#1a251c] pt-3 text-xs text-[#8c9c90]">
        <span>Total verified milestones: 6</span>
        <a href="#syllabus" className="font-medium text-[#22c55e] hover:underline">
          View detailed syllabus →
        </a>
      </div>
    </div>
  );
}
