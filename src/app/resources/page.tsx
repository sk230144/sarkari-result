import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProgressView } from "@/components/dashboard/progress-view";

export const metadata: Metadata = {
  title: "Your Progress — Job Alert 24",
  description:
    "Your interview prep at a glance: problems solved, streaks, activity, job-readiness checklist and skill breakdown.",
  robots: { index: false, follow: false },
};

export default function ProgressPage() {
  return (
    <DashboardShell>
      <div className="flex w-full min-w-0 flex-col gap-8 px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold leading-8 tracking-tight text-[var(--color-c-text)]">Your Progress</h1>
          <p className="text-[13px] text-[var(--color-c-muted)]">
            Everything you&apos;ve done across DSA sheets, system design, your task board and the AI tools, in one
            place. It updates as you work.
          </p>
        </div>
        <ProgressView />
      </div>
    </DashboardShell>
  );
}
