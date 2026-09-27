import type { MetadataRoute } from "next";
import { serviceDb } from "@/lib/server-auth";
import { SITE_URL } from "@/lib/seo";
import { SLUG_RE } from "@/lib/blog/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const db = serviceDb();
  // Read every published post, including collections beyond Supabase's row cap.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.from("blog_posts")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("id")
      .range(offset, offset + 999);
    // Do not turn a database outage into a successful, empty sitemap.
    if (error) throw new Error("Published article sitemap is temporarily unavailable.");
    for (const post of data ?? []) {
      if (SLUG_RE.test(post.slug)) {
        entries.push({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: post.updated_at });
      }
    }
    if (!data || data.length < 1000) break;
  }
  return entries;
}
