import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { DOORDASH_SECTIONS, DOORDASH_TOTAL } from "@/components/faang/doordash-data";

export const metadata: Metadata = {
  title: "DoorDash Interview Questions — Job Alert 24",
  description:
    "17 real coding interview questions recently asked at DoorDash, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function DoordashQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "DoorDash Interview Questions",
          kicker: `FAANG · ${DOORDASH_SECTIONS.length} ${DOORDASH_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${DOORDASH_TOTAL} real coding interview questions recently asked at DoorDash, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: DOORDASH_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/doordash/",
          storageKey: "faang-doordash",
        }}
      />
    </DashboardShell>
  );
}
