import type { Metadata } from "next";
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
  title: "Job Alert 24 - One place for your entire job search",
  description:
    "See exactly what's failing in your resume, apply in one click, and walk into every interview prepared.",
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
