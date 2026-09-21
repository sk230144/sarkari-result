import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { UBER_SECTIONS, UBER_TOTAL } from "@/components/faang/uber-data";

export const metadata: Metadata = {
  title: "Uber Interview Questions — Job Alert 24",
  description:
    "20 real coding interview questions recently asked at Uber, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function UberQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Uber Interview Questions",
          kicker: `FAANG · ${UBER_SECTIONS.length} ${UBER_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${UBER_TOTAL} real coding interview questions recently asked at Uber, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: UBER_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/uber/",
          storageKey: "faang-uber",
        }}
      />
    </DashboardShell>
  );
}
