import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { ANTHROPIC_SECTIONS, ANTHROPIC_TOTAL } from "@/components/faang/anthropic-data";

export const metadata: Metadata = {
  title: "Anthropic Interview Questions — Job Alert 24",
  description:
    "11 real coding interview questions recently asked at Anthropic, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function AnthropicQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Anthropic Interview Questions",
          kicker: `FAANG · ${ANTHROPIC_SECTIONS.length} ${ANTHROPIC_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${ANTHROPIC_TOTAL} real coding interview questions recently asked at Anthropic, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: ANTHROPIC_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/anthropic/",
          storageKey: "faang-anthropic",
        }}
      />
    </DashboardShell>
  );
}
