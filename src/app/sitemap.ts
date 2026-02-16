import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL, CATEGORIES } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, updated_at, post_date, category")
    .eq("is_published", true)
    .order("post_date", { ascending: false })
    .limit(5000);

  const jobEntries: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
    url: `${SITE_URL}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at || job.post_date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category filter pages
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/jobs?category=${cat.value}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/tools/image`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tools/image-to-pdf`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tools/resume-builder`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/membership`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  return [...staticPages, ...categoryEntries, ...jobEntries];
}
