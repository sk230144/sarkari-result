import { syncAtsSource } from "./syncSource.js";
import { ATS_ADAPTERS } from "../sources/index.js";
import { loadBlocklist, listEnabledSources } from "../repositories/supabase.js";
import config from "../config/env.js";
import { purgeOld } from "./purgeOld.js";
import { pathToFileURL } from "node:url";

/**
 * Runs every enabled source in turn. §B.2: a source that throws is logged
 * and the loop continues — one provider outage must not stop ingestion.
 */
export async function syncAll() {
  const started = Date.now();
  console.log(
    `\n=== Jobs24 sync ${new Date().toISOString()}${config.dryRun ? " (DRY RUN)" : ""} ===`,
  );

  const enabled = await listEnabledSources();
  const enabledKeys = new Set(enabled.map((s) => s.source_key));
  const toRun = ATS_ADAPTERS.filter((k) => enabledKeys.has(k));

  if (!toRun.length) {
    console.log("No enabled sources. Run `npm run seed` first.");
    return [];
  }

  // Loaded once and shared, rather than re-queried per source.
  const blocklist = await loadBlocklist();
  const summaries = [];

  for (const key of toRun) {
    try {
      summaries.push(await syncAtsSource(key, { blocklist }));
    } catch (err) {
      console.error(`[${key}] source failed entirely: ${err.message}`);
      summaries.push({ source: key, error: err.message, failed: 1 });
    }
  }

  const totals = summaries.reduce(
    (acc, s) => ({
      fetched: acc.fetched + (s.fetched ?? 0),
      created: acc.created + (s.created ?? 0),
      updated: acc.updated + (s.updated ?? 0),
      rejected: acc.rejected + (s.rejected ?? 0),
      failed: acc.failed + (s.failed ?? 0),
    }),
    { fetched: 0, created: 0, updated: 0, rejected: 0, failed: 0 },
  );

  console.log(
    `\n=== done in ${((Date.now() - started) / 1000).toFixed(1)}s — ` +
      `fetched ${totals.fetched}, new ${totals.created}, updated ${totals.updated}, ` +
      `rejected ${totals.rejected}, failed ${totals.failed} ===\n`,
  );

  // Roll the window forward after ingesting, never before: purging first
  // would delete rows this run is about to refresh, and a sync that failed
  // would leave the feed emptier than it needs to be.
  if (!config.dryRun) {
    try {
      await purgeOld();
    } catch (err) {
      // Retention is housekeeping — a failure here must not fail the sync.
      console.error(`purge failed: ${err.message}`);
    }
  }

  // Why jobs were dropped, so filters can be tuned from evidence.
  const reasons = {};
  for (const s of summaries) {
    for (const [r, n] of Object.entries(s.rejectReasons ?? {})) {
      reasons[r] = (reasons[r] ?? 0) + n;
    }
  }
  if (Object.keys(reasons).length) {
    console.log("reject reasons:", JSON.stringify(reasons, null, 2));
  }

  return summaries;
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
  syncAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
