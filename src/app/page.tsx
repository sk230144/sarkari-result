import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { StatsDeck } from "@/components/landing/stats-deck";
import { SocialProof } from "@/components/landing/social-proof";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { BottomCta } from "@/components/landing/bottom-cta";
import { SiteFooter } from "@/components/landing/site-footer";
import { BackToTop } from "@/components/landing/back-to-top";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="w-full pt-20">
        <Hero />
        <StatsDeck />
        <SocialProof />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <BottomCta />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
