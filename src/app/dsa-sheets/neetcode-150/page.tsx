import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import {
  NEETCODE_SECTIONS,
  NEETCODE_SHEET_URL,
  NEETCODE_TOTAL,
} from "@/components/striver/neetcode-data";

export const metadata: Metadata = {
  title: "NeetCode 150 DSA Sheet — Job Alert 24",
  description:
    "All 150 NeetCode problems across 18 patterns, each with a LeetCode link, difficulty and NeetCode's video solution, plus progress tracking and personal notes.",
};

export default function NeetCode150Page() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "NeetCode 150",
          kicker: `Pattern Sprint · ${NEETCODE_SECTIONS.length} Patterns`,
          blurb: `All ${NEETCODE_TOTAL} problems from NeetCode 150, grouped by pattern in NeetCode's order, each with a practice link, difficulty and a video walkthrough. Tick problems off as you solve them and add your own notes.`,
          sections: NEETCODE_SECTIONS,
          groupLabel: "topic",
          officialUrl: NEETCODE_SHEET_URL,
          storageKey: "neetcode-150",
        }}
      />
    </DashboardShell>
  );
}
