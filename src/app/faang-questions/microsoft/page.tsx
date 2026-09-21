import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { MICROSOFT_SECTIONS, MICROSOFT_TOTAL } from "@/components/faang/microsoft-data";

export const metadata: Metadata = {
  title: "Microsoft Interview Questions — Job Alert 24",
  description:
    "42 real coding interview questions recently asked at Microsoft, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function MicrosoftQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Microsoft Interview Questions",
          kicker: `FAANG · ${MICROSOFT_SECTIONS.length} ${MICROSOFT_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${MICROSOFT_TOTAL} real coding interview questions recently asked at Microsoft, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: MICROSOFT_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/microsoft/",
          storageKey: "faang-microsoft",
        }}
      />
    </DashboardShell>
  );
}
