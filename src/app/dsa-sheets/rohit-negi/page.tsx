import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import {
  NEGI_SECTIONS,
  NEGI_SHEET_URL,
  NEGI_TOTAL,
} from "@/components/striver/negi-data";

export const metadata: Metadata = {
  title: "Rohit Negi DSA Sheet — Job Alert 24",
  description:
    "All 725 problems from Rohit Negi's Coder Army DSA Sheet across 17 topics, each with a difficulty tag and a direct problem link, plus progress tracking and notes.",
};

export default function RohitNegiSheetPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Rohit Negi DSA Sheet",
          kicker: `Coder Army · ${NEGI_SECTIONS.length} Topics`,
          blurb: `All ${NEGI_TOTAL} problems from Rohit Negi's Coder Army sheet, grouped by topic with a difficulty tag and a direct link for every question. Tick problems off as you solve them and add your own notes.`,
          sections: NEGI_SECTIONS,
          groupLabel: "topic",
          officialUrl: NEGI_SHEET_URL,
          storageKey: "negi-725",
        }}
      />
    </DashboardShell>
  );
}
