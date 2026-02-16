import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to PDF Converter - Convert Photos to PDF Online Free",
  description:
    "Convert multiple images to a single PDF file for free. Perfect for government job applications. Supports JPG, PNG, WebP. इमेज को पीडीएफ में बदलें।",
};

export default function ImageToPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
