import config from "../config/env.js";
import { db } from "../repositories/supabase.js";
import { getAdapter } from "../sources/index.js";
import { mapWithConcurrency } from "../services/http.js";
import { pathToFileURL } from "node:url";

/**
 * Lifecycle pass (§11).
 *
 * Two rules the doc is firm about, and this implements literally:
 *   - A job missing from a search/aggregator result is stale, never closed
 *     on that evidence alone (§11.3).
 *   - A provider outage must never close anything — an errored check
 *     leaves the row's prior state untouched (§11.3, §14.2).
 */
export async function verifyStale() {
  const cutoff = new Date(
    Date.now() - config.freshnessDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Anything active but unseen since the freshness cutoff needs checking.
  const { data: candidates, error } = await db
    .from("jobs")
    .select("id, source, external_id, source_company_id, source_url, status")
    .in("status", ["active", "stale"])
    .lt("last_seen_at", cutoff)
    .limit(500);

  if (error) throw new Error(`load stale candidates failed: ${error.message}`);
  if (!candidates?.length) {
    console.log("no stale candidates");
    return { checked: 0, closed: 0, active: 0, unknown: 0 };
  }

  console.log(`verifying ${candidates.length} stale candidates...`);
  const tally = { checked: candidates.length, closed: 0, active: 0, unknown: 0 };

  const results = await mapWithConcurrency(
    candidates,
    config.http.concurrency,
    async (job) => {
      const adapter = getAdapter(job.source);
      // An adapter without verify() can't produce closure evidence, so the
      // job stays stale rather than being guessed at.
      if (typeof adapter.verify !== "function") return { job, verdict: "unknown" };
      return { job, verdict: await adapter.verify(job) };
    },
  );

  const now = new Date().toISOString();

  for (const r of results) {
    // A thrown check is a provider problem, not evidence about the job.
    if (!r.ok) {
      tally.unknown += 1;
      continue;
    }

    const { job, verdict } = r.value;

    if (verdict === "closed") {
      tally.closed += 1;
      await db
        .from("jobs")
        .update({ status: "closed", last_verified_at: now })
        .eq("id", job.id);
    } else if (verdict === "active") {
      tally.active += 1;
      await db
        .from("jobs")
        .update({ status: "active", last_seen_at: now, last_verified_at: now })
        .eq("id", job.id);
    } else {
      // Unverifiable: mark stale so it drops out of the default feed, but
      // keep the row — never delete on an inconclusive check.
      tally.unknown += 1;
      if (job.status !== "stale") {
        await db.from("jobs").update({ status: "stale" }).eq("id", job.id);
      }
    }
  }

  console.log(
    `verified ${tally.checked}: ${tally.active} still active, ` +
      `${tally.closed} closed, ${tally.unknown} unknown/stale`,
  );
  return tally;
}

/**
 * True when this module was run directly. Built with pathToFileURL rather
 * than string concatenation — on Windows a file URL has three slashes
 * (file:///C:/...), so a hand-built "file://" + path never matches and the
 * CLI block silently never runs.
 */
function isMain(moduleUrl) {
  // argv[1] is absent when this module is imported (node -e, a test
  // harness), and pathToFileURL throws on undefined.
  const entry = process.argv[1];
  return Boolean(entry) && moduleUrl === pathToFileURL(entry).href;
}

if (isMain(import.meta.url)) {
  verifyStale()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
