import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome — Job Alert 24",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only same-site paths, so the link can't be used to bounce users elsewhere.
  const safeNext = next && /^\/(?!\/)[\w\-/#?=&]*$/.test(next) && next !== "/onboarding" ? next : "/resources";
  return <OnboardingFlow next={safeNext} />;
}
