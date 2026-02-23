import { createClient } from "@supabase/supabase-js";
import {
  scrapeSSC,
  scrapeUPSC,
  scrapeIBPS,
  scrapeRailway,
  type ScrapedJob,
} from "./scrapers/ssc-scraper";

// Use service role key for server-side inserts (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-\(\)\.,\/&:]/g, "")
    .trim()
    .substring(0, 250);
}

function isValidJob(job: ScrapedJob): boolean {
  if (!job.title || job.title.length < 5) return false;
  // Filter out navigation links, headers, empty rows
  const skip = ["home", "about us", "contact", "sitemap", "login", "register", "click here", "read more", "view more", "download"];
  const lower = job.title.toLowerCase();
  if (skip.some((s) => lower === s)) return false;
  if (job.title.length > 250) return false;
  return true;
}

async function isDuplicate(title: string): Promise<boolean> {
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .ilike("title", `%${title.substring(0, 50)}%`)
    .limit(1);
  return !!(data && data.length > 0);
}

async function insertJob(job: ScrapedJob): Promise<boolean> {
  const title = cleanTitle(job.title);

  if (!isValidJob({ ...job, title })) return false;

  const dup = await isDuplicate(title);
  if (dup) {
    console.log(`[SKIP] Duplicate: ${title.substring(0, 60)}`);
    return false;
  }

  const { error } = await supabase.from("jobs").insert({
    title,
    organization: job.organization,
    category: job.category,
    notification_url: job.notification_url,
    apply_url: job.apply_url,
    post_date: job.post_date,
    last_date: job.last_date,
    short_description: job.short_description,
    tags: job.tags,
    is_published: true,
    is_featured: false,
    state: null,
    qualification: null,
    fee: null,
    age_limit: null,
    total_posts: null,
    created_by: null,
  });

  if (error) {
    console.error(`[ERROR] Insert failed for: ${title.substring(0, 60)}`, error.message);
    return false;
  }

  console.log(`[OK] Inserted: ${title.substring(0, 60)}`);
  return true;
}

export async function runScraper(): Promise<{
  total: number;
  inserted: number;
  skipped: number;
  sources: Record<string, number>;
}> {
  console.log("[Scraper] Starting job scraping...");

  const results = {
    total: 0,
    inserted: 0,
    skipped: 0,
    sources: {} as Record<string, number>,
  };

  // Run all scrapers in parallel
  const [sscJobs, upscJobs, ibpsJobs, railwayJobs] = await Promise.allSettled([
    scrapeSSC(),
    scrapeUPSC(),
    scrapeIBPS(),
    scrapeRailway(),
  ]);

  const allJobs: ScrapedJob[] = [
    ...(sscJobs.status === "fulfilled" ? sscJobs.value : []),
    ...(upscJobs.status === "fulfilled" ? upscJobs.value : []),
    ...(ibpsJobs.status === "fulfilled" ? ibpsJobs.value : []),
    ...(railwayJobs.status === "fulfilled" ? railwayJobs.value : []),
  ];

  console.log(`[Scraper] Total scraped: ${allJobs.length}`);
  results.total = allJobs.length;

  // Insert jobs one by one (avoid rate limits)
  for (const job of allJobs) {
    const inserted = await insertJob(job);
    if (inserted) {
      results.inserted++;
      results.sources[job.source] = (results.sources[job.source] || 0) + 1;
    } else {
      results.skipped++;
    }

    // Small delay to avoid overwhelming Supabase
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`[Scraper] Done. Inserted: ${results.inserted}, Skipped: ${results.skipped}`);
  return results;
}
