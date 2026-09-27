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
import { pageMetadata, jsonLd, SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = pageMetadata("/", { title: SITE_TITLE, description: SITE_DESCRIPTION });

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, alternateName: ["Job Alerts 24", "jobalerts24.com"], url: SITE_URL, description: SITE_DESCRIPTION, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
        ],
      }) }} />
      <Navbar />
      <main className="w-full overflow-x-clip pt-20">
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
