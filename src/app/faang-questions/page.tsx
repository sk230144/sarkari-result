import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FaangQuestions } from "@/components/dashboard/faang-questions";

export const metadata: Metadata = {
  title: "FAANG Interview Questions — Job Alert 24",
  description:
    "Real, recently reported coding interview questions from Meta, Google, Amazon, Microsoft, Apple and more — each with a difficulty tag and a direct LeetCode link.",
};

export default function FaangQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <FaangQuestions />
    </DashboardShell>
  );
}
