import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Pricing } from "@/components/premium/pricing";

export const metadata: Metadata = pageMetadata("/pricing", {
  title: "PRO+ Plans — Job Alert 24",
  description: "Upgrade to PRO+ for the full AI job-search toolkit: unlimited resume match scores, cover letters and mock interviews.",
});

export default function PricingPage() {
  return (
    <DashboardShell canvas="obsidian" backTo="/">
      <Suspense>
        <Pricing />
      </Suspense>
    </DashboardShell>
  );
}
