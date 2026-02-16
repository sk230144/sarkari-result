import type { Metadata } from "next";
import { getUser } from "@/lib/actions/auth";
import { ResumeBuilderForm } from "./resume-builder-form";

export const metadata: Metadata = {
  title: "Free Resume Builder - Create & Download PDF Resume Online",
  description:
    "Build a professional one-page resume for free. Download as PDF. Supports form builder and LaTeX code. सरकारी नौकरी के लिए फ्री रिज्यूमे बनाएं।",
};

export default async function ResumeBuilderPage() {
  const user = await getUser();

  return (
    <ResumeBuilderForm
      defaultName={user?.user_metadata?.full_name || ""}
      defaultEmail={user?.email || ""}
    />
  );
}
