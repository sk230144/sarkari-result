import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { GOOGLE_SECTIONS, GOOGLE_TOTAL } from "@/components/faang/google-data";

export const metadata: Metadata = {
  title: "Google Interview Questions — Job Alert 24",
  description:
    "59 real coding interview questions recently asked at Google, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function GoogleQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Google Interview Questions",
          kicker: `FAANG · ${GOOGLE_SECTIONS.length} Topics`,
          blurb: `${GOOGLE_TOTAL} real coding interview questions recently asked at Google, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: GOOGLE_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/google/",
          storageKey: "faang-google",
        }}
      />
    </DashboardShell>
  );
}
