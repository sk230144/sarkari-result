import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { MyPosts } from "@/components/blog/my-posts";

export const metadata: Metadata = pageMetadata("/blog/mine", { title: "My posts — Job Alert 24 Blog", robots: { index: false } });

export default function MyPostsPage() {
  return (
    <DashboardShell canvas="obsidian" backTo="/blog">
      <Suspense>
        <MyPosts />
      </Suspense>
    </DashboardShell>
  );
}
