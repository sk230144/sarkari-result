import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CopilotDashboard } from "@/components/copilot/copilot-dashboard";

export const metadata: Metadata = {
  title: "AI Copilot Dashboard — Job Alert 24",
  description: "Your AI career workspace: cover letters, resume match reports and daily limits in one place.",
  robots: { index: false, follow: false },
};

export default function AiCopilotPage() {
  return (
    <DashboardShell canvas="obsidian" sidebar={false}>
      <CopilotDashboard />
    </DashboardShell>
  );
}
