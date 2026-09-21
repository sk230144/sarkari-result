import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { StreakCalendar } from "@/components/dashboard/streak-calendar";
import { ReadinessChecklist } from "@/components/dashboard/readiness-checklist";
import { SkillAnalysis } from "@/components/dashboard/skill-analysis";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";

export const metadata: Metadata = {
  title: "Interview Prep Resources — Job Alert 24",
  description:
    "Free, structured prep material: DSA sheets, coding patterns, and system design questions.",
};

export default function ResourcesPage() {
  return (
    <DashboardShell>
      <div className="flex w-full min-w-0 flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold leading-8 tracking-tight text-white">
            Interview Prep Resources
          </h1>
          <p className="text-[13px] text-[#8c9c90]">
            Free, structured prep material: DSA sheets, coding patterns, and
            system design questions.
          </p>
        </div>

        <MetricCards />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <ActivityChart />
          <StreakCalendar />
        </div>

        <ReadinessChecklist />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <SkillAnalysis />
          <CategoryBreakdown />
        </div>
      </div>
    </DashboardShell>
  );
}
