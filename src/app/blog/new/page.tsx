import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BlogEditor } from "@/components/blog/editor/blog-editor";

export const metadata: Metadata = { title: "Write a post — Job Alert 24 Blog", robots: { index: false } };

export default function NewBlogPostPage() {
  return (
    <DashboardShell canvas="obsidian" backTo="/blog">
      <BlogEditor />
    </DashboardShell>
  );
}
