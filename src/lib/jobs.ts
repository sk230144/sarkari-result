import "server-only";
import { createClient } from "@supabase/supabase-js";
import { PAGE_SIZE } from "./jobs-shared";
import type { Job, JobFilters, JobsResult } from "./jobs-shared";

/**
 * Jobs are read on the server with the service-role key, which never
 * reaches the browser (§16). Every export here is server-only — importing
 * this from a client component is a build error, not a silent leak.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function client() {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Reads the normalized jobs table (§5 "Serving": the app queries jobs only).
 *
 * Jobs flagged needs_review are held back from the default feed, which is
 * what §6.3 and §7.2 ask for — an unclear listing is reviewed, not shown.
 */
export async function getJobs(filters: JobFilters = {}): Promise<JobsResult> {
  const db = client();
  const page = Math.max(1, filters.page ?? 1);
  const empty: JobsResult = { jobs: [], total: 0, page, pageCount: 0, error: null };

  if (!db) {
    return { ...empty, error: "Supabase is not configured." };
  }

  // Every column the card actually renders. `description` is deliberately
  // excluded: it averages ~6 KB — 82% of a row — and nothing on this page
  // shows it, so selecting * burned bandwidth on every request.
  const LIST_COLUMNS =
    "id,title,company_name,company_domain,role_category,experience_min," +
    "experience_max,experience_level,city,country,remote_type,employment_type," +
    "salary_min,salary_max,salary_currency,tech_stack,apply_url,source," +
    "source_posted_at,first_seen_at";

  let query = db
    .from("jobs")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "active")
    .eq("needs_review", false);

  if (filters.q?.trim()) {
    const term = filters.q.trim().replace(/[%,()]/g, " ");
    query = query.or(`title.ilike.%${term}%,company_name.ilike.%${term}%`);
  }
  if (filters.category) query = query.eq("role_category", filters.category);
  if (filters.city) query = query.eq("city", filters.city);
  if (filters.experience) query = query.eq("experience_level", filters.experience);

  if (filters.remote === "remote") {
    query = query.in("remote_type", ["remote-india", "remote-global"]);
  } else if (filters.remote) {
    query = query.eq("remote_type", filters.remote);
  }

  const from = (page - 1) * PAGE_SIZE;
  query = query
    // Newest first, falling back to when we first saw it for feeds that
    // omit a posting date.
    .order("source_posted_at", { ascending: false, nullsFirst: false })
    .order("first_seen_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await query;

  if (error) {
    // A missing table means the migration hasn't run — say so plainly
    // rather than rendering an empty page that looks like "no jobs".
    return { ...empty, error: error.message };
  }

  const total = count ?? 0;
  return {
    // The column list is a runtime string, so supabase-js can't infer the
    // row shape; LIST_COLUMNS is kept in step with Job by hand.
    jobs: (data ?? []) as unknown as Job[],
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    error: null,
  };
}

/** Facet counts for the filter rail, computed from active listings only. */
export async function getJobFacets(): Promise<{
  cities: { value: string; count: number }[];
  categories: { value: string; count: number }[];
  total: number;
  lastSync: string | null;
}> {
  const db = client();
  if (!db) return { cities: [], categories: [], total: 0, lastSync: null };

  const { data, error } = await db
    .from("jobs")
    .select("city, role_category")
    .eq("status", "active")
    .eq("needs_review", false)
    .limit(5000);

  if (error || !data) return { cities: [], categories: [], total: 0, lastSync: null };

  const tally = (key: "city" | "role_category") => {
    const counts = new Map<string, number>();
    for (const row of data) {
      const v = row[key];
      if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  };

  const { data: sync } = await db
    .from("job_sync_logs")
    .select("finished_at")
    .eq("status", "ok")
    .order("finished_at", { ascending: false })
    .limit(1);

  return {
    cities: tally("city").slice(0, 12),
    categories: tally("role_category"),
    total: data.length,
    lastSync: sync?.[0]?.finished_at ?? null,
  };
}
