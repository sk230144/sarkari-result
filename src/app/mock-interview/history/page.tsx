import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InterviewInsights } from "@/components/mock-interview/insights/insights-page";

export const metadata: Metadata = {
  title: "Mock Interview History — Job Alert 24",
  description: "Your mock interview scores, strengths, weak points and progress over time.",
  robots: { index: false, follow: false },
};

export default function MockInterviewHistoryPage() {
  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/mock-interview">
      <InterviewInsights />
    </DashboardShell>
  );
}
