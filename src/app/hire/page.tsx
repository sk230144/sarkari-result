import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/info/info-page";

export const metadata: Metadata = pageMetadata("/hire", {
  title: "Hire with us — Job Alert 24",
  description: "Reach developers who are actively looking for their next role.",
});

export default function HirePage() {
  return (
    <InfoPage
      eyebrow="Company"
      title="Hire with us"
      intro="Reach developers who are actively looking for their next role."
    >
      <h2>Why Job Alert 24</h2>
      <ul>
        <li>Developers here are actively job hunting.</li>
        <li>Candidates keep up-to-date profiles with skills, projects, resume and notice period.</li>
        <li>Openings are shown across frontend, backend, full stack, data, DevOps and mobile roles.</li>
      </ul>

      <h2>Post a job</h2>
      <p>
        Want to list an opening or talk about hiring? Send us the role details through the{" "}
        <Link href="/contact?topic=hiring">contact page</Link> and we&apos;ll get back to you.
      </p>
    </InfoPage>
  );
}
