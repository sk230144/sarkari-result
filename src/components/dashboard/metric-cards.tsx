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
    tint: "bg-[#10b981]/15 text-[#10b981]",
    hover: "hover:border-[#10b981]/40",
    value: "6",
    suffix: "/1943",
  },
  {
    label: "Completion",
    icon: PieChart,
    tint: "bg-[#3b82f6]/15 text-[#3b82f6]",
    hover: "hover:border-[#3b82f6]/40",
    value: "0%",
  },
  {
    label: "Current Streak",
    icon: Flame,
    tint: "bg-[#f97316]/15 text-[#f97316]",
    hover: "hover:border-[#f97316]/40",
    value: "2",
    suffix: " days",
  },
  {
    label: "Longest Streak",
    icon: Zap,
    tint: "bg-[#ef4444]/15 text-[#ef4444]",
    hover: "hover:border-[#ef4444]/40",
    value: "2",
    suffix: " days",
  },
  {
    label: "Jobs Applied",
    icon: Briefcase,
    tint: "bg-[#a855f7]/15 text-[#c084fc]",
    hover: "hover:border-[#a855f7]/40",
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
          className={`flex flex-col justify-between rounded-xl border border-[#1e2920] bg-[#121914] p-4 shadow-sm transition-all ${hover} ${
            wide ? "col-span-2 md:col-span-1" : ""
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tint}`}
            >
              <Icon className="h-[15px] w-[15px]" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-[#8c9c90]">
              {label}
            </span>
          </div>
          <div className="text-[19px] font-bold tracking-tight text-white">
            {value}
            {suffix && (
              <span className="ml-0.5 text-sm font-normal text-[#8c9c90]">
                {suffix}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
