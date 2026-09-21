import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { BYTEDANCE_SECTIONS, BYTEDANCE_TOTAL } from "@/components/faang/bytedance-data";

export const metadata: Metadata = {
  title: "ByteDance Interview Questions — Job Alert 24",
  description:
    "33 real coding interview questions recently asked at ByteDance, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function BytedanceQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "ByteDance Interview Questions",
          kicker: `FAANG · ${BYTEDANCE_SECTIONS.length} ${BYTEDANCE_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${BYTEDANCE_TOTAL} real coding interview questions recently asked at ByteDance, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: BYTEDANCE_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/bytedance/",
          storageKey: "faang-bytedance",
        }}
      />
    </DashboardShell>
  );
}
