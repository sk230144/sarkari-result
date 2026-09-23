import { createClient } from "@supabase/supabase-js";
import config from "../config/env.js";

/**
 * Service-role client. Server-side only — this key bypasses RLS and must
 * never reach a browser (§16).
 */
export const db = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Maps the worker's camelCase contract to the table's snake_case columns. */
export function toRow(job) {
  return {
    external_id: String(job.externalId),
    source: job.source,
    source_company_id: job.sourceCompanyId ?? null,
    title: job.title,
    slug: job.slug ?? null,
    company_name: job.companyName,
    company_domain: job.companyDomain ?? null,
    role_category: job.roleCategory ?? null,
    experience_min: job.experienceMin ?? null,
    experience_max: job.experienceMax ?? null,
    experience_level: job.experienceLevel ?? null,
    city: job.city ?? null,
    state: job.state ?? null,
    country: job.country ?? null,
    remote_type: job.remoteType,
    employment_type: job.employmentType ?? null,
    salary_min: job.salaryMin ?? null,
    salary_max: job.salaryMax ?? null,
    salary_currency: job.salaryCurrency ?? null,
    tech_stack: job.techStack ?? [],
    description: job.description ?? null,
    apply_url: job.applyUrl,
    source_url: job.sourceUrl,
    source_posted_at: job.postedAt ?? null,
    last_seen_at: new Date().toISOString(),
    status: "active",
    needs_review: job.needsReview ?? false,
    fingerprint: job.fingerprint ?? null,
    source_metadata: job.sourceMetadata ?? {},
  };
}

/**
 * §B.3 — idempotent upsert on (source, external_id). A repeat fetch of the
 * same job updates that row; it never creates a second one.
 *
 * first_seen_at is deliberately absent from the payload so the column
 * default only applies on insert and the original sighting is preserved.
 */
/**
 * Chunk size for both the existence lookup and the upsert. PostgREST puts
 * `.in()` values in the query string, so a 2,000-id filter overflows the
 * URL — Wipro's 2,000-row batch failed with "Bad Request" before this.
 */
const BATCH = 200;

export async function upsertJobs(jobs) {
  if (!jobs.length) return { created: 0, updated: 0, failed: 0 };

  const rows = jobs.map(toRow);
  let created = 0;
  let updated = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);

    // Which of these already exist? Only used to report created vs updated.
    const { data: existing, error: selErr } = await db
      .from("jobs")
      .select("source, external_id")
      .in("source", [...new Set(slice.map((r) => r.source))])
      .in(
        "external_id",
        slice.map((r) => r.external_id),
      );

    if (selErr) throw new Error(`select existing failed: ${selErr.message}`);
    const seen = new Set(
      (existing ?? []).map((r) => `${r.source}:${r.external_id}`),
    );

    const { error } = await db
      .from("jobs")
      .upsert(slice, { onConflict: "source,external_id", ignoreDuplicates: false });

    if (error) throw new Error(`upsert failed: ${error.message}`);

    for (const r of slice) {
      if (seen.has(`${r.source}:${r.external_id}`)) updated += 1;
      else created += 1;
    }
  }

  return { created, updated, failed: 0 };
}

/** §16 — a blocked job must stay gone after the next sync. */
export async function loadBlocklist() {
  const [{ data: jobsBlocked }, { data: companiesBlocked }] = await Promise.all([
    db.from("blocked_jobs").select("source, external_id"),
    db.from("blocked_companies").select("company_name"),
  ]);

  return {
    jobs: new Set((jobsBlocked ?? []).map((r) => `${r.source}:${r.external_id}`)),
    companies: new Set(
      (companiesBlocked ?? []).map((r) => r.company_name.toLowerCase()),
    ),
  };
}

export async function listEnabledCompanies(provider = null) {
  let q = db.from("companies").select("*").eq("enabled", true);
  if (provider) q = q.eq("ats_provider", provider);
  const { data, error } = await q;
  if (error) throw new Error(`load companies failed: ${error.message}`);
  return data ?? [];
}

export async function listEnabledSources() {
  const { data, error } = await db
    .from("job_sources")
    .select("*")
    .eq("enabled", true);
  if (error) throw new Error(`load sources failed: ${error.message}`);
  return data ?? [];
}

export async function startSyncLog(sourceKey, companyId = null) {
  const { data, error } = await db
    .from("job_sync_logs")
    .insert({ source_key: sourceKey, company_id: companyId })
    .select("id")
    .single();
  if (error) return null; // logging must never break a sync
  return data.id;
}

export async function finishSyncLog(id, patch) {
  if (!id) return;
  await db
    .from("job_sync_logs")
    .update({ ...patch, finished_at: new Date().toISOString() })
    .eq("id", id);
}

export async function markCompanyResult(companyId, ok, _error = null) {
  if (!companyId) return;
  const patch = ok
    ? { last_success_at: new Date().toISOString(), consecutive_failures: 0 }
    : null;

  if (patch) {
    await db.from("companies").update(patch).eq("id", companyId);
    return;
  }
  // Increment failures without a race-prone read-modify-write.
  const { data } = await db
    .from("companies")
    .select("consecutive_failures")
    .eq("id", companyId)
    .single();
  await db
    .from("companies")
    .update({ consecutive_failures: (data?.consecutive_failures ?? 0) + 1 })
    .eq("id", companyId);
}

export async function markSourceResult(sourceKey, ok, intervalMinutes = 360) {
  const now = new Date();
  const next = new Date(now.getTime() + intervalMinutes * 60_000);
  const patch = {
    last_sync_at: now.toISOString(),
    next_sync_at: next.toISOString(),
    health_status: ok ? "ok" : "failing",
  };
  if (ok) patch.consecutive_failures = 0;
  await db.from("job_sources").update(patch).eq("source_key", sourceKey);
}
