import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { OPENAI_SECTIONS, OPENAI_TOTAL } from "@/components/faang/openai-data";

export const metadata: Metadata = {
  title: "OpenAI Interview Questions — Job Alert 24",
  description:
    "15 real coding interview questions recently asked at OpenAI, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function OpenaiQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "OpenAI Interview Questions",
          kicker: `FAANG · ${OPENAI_SECTIONS.length} ${OPENAI_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${OPENAI_TOTAL} real coding interview questions recently asked at OpenAI, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: OPENAI_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/openai/",
          storageKey: "faang-openai",
        }}
      />
    </DashboardShell>
  );
}
