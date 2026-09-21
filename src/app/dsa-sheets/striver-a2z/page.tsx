import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { DAYS, SHEET_URL, PDF_URL } from "@/components/striver/striver-data";

export const metadata: Metadata = {
  title: "Striver SDE Sheet — Job Alert 24",
  description:
    "All 191 problems from Striver's SDE Sheet across 27 days, with progress tracking, personal notes, direct problem links and a downloadable PDF.",
};

export default function StriverSheetPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Striver SDE Sheet",
          kicker: "DSA Sheet · 27 Days",
          blurb:
            "All 191 problems from Striver's SDE Sheet, organised across 27 days. Tick problems off as you solve them, add your own notes, and jump straight to each problem.",
          sections: DAYS,
          groupLabel: "day",
          officialUrl: SHEET_URL,
          pdfUrl: PDF_URL,
          storageKey: "striver-sde",
        }}
      />
    </DashboardShell>
  );
}
