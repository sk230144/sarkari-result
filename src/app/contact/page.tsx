import type { Metadata } from "next";
import { CONTACT_EMAIL, InfoPage } from "@/components/info/info-page";
import { ContactForm } from "@/components/info/contact-form";
import { TOPICS, type Topic } from "@/components/info/topics";

export const metadata: Metadata = {
  title: "Contact — Job Alert 24",
  description: "Get in touch with the Job Alert 24 team.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const initial: Topic = TOPICS.some(([k]) => k === topic) ? (topic as Topic) : "general";
  return (
    <InfoPage eyebrow="Contact" title="Contact us" intro="Questions, feedback or hiring enquiries? Send us a message and we'll get back to you.">
      <ContactForm to={CONTACT_EMAIL} initialTopic={initial} />
      <p className="text-sm">
        Or email us directly at <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </InfoPage>
  );
}
