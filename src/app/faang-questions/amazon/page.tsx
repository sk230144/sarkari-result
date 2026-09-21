import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { AMAZON_SECTIONS, AMAZON_TOTAL } from "@/components/faang/amazon-data";

export const metadata: Metadata = {
  title: "Amazon Interview Questions — Job Alert 24",
  description:
    "58 real coding interview questions recently asked at Amazon, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function AmazonQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Amazon Interview Questions",
          kicker: `FAANG · ${AMAZON_SECTIONS.length} Topics`,
          blurb: `${AMAZON_TOTAL} real coding interview questions recently asked at Amazon, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: AMAZON_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/amazon/",
          storageKey: "faang-amazon",
        }}
      />
    </DashboardShell>
  );
}
