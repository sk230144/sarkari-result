import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { AIRBNB_SECTIONS, AIRBNB_TOTAL } from "@/components/faang/airbnb-data";

export const metadata: Metadata = {
  title: "Airbnb Interview Questions — Job Alert 24",
  description:
    "19 real coding interview questions recently asked at Airbnb, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function AirbnbQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Airbnb Interview Questions",
          kicker: `FAANG · ${AIRBNB_SECTIONS.length} ${AIRBNB_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${AIRBNB_TOTAL} real coding interview questions recently asked at Airbnb, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: AIRBNB_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/airbnb/",
          storageKey: "faang-airbnb",
        }}
      />
    </DashboardShell>
  );
}
