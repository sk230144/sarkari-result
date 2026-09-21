import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import {
  BABBAR_SECTIONS,
  BABBAR_SHEET_URL,
  BABBAR_TRACKER_URL,
  BABBAR_TOTAL,
} from "@/components/striver/babbar-data";

export const metadata: Metadata = {
  title: "Love Babbar DSA Sheet — Job Alert 24",
  description:
    "All 445 questions from Love Babbar's DSA Cracker Sheet across 15 topics, each with an article and a practice link, plus progress tracking and personal notes.",
};

export default function LoveBabbarSheetPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Love Babbar DSA Sheet",
          kicker: `DSA Cracker · ${BABBAR_SECTIONS.length} Topics`,
          blurb: `All ${BABBAR_TOTAL} questions from Love Babbar's DSA Cracker Sheet, grouped by topic with an article and a practice link for each. Tick problems off as you solve them and add your own notes.`,
          sections: BABBAR_SECTIONS,
          groupLabel: "topic",
          officialUrl: BABBAR_SHEET_URL,
          trackerUrl: BABBAR_TRACKER_URL,
          storageKey: "babbar-450",
        }}
      />
    </DashboardShell>
  );
}
