import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BlogIndex } from "@/components/blog/blog-index";
import { serviceDb } from "@/lib/server-auth";
import { CARD_COLUMNS, rowToCard } from "@/lib/blog/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Job Alert 24",
  description: "Interview experiences, resume tips, system design and career advice, written by developers for developers.",
};

export default async function BlogPage() {
  const { data } = await serviceDb()
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(500);
  return (
    <DashboardShell canvas="obsidian">
      <Suspense>
        <BlogIndex posts={(data ?? []).map(rowToCard)} />
      </Suspense>
    </DashboardShell>
  );
}
