import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | सरकारी रिजल्ट 2025 - Latest Govt Jobs, Results, Admit Cards`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_DESCRIPTION} सरकारी नौकरी, सरकारी रिजल्ट, एडमिट कार्ड, आंसर की, सिलेबस - सभी अपडेट एक जगह।`,
  keywords: [
    "sarkari result",
    "sarkari result 2025",
    "sarkari naukri",
    "government jobs",
    "govt jobs 2025",
    "sarkari job",
    "latest govt jobs",
    "admit card",
    "answer key",
    "sarkari exam result",
    "online form",
    "free job alert",
    "railway jobs",
    "SSC jobs",
    "UPSC jobs",
    "bank jobs",
    "state government jobs",
    "central government jobs",
    "सरकारी नौकरी",
    "सरकारी रिजल्ट",
    "एडमिट कार्ड",
    "आंसर की",
    "scholarship",
    "rojgar samachar",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    alternateLocale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | सरकारी रिजल्ट - Latest Govt Jobs, Results & Admit Cards`,
    description: `${SITE_DESCRIPTION} सरकारी नौकरी, रिजल्ट, एडमिट कार्ड, आंसर की - रोज़ अपडेट।`,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - सरकारी नौकरी पोर्टल`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Latest Govt Jobs & Sarkari Result`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "Government Jobs",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} antialiased font-sans`} suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
