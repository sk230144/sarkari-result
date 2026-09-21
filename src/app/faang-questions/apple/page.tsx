import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { APPLE_SECTIONS, APPLE_TOTAL } from "@/components/faang/apple-data";

export const metadata: Metadata = {
  title: "Apple Interview Questions — Job Alert 24",
  description:
    "41 real coding interview questions recently asked at Apple, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function AppleQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Apple Interview Questions",
          kicker: `FAANG · ${APPLE_SECTIONS.length} ${APPLE_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${APPLE_TOTAL} real coding interview questions recently asked at Apple, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: APPLE_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/apple/",
          storageKey: "faang-apple",
        }}
      />
    </DashboardShell>
  );
}
