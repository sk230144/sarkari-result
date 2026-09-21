import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { LINKEDIN_SECTIONS, LINKEDIN_TOTAL } from "@/components/faang/linkedin-data";

export const metadata: Metadata = {
  title: "LinkedIn Interview Questions — Job Alert 24",
  description:
    "32 real coding interview questions recently asked at LinkedIn, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function LinkedinQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "LinkedIn Interview Questions",
          kicker: `FAANG · ${LINKEDIN_SECTIONS.length} ${LINKEDIN_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${LINKEDIN_TOTAL} real coding interview questions recently asked at LinkedIn, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: LINKEDIN_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/linkedin/",
          storageKey: "faang-linkedin",
        }}
      />
    </DashboardShell>
  );
}
