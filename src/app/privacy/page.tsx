import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Job Alert 24",
  description: "How Job Alert 24 collects, uses and protects your information.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This policy explains what information Job Alert 24 collects when you use the site, why we collect it, and the choices you have."
      updated="27 September 2026"
    >
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details:</strong> your name and email address when you sign up or sign in.
        </li>
        <li>
          <strong>Profile and resume:</strong> the resume you upload and the profile details you add, such as skills,
          experience, projects and notice period.
        </li>
        <li>
          <strong>Your activity:</strong> things you create on the site, such as cover letters, resume analyses, mock
          interviews, DSA progress and blog posts.
        </li>
        <li>
          <strong>Usage:</strong> which pages you visit and how long they stay open, so we can see which parts of the
          site are useful. This stays with us and isn&apos;t shared with ad networks.
        </li>
        <li>
          <strong>Payments:</strong> if you buy PRO+, the order amount, status and payment method type. Card and UPI
          details are handled by our payment partner, Cashfree Payments, and never reach our servers.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To run your account and the features you use.</li>
        <li>
          To power the AI tools. Your resume, the job description and your answers are sent to our AI provider (Google
          Gemini) only to produce the result you asked for.
        </li>
        <li>To process payments and keep a record of your invoices.</li>
        <li>To understand how the site is used and improve it.</li>
        <li>To keep the service secure and prevent abuse.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Public profile</h2>
      <p>
        Your public profile and resume are visible to others only when you choose to share them. You can switch this
        off at any time from your profile.
      </p>

      <h2>Cookies</h2>
      <p>We use cookies to keep you signed in and to remember your preferences. We don&apos;t use advertising cookies.</p>

      <h2>Your choices</h2>
      <p>
        You can edit your profile at any time. To get a copy of your data or have your account deleted, email us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the <Link href="/contact">contact page</Link>.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy, we&apos;ll update the date at the top of this page.</p>
    </InfoPage>
  );
}
