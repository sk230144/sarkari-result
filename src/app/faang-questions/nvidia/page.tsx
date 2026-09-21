import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheetTracker } from "@/components/striver/sheet-tracker";
import { NVIDIA_SECTIONS, NVIDIA_TOTAL } from "@/components/faang/nvidia-data";

export const metadata: Metadata = {
  title: "NVIDIA Interview Questions — Job Alert 24",
  description:
    "29 real coding interview questions recently asked at NVIDIA, grouped by topic with a difficulty tag and a direct LeetCode link for every question.",
};

export default function NvidiaQuestionsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheetTracker
        config={{
          name: "NVIDIA Interview Questions",
          kicker: `FAANG · ${NVIDIA_SECTIONS.length} ${NVIDIA_SECTIONS.length === 1 ? "Topic" : "Topics"}`,
          blurb: `${NVIDIA_TOTAL} real coding interview questions recently asked at NVIDIA, grouped by topic with a difficulty tag and a direct LeetCode link for every question. Tick them off as you solve them and add your own notes.`,
          sections: NVIDIA_SECTIONS,
          groupLabel: "topic",
          officialUrl: "https://leetcode.com/company/nvidia/",
          storageKey: "faang-nvidia",
        }}
      />
    </DashboardShell>
  );
}
