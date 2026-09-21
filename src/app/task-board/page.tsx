import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TaskBoard } from "@/components/dashboard/task-board";

export const metadata: Metadata = {
  title: "Task Board — Job Alert 24",
  description:
    "Plan your job search day by day. Track resume edits, cover letters, mock interviews, DSA problems and recruiter follow ups on one board.",
};

export default function TaskBoardPage() {
  return (
    <DashboardShell canvas="obsidian">
      <TaskBoard />
    </DashboardShell>
  );
}
