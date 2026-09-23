import config from "../config/env.js";
import { getAdapter } from "../sources/index.js";
import { prepareJob } from "../services/normalizeJob.js";
import { mapWithConcurrency } from "../services/http.js";
import { pathToFileURL } from "node:url";
import {
  upsertJobs,
  loadBlocklist,
  listEnabledCompanies,
  startSyncLog,
  finishSyncLog,
  markCompanyResult,
  markSourceResult,
} from "../repositories/supabase.js";

/**
 * Fetches every enabled company for one ATS provider, runs each job through
 * the §B.1 pipeline and upserts what survives.
 *
 * One company failing is logged and skipped — it must not abort the rest
 * (§14.2, §B.2).
 */
export async function syncAtsSource(sourceKey, { blocklist } = {}) {
  const adapter = getAdapter(sourceKey);
  const companies = await listEnabledCompanies(sourceKey);
  const blocked = blocklist ?? (await loadBlocklist());

  const totals = {
    source: sourceKey,
    companies: companies.length,
    fetched: 0,
    created: 0,
    updated: 0,
    rejected: 0,
    failed: 0,
    rejectReasons: {},
  };

  if (!companies.length) {
    console.log(`[${sourceKey}] no enabled companies — skipping`);
    return totals;
  }

  const logId = await startSyncLog(sourceKey);

  const results = await mapWithConcurrency(
    companies,
    config.http.concurrency,
    async (company) => {
      const raws = await adapter.fetchJobs({ company });
      const keep = [];

      for (const raw of raws) {
        const outcome = prepareJob(raw, adapter, { company });

        if (outcome.action === "reject") {
          totals.rejected += 1;
          totals.rejectReasons[outcome.reason] =
            (totals.rejectReasons[outcome.reason] ?? 0) + 1;
          continue;
        }

        const job = outcome.job;
        // §16 — removals stay removed across syncs.
        if (
          blocked.jobs.has(`${job.source}:${job.externalId}`) ||
          blocked.companies.has(job.companyName.toLowerCase())
        ) {
          totals.rejected += 1;
          totals.rejectReasons.blocked =
            (totals.rejectReasons.blocked ?? 0) + 1;
          continue;
        }
        keep.push(job);
      }

      return { company, fetched: raws.length, keep };
    },
  );

  // Persist per company so one bad payload can't lose an entire batch.
  for (let i = 0; i < results.length; i += 1) {
    const r = results[i];
    const company = companies[i];

    if (!r.ok) {
      totals.failed += 1;
      console.error(
        `[${sourceKey}] ${company.company_name}: ${r.error.message}`,
      );
      await markCompanyResult(company.id, false, r.error.message);
      continue;
    }

    totals.fetched += r.value.fetched;

    if (r.value.keep.length && !config.dryRun) {
      try {
        const { created, updated } = await upsertJobs(r.value.keep);
        totals.created += created;
        totals.updated += updated;
      } catch (err) {
        totals.failed += 1;
        console.error(`[${sourceKey}] upsert ${company.company_name}: ${err.message}`);
        await markCompanyResult(company.id, false, err.message);
        continue;
      }
    } else if (config.dryRun) {
      totals.created += r.value.keep.length;
    }

    await markCompanyResult(company.id, true);
    console.log(
      `[${sourceKey}] ${company.company_name}: fetched ${r.value.fetched}, kept ${r.value.keep.length}`,
    );
  }

  await finishSyncLog(logId, {
    fetched_count: totals.fetched,
    created_count: totals.created,
    updated_count: totals.updated,
    rejected_count: totals.rejected,
    failed_count: totals.failed,
    status: totals.failed === 0 ? "ok" : totals.failed < companies.length ? "partial" : "failed",
    reject_reasons: totals.rejectReasons,
  });

  await markSourceResult(sourceKey, totals.failed < companies.length);
  return totals;
}

// CLI: node src/jobs/syncSource.js greenhouse
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
  const key = process.argv[2];
  if (!key) {
    console.error("usage: npm run sync:source -- <greenhouse|lever|ashby>");
    process.exit(1);
  }
  syncAtsSource(key)
    .then((t) => {
      console.log(JSON.stringify(t, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
