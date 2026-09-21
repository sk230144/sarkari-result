import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { PALANTIR_SECTIONS, PALANTIR_TOTAL } from "@/components/faang/palantir-data";

export const metadata: Metadata = {
  title: "Palantir Interview Questions — Job Alert 24",
  description:
    "20 real coding interview questions recently asked at Palantir, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function PalantirQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Palantir Interview Questions",
          kicker: `FAANG · ${PALANTIR_SECTIONS.length} ${PALANTIR_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${PALANTIR_TOTAL} real coding interview questions recently asked at Palantir, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: PALANTIR_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/palantir/",
          storageKey: "faang-palantir",
        }}
      />
    </DashboardShell>
  );
}
