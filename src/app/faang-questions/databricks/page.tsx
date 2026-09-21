import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { DATABRICKS_SECTIONS, DATABRICKS_TOTAL } from "@/components/faang/databricks-data";

export const metadata: Metadata = {
  title: "Databricks Interview Questions — Job Alert 24",
  description:
    "27 real coding interview questions recently asked at Databricks, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function DatabricksQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "Databricks Interview Questions",
          kicker: `FAANG · ${DATABRICKS_SECTIONS.length} ${DATABRICKS_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${DATABRICKS_TOTAL} real coding interview questions recently asked at Databricks, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: DATABRICKS_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/databricks/",
          storageKey: "faang-databricks",
        }}
      />
    </DashboardShell>
  );
}
