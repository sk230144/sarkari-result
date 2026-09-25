import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CoverLetterWorkspace } from "@/components/cover-letter/workspace";
import { Faq } from "@/components/cover-letter/faq";
import { FinalCta, Toolkit } from "@/components/cover-letter/sections";
import { ResumeAnalysisHero } from "@/components/resume-analysis/hero";
import {
  AnalysisComparison,
  AnalysisHowItWorks,
  WhatYouGet,
  WhyTrust,
} from "@/components/resume-analysis/sections";

export const metadata: Metadata = {
  title: "AI ATS Resume Checker — Job Alert 24",
  description:
    "Upload your resume and paste a job description to get an honest ATS match score, the exact skills you're missing, and a plan to close the gap. Free to start.",
};

const FAQS = [
  {
    q: "How does the resume analysis tool work?",
    a: "Upload your resume once and paste the job description. We pull the skills, experience and level out of both, match them skill by skill, and score how well your resume fits that exact role, then build a plan to close the gaps.",
  },
  {
    q: "What is an ATS match score and why does it matter?",
    a: "Most companies filter applications through an applicant tracking system before a person reads them. The match score shows how closely your resume lines up with what the JD asks for, weighted across skills (40%), experience and projects (35%) and seniority fit (25%).",
  },
  {
    q: "What's included in the missing keywords report?",
    a: "Every skill the JD asks for that your resume doesn't show, tagged Required or Preferred so you fix the most important ones first. Matching understands variations, so React.js and ReactJS both count as React, and PostgreSQL counts as SQL.",
  },
  {
    q: "Is the resume analysis tool free?",
    a: "Yes, it's free to start. You get several new analyses every day, and re-opening a report you already ran is always free.",
  },
  {
    q: "Can freshers with limited experience use this?",
    a: "Yes. Projects, internships and coursework on your resume count toward your skills and experience. The report is honest about seniority gaps and suggests projects that help you close them.",
  },
  {
    q: "What resumes and job descriptions does it support?",
    a: "Text-based PDF resumes up to 5 MB, and any job description you can paste. Scanned or image-only PDFs can't be read yet. If you have no JD, pick a target role and we score you against what that role typically needs.",
  },
  {
    q: "How do I actually improve my ATS score?",
    a: "Work through the report: add the required skills you genuinely have to your resume, mirror the job title in your headline, and build the suggested projects for real gaps. Then upload the updated resume and re-run the analysis to confirm the score moved.",
  },
];

export default function ResumeAnalysisPage() {
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
          <ResumeAnalysisHero />
          <CoverLetterWorkspace primary="analysis" />
          <WhyTrust />
          <AnalysisHowItWorks />
          <WhatYouGet />
          <AnalysisComparison />
          <Toolkit current="/resume-analysis" />
          <Faq items={FAQS} />
          <FinalCta
            title="Ready to fix your resume for real?"
            body="Free to start. See your match score and missing skills in under a minute."
            cta="Check My Resume Score"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
