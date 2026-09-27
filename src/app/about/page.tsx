import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "About Us — Job Alert 24",
  description: "Job Alert 24 helps developers find jobs and get hired faster.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="About Us"
      intro="Job Alert 24 helps developers find the right jobs and get ready for them, all in one place."
    >
      <h2>What we do</h2>
      <p>
        Job hunting means juggling job boards, tailoring resumes, writing cover letters and preparing for interviews.
        We bring all of it together:
      </p>
      <ul>
        <li>
          <Link href="/jobs">Fresh job listings</Link> across every tech role.
        </li>
        <li>An AI resume analyser that shows how well you match a job.</li>
        <li>AI cover letters and mock interviews with feedback.</li>
        <li>
          <Link href="/resources">Free learning resources</Link>: DSA sheets, patterns, FAANG questions and system design.
        </li>
        <li>A public developer profile you can share with recruiters.</li>
      </ul>

      <h2>Get in touch</h2>
      <p>
        Questions, feedback or ideas? <Link href="/contact">Contact us</Link>.
      </p>
    </InfoPage>
  );
}
