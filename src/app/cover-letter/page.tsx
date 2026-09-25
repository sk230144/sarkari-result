import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CoverLetterHero } from "@/components/cover-letter/hero";
import { WhyItWorks } from "@/components/cover-letter/why-it-works";
import { CoverLetterHowItWorks } from "@/components/cover-letter/how-it-works";
import { ThreeDrafts } from "@/components/cover-letter/drafts";
import {
  DreamJobBanner,
  Comparison,
  Toolkit,
  WhyItMatters,
  FinalCta,
} from "@/components/cover-letter/sections";
import { CoverLetterFaq } from "@/components/cover-letter/faq";
import { CoverLetterWorkspace } from "@/components/cover-letter/workspace";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator — Job Alert 24",
  description:
    "Upload your resume and paste a job description to generate a personalised, ATS-friendly cover letter in under 30 seconds. Free to start.",
};

export default function CoverLetterPage() {
  return (
    <DashboardShell canvas="obsidian">
      <div className="relative overflow-x-clip">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(163,230,53,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.6) 1px,transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative">
          <CoverLetterHero />
          <CoverLetterWorkspace />
          <WhyItWorks />
          <CoverLetterHowItWorks />
          <ThreeDrafts />
          <DreamJobBanner />
          <Comparison />
          <Toolkit />
          <WhyItMatters />
          <CoverLetterFaq />
          <FinalCta />
        </div>
      </div>
    </DashboardShell>
  );
}
