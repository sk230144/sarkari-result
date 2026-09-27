import type { Metadata } from "next";

// Keep search and sharing URLs on the production domain, including preview builds.
export const SITE_URL = "https://jobalerts24.com";
export const SITE_NAME = "Job Alert 24";
export const SITE_TITLE = "Job Alert 24 | Tech Jobs, Resume Tools & Interview Prep";
export const SITE_DESCRIPTION =
  "Find tech jobs in India and remote roles with Job Alert 24. Improve your resume, practice mock interviews, and prepare with DSA sheets and AI career tools.";
export const SOCIAL_IMAGE = {
  url: `${SITE_URL}/social-image.png`,
  width: 1200,
  height: 630,
  alt: "Job Alert 24 — Tech jobs, stronger resumes, better interview preparation",
  type: "image/png",
};

export function pageMetadata(path: string, metadata: Metadata): Metadata {
  const title = typeof metadata.title === "string" ? metadata.title : SITE_TITLE;
  const description = metadata.description || SITE_DESCRIPTION;
  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: `${SITE_URL}${path}` },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: SITE_NAME,
      url: `${SITE_URL}${path}`,
      title,
      description,
      images: [SOCIAL_IMAGE],
      ...metadata.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
      ...metadata.twitter,
    },
  };
}

// Escaping '<' prevents user-authored article text from ending a script tag.
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
