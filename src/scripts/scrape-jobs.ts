import { createClient } from "@supabase/supabase-js";
import {
  scrapeFreeJobAlert,
  scrapeEmploymentNews,
  scrapeNaukri,
  type ScrapedJob,
} from "./scrapers/ssc-scraper";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function cleanTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim().substring(0, 250);
}

function isValidJob(job: ScrapedJob): boolean {
  if (!job.title || job.title.length < 10) return false;
  const skip = [
    "hello world", "dummy", "test post", "sample", "wordpress",
    "click here", "read more", "view more",
  ];
  const lower = job.title.toLowerCase();
  if (skip.some((s) => lower.includes(s))) return false;
  return true;
}

async function isDuplicate(title: string): Promise<boolean> {
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .ilike("title", `%${title.substring(0, 60)}%`)
    .limit(1);
  return !!(data && data.length > 0);
}

async function insertJob(job: ScrapedJob): Promise<boolean> {
  const title = cleanTitle(job.title);
  if (!isValidJob({ ...job, title })) return false;

  const dup = await isDuplicate(title);
  if (dup) {
    console.log(`[SKIP] Duplicate: ${title.substring(0, 70)}`);
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
    console.error(`[ERROR] ${title.substring(0, 70)}:`, error.message);
    return false;
  }

  console.log(`[OK] Inserted: ${title.substring(0, 70)}`);
  return true;
}

export async function runScraper(): Promise<{
  total: number;
  inserted: number;
  skipped: number;
  sources: Record<string, number>;
}> {
  console.log("[Scraper] Starting...");

  const results = {
    total: 0,
    inserted: 0,
    skipped: 0,
    sources: {} as Record<string, number>,
  };

  const [fjaResult, enResult, naukri] = await Promise.allSettled([
    scrapeFreeJobAlert(),
    scrapeEmploymentNews(),
    scrapeNaukri(),
  ]);

  const allJobs: ScrapedJob[] = [
    ...(fjaResult.status === "fulfilled" ? fjaResult.value : []),
    ...(enResult.status === "fulfilled" ? enResult.value : []),
    ...(naukri.status === "fulfilled" ? naukri.value : []),
  ];

  console.log(`[Scraper] Fetched ${allJobs.length} jobs total`);
  results.total = allJobs.length;

  for (const job of allJobs) {
    const inserted = await insertJob(job);
    if (inserted) {
      results.inserted++;
      results.sources[job.source] = (results.sources[job.source] || 0) + 1;
    } else {
      results.skipped++;
    }
    await new Promise((r) => setTimeout(r, 80));
  }

  console.log(`[Scraper] Done — inserted: ${results.inserted}, skipped: ${results.skipped}`);
  return results;
}
