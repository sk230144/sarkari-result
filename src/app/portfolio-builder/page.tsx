import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PortfolioHero } from "@/components/portfolio/hero";
import { CoreEngine } from "@/components/portfolio/core-engine";
import { LivePreview } from "@/components/portfolio/live-preview";
import { PortfolioHowItWorks } from "@/components/portfolio/how-it-works";
import { PortfolioFaq } from "@/components/portfolio/faq";
import { MoreTools } from "@/components/portfolio/more-tools";

export const metadata: Metadata = {
  title: "Portfolio Builder — Job Alert 24",
  description:
    "Upload your resume PDF. Our AI extracts skills, experience and projects, and deploys your developer portfolio in 60 seconds. Free forever.",
};

export default function PortfolioBuilderPage() {
  return (
    <DashboardShell canvas="obsidian">
      <div className="relative">
        {/* Faint grid backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative">
          <PortfolioHero />
          <CoreEngine />
          <LivePreview />
          <PortfolioHowItWorks />
          <PortfolioFaq />
          <MoreTools />
        </div>
      </div>
    </DashboardShell>
  );
}
