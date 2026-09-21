import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SystemDesign } from "@/components/dashboard/system-design";

export const metadata: Metadata = {
  title: "System Design Sheet — Job Alert 24",
  description:
    "23 hand-picked high-level and low-level system design interview questions, each with a description, expected key points, and the concepts it teaches.",
};

export default function SystemDesignPage() {
  return (
    <DashboardShell canvas="obsidian">
      <SystemDesign />
    </DashboardShell>
  );
}
