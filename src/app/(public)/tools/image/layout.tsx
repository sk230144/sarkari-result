import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Tools - Resize, Crop, Compress & Convert Photos Online",
  description:
    "Free online image tools. Resize passport photos, crop images, compress for government job applications. Supports JPG, PNG, WebP. सरकारी नौकरी फोटो बनाएं।",
};

export default function ImageToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
