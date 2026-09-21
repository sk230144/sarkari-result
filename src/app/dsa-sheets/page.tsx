import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DsaSheets } from "@/components/dashboard/dsa-sheets";

export const metadata: Metadata = {
  title: "DSA Sheets — Job Alert 24",
  description:
    "Track Striver's A2Z Sheet, Love Babbar's DSA Sheet, NeetCode 150 and Rohit Negi's Sheet with per-problem progress, LeetCode links and video solutions.",
};

export default function DsaSheetsPage() {
  return (
    <DashboardShell canvas="obsidian">
      <DsaSheets />
    </DashboardShell>
  );
}
