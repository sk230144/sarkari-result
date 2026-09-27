import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION, SOCIAL_IMAGE } from "@/lib/seo";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import {
  ThemeProvider,
  THEME_INIT_SCRIPT,
} from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { PageTracker } from "@/components/analytics/page-tracker";
import { FeedbackButton } from "@/components/feedback/feedback-button";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website", siteName: SITE_NAME, locale: "en_IN",
    title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SOCIAL_IMAGE],
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [SOCIAL_IMAGE] },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body>
        {/*
          Applies the saved theme before first paint, so a returning reader
          never sees the wrong theme flash.

          Deliberately at the top of <body> rather than in an explicit
          <head>: Next.js owns <head> and injects its own tags there, and
          declaring one manually displaced the auto-injected <meta charset>,
          which React then reported as a hydration mismatch.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeProvider>
          <AuthProvider>
            {/* Records page views for the admin view. Renders nothing. */}
            <PageTracker />
            <FeedbackButton />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
