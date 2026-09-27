import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BlogEditor } from "@/components/blog/editor/blog-editor";

export const metadata: Metadata = { title: "Edit post — Job Alert 24 Blog", robots: { index: false } };

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardShell canvas="obsidian" backTo="/blog/mine">
      <BlogEditor key={id} id={id} />
    </DashboardShell>
  );
}
