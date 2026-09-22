import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import {
  PATTERN_SECTIONS,
  PATTERN_TOTAL,
} from "@/components/striver/patterns-data";

export const metadata: Metadata = {
  title: "20 Essential DSA Patterns — Job Alert 24",
  description:
    "The 20 core coding patterns behind most interview problems. 180 hand-picked problems grouped by pattern, each with a difficulty tag and a direct LeetCode link.",
};

export default function DsaPatternsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "20 Essential DSA Patterns",
          kicker: `BY DEVSUNITE · ${PATTERN_TOTAL} PROBLEMS`,
          blurb:
            "The 20 core coding patterns behind most interview problems. Master these and recognize the shape of any new question.",
          sections: PATTERN_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/studyplan/top-interview-150/",
          storageKey: "dsa-patterns",
        }}
      />
    </DashboardShell>
  );
}
