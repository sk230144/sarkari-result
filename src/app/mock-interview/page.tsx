import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CoverLetterWorkspace } from "@/components/cover-letter/workspace";
import { Faq } from "@/components/cover-letter/faq";
import { FinalCta, Toolkit } from "@/components/cover-letter/sections";
import { MockInterviewHero } from "@/components/mock-interview/hero";
import {
  FirstRepBanner,
  InterviewComparison,
  InterviewHowItWorks,
  InterviewWhatYouGet,
  WhyPracticeMatters,
} from "@/components/mock-interview/sections";

export const metadata: Metadata = {
  title: "AI Mock Interview — Job Alert 24",
  description:
    "Practise technical and HR interview rounds generated from the job description you're targeting and your resume, with a score and feedback on every answer.",
};

const FAQS = [
  {
    q: "How do I start a custom mock interview?",
    a: "Pick the role you're interviewing for, paste the job description (optional but recommended) and choose your resume in the panel above. Questions are then generated for that exact role, stack and seniority.",
  },
  {
    q: "What topics does the technical round cover?",
    a: "Whatever the job description asks for: DSA and problem solving, system design fundamentals for the level, and databases, SQL, OOP or framework-specific questions (React, Node.js, Python…) where the JD calls for them.",
  },
  {
    q: "Is the mock interview simulator free?",
    a: "Yes, it's free to start, with a daily number of practice sessions. Reopening a session you already did is always free.",
  },
  {
    q: "Can I start a mock interview from a job listing instead?",
    a: "Yes. Copy the description from any job on the Jobs board (or any company's careers page) and paste it into the job description box above. The interview is built from it.",
  },
];

export default function MockInterviewPage() {
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
          <MockInterviewHero />
          <CoverLetterWorkspace primary="interview" />
          <InterviewHowItWorks />
          <InterviewWhatYouGet />
          <FirstRepBanner />
          <InterviewComparison />
          <Toolkit current="/mock-interview" />
          <WhyPracticeMatters />
          <Faq items={FAQS} />
          <FinalCta
            title="Ready to practise for real?"
            body="Free to start. Choose your resume and paste a JD to begin your first mock interview."
            cta="Start My Mock Interview"
          />
        </div>
      </div>
    </DashboardShell>
  );
}
