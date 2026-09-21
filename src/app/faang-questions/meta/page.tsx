import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { META_SECTIONS, META_TOTAL } from "@/components/faang/meta-data";

export const metadata: Metadata = {
  title: "Meta Interview Questions — Job Alert 24",
  description:
    "69 real coding interview questions recently asked at Meta, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function MetaQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Meta Interview Questions",
          kicker: `FAANG · ${META_SECTIONS.length} Topics`,
          blurb: `${META_TOTAL} real coding interview questions recently asked at Meta, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: META_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/facebook/",
          storageKey: "faang-meta",
        }}
      />
    </DashboardShell>
  );
}
