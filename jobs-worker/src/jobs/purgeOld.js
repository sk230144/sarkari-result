import { pathToFileURL } from "node:url";
import config from "../config/env.js";
import { db } from "../repositories/supabase.js";

/**
 * Retention pass (§9.1 `retention_policy`) — a rolling window.
 *
 * A row is deleted once it has been in this database longer than
 * RETENTION_DAYS, measured from first_seen_at (when the worker first
 * pulled it), not from the employer's posting date.
 *
 * Why first_seen_at: it is the only clock this system controls. Posting
 * dates vary by provider — Wipro's comes from sitemap `lastmod`, which
 * moves whenever the page is touched — so retention driven by it would be
 * inconsistent between sources.
 *
 * The worker re-pulls every live posting each run, and the upsert refreshes
 * last_seen_at but deliberately leaves first_seen_at alone. So a job that
 * stays open is deleted after RETENTION_DAYS and then re-created on the very
 * next sync with a fresh first_seen_at. The feed keeps only recent rows
 * without permanently losing a posting that is still open.
 */
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || 5);

export async function purgeOld({ days = RETENTION_DAYS } = {}) {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();

  const { count, error } = await db
    .from("jobs")
    .delete({ count: "exact" })
    .lt("first_seen_at", cutoff);

  if (error) throw new Error(`purge failed: ${error.message}`);

  // Sync logs are diagnostics — keep a longer window so a failing source is
  // still traceable after the jobs themselves have rolled over.
  const logCutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { count: logCount } = await db
    .from("job_sync_logs")
    .delete({ count: "exact" })
    .lt("started_at", logCutoff);

  console.log(
    `purged ${count ?? 0} jobs older than ${days} days (cutoff ${cutoff.slice(0, 10)}), ` +
      `${logCount ?? 0} old sync logs`,
  );

  return { deleted: count ?? 0, logs: logCount ?? 0 };
}

/** Row counts and storage estimate, so growth stays observable. */
export async function reportSize() {
  const { count: total } = await db
    .from("jobs")
    .select("id", { count: "exact", head: true });

  const buckets = {};
  for (const d of [1, 5, 15, 30]) {
    const cut = new Date(Date.now() - d * 86_400_000).toISOString();
    const { count } = await db
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .lt("first_seen_at", cut);
    buckets[`older_than_${d}d`] = count ?? 0;
  }

  // ~7 KB per row measured against live data; Postgres compresses the
  // description column, so this is an upper bound.
  const estMb = (((total ?? 0) * 7213) / (1024 * 1024)).toFixed(1);
  console.log(
    `rows=${total ?? 0} (~${estMb} MB of 500 MB free tier) ` +
      `age: ${JSON.stringify(buckets)}`,
  );
  return { total: total ?? 0, estMb: Number(estMb), buckets };
}

function isMain(moduleUrl) {
  // argv[1] is absent when this module is imported (node -e, a test
  // harness), and pathToFileURL throws on undefined.
  const entry = process.argv[1];
  return Boolean(entry) && moduleUrl === pathToFileURL(entry).href;
}

if (isMain(import.meta.url)) {
  // --dry-run reports what exists without deleting anything.
  const run = config.dryRun ? reportSize() : purgeOld().then(reportSize);
  run
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
