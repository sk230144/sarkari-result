import { CheckCircle2, PieChart, Flame, Zap, Briefcase } from "lucide-react";

type Metric = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  hover: string;
  value: string;
  suffix?: string;
  hint?: string;
  wide?: boolean;
};

export function MetricCards({
  solved,
  total,
  currentStreak,
  longestStreak,
  jobsApplied,
}: {
  solved: number;
  total: number;
  currentStreak: number;
  longestStreak: number;
  jobsApplied: number;
}) {
  const pct = total ? (solved / total) * 100 : 0;
  const metrics: Metric[] = [
    {
      label: "Problems Solved",
      icon: CheckCircle2,
      tint: "bg-[var(--color-c-emerald)]/15 text-[var(--color-c-emerald)]",
      hover: "hover:border-[var(--color-c-emerald)]/40",
      value: solved.toLocaleString("en-IN"),
      suffix: `/${total.toLocaleString("en-IN")}`,
      hint: "Across all DSA and company sheets",
    },
    {
      label: "Completion",
      icon: PieChart,
      tint: "bg-[var(--color-c-blue-2)]/15 text-[var(--color-c-blue-2)]",
      hover: "hover:border-[var(--color-c-blue-2)]/40",
      // One decimal under 10% so early progress isn't shown as a flat 0%.
      value: `${pct > 0 && pct < 10 ? pct.toFixed(1) : Math.round(pct)}%`,
    },
    {
      label: "Current Streak",
      icon: Flame,
      tint: "bg-[var(--color-c-orange)]/15 text-[var(--color-c-orange)]",
      hover: "hover:border-[var(--color-c-orange)]/40",
      value: String(currentStreak),
      suffix: currentStreak === 1 ? " day" : " days",
      hint: "Days in a row with any activity",
    },
    {
      label: "Longest Streak",
      icon: Zap,
      tint: "bg-[var(--color-c-red-2)]/15 text-[var(--color-c-red-2)]",
      hover: "hover:border-[var(--color-c-red-2)]/40",
      value: String(longestStreak),
      suffix: longestStreak === 1 ? " day" : " days",
    },
    {
      label: "Jobs Applied",
      icon: Briefcase,
      tint: "bg-[var(--color-c-violet-2)]/15 text-[var(--color-c-violet-3)]",
      hover: "hover:border-[var(--color-c-violet-2)]/40",
      value: String(jobsApplied),
      hint: "Done tasks tagged Applied on your Task Board",
      wide: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
      {metrics.map(({ label, icon: Icon, tint, hover, value, suffix, hint, wide }) => (
        <div
          key={label}
          title={hint}
          className={`flex flex-col justify-between rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-4 shadow-sm transition-all ${hover} ${
            wide ? "col-span-2 md:col-span-1" : ""
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tint}`}>
              <Icon className="h-[15px] w-[15px]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-[var(--color-c-muted)]">{label}</span>
          </div>
          <div className="text-[19px] font-bold tracking-tight text-[var(--color-c-text)]">
            {value}
            {suffix && <span className="ml-0.5 text-sm font-normal text-[var(--color-c-muted)]">{suffix}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
