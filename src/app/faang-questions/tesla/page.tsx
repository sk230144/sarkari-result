import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { TESLA_SECTIONS, TESLA_TOTAL } from "@/components/faang/tesla-data";

export const metadata: Metadata = {
  title: "Tesla Interview Questions — Job Alert 24",
  description:
    "37 real coding interview questions recently asked at Tesla, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function TeslaQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Tesla Interview Questions",
          kicker: `FAANG · ${TESLA_SECTIONS.length} ${TESLA_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${TESLA_TOTAL} real coding interview questions recently asked at Tesla, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: TESLA_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/tesla/",
          storageKey: "faang-tesla",
        }}
      />
    </DashboardShell>
  );
}
