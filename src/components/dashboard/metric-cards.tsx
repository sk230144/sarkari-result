import { CheckCircle2, PieChart, Flame, Zap, Briefcase } from "lucide-react";

type Metric = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  hover: string;
  value: string;
  suffix?: string;
  wide?: boolean;
};

const METRICS: Metric[] = [
  {
    label: "Problems Solved",
    icon: CheckCircle2,
    tint: "bg-[var(--color-c-emerald)]/15 text-[var(--color-c-emerald)]",
    hover: "hover:border-[var(--color-c-emerald)]/40",
    value: "6",
    suffix: "/1943",
  },
  {
    label: "Completion",
    icon: PieChart,
    tint: "bg-[var(--color-c-blue-2)]/15 text-[var(--color-c-blue-2)]",
    hover: "hover:border-[var(--color-c-blue-2)]/40",
    value: "0%",
  },
  {
    label: "Current Streak",
    icon: Flame,
    tint: "bg-[var(--color-c-orange)]/15 text-[var(--color-c-orange)]",
    hover: "hover:border-[var(--color-c-orange)]/40",
    value: "2",
    suffix: " days",
  },
  {
    label: "Longest Streak",
    icon: Zap,
    tint: "bg-[var(--color-c-red-2)]/15 text-[var(--color-c-red-2)]",
    hover: "hover:border-[var(--color-c-red-2)]/40",
    value: "2",
    suffix: " days",
  },
  {
    label: "Jobs Applied",
    icon: Briefcase,
    tint: "bg-[var(--color-c-violet-2)]/15 text-[var(--color-c-violet-3)]",
    hover: "hover:border-[var(--color-c-violet-2)]/40",
    value: "1",
    wide: true,
  },
];

export function MetricCards() {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
      {METRICS.map(({ label, icon: Icon, tint, hover, value, suffix, wide }) => (
        <div
          key={label}
          className={`flex flex-col justify-between rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-4 shadow-sm transition-all ${hover} ${
            wide ? "col-span-2 md:col-span-1" : ""
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tint}`}
            >
              <Icon className="h-[15px] w-[15px]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-[var(--color-c-muted)]">
              {label}
            </span>
          </div>
          <div className="text-[19px] font-bold tracking-tight text-[var(--color-c-text)]">
            {value}
            {suffix && (
              <span className="ml-0.5 text-sm font-normal text-[var(--color-c-muted)]">
                {suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
