import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { NETFLIX_SECTIONS, NETFLIX_TOTAL } from "@/components/faang/netflix-data";

export const metadata: Metadata = {
  title: "Netflix Interview Questions — Job Alert 24",
  description:
    "30 real coding interview questions recently asked at Netflix, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function NetflixQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Netflix Interview Questions",
          kicker: `FAANG · ${NETFLIX_SECTIONS.length} ${NETFLIX_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${NETFLIX_TOTAL} real coding interview questions recently asked at Netflix, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: NETFLIX_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/netflix/",
          storageKey: "faang-netflix",
        }}
      />
    </DashboardShell>
  );
}
