import { db } from "../repositories/supabase.js";
import { SEED_COMPANIES, SEED_SOURCES } from "../config/seedCompanies.js";
import { getAdapter } from "../sources/index.js";
import { mapWithConcurrency } from "../services/http.js";
import config from "../config/env.js";

/**
 * Seeds job_sources and companies.
 *
 * §4.4 is explicit that a provider/identifier pair is only saved after the
 * feed validates, so each board is probed once here. A board that 404s is
 * reported and skipped rather than stored as a permanently failing source.
 */
async function seed() {
  // ---- providers ----
  const { error: srcErr } = await db
    .from("job_sources")
    .upsert(SEED_SOURCES, { onConflict: "source_key" });
  if (srcErr) throw new Error(`seed sources failed: ${srcErr.message}`);
  console.log(`sources seeded: ${SEED_SOURCES.map((s) => s.source_key).join(", ")}`);

  // ---- validate each board before trusting it ----
  console.log(`\nvalidating ${SEED_COMPANIES.length} boards...`);
  const checks = await mapWithConcurrency(
    SEED_COMPANIES,
    config.http.concurrency,
    async (c) => {
      const adapter = getAdapter(c.ats_provider);
      const jobs = await adapter.fetchJobs({ company: c });
      return { company: c, count: jobs.length };
    },
  );

  const valid = [];
  for (let i = 0; i < checks.length; i += 1) {
    const c = SEED_COMPANIES[i];
    const r = checks[i];
    if (!r.ok) {
      console.log(`  SKIP ${c.company_name} (${c.ats_provider}/${c.ats_identifier}) — ${r.error.message}`);
      continue;
    }
    if (r.value.count === 0) {
      console.log(`  SKIP ${c.company_name} — feed returned 0 jobs`);
      continue;
    }
    console.log(`  OK   ${c.company_name.padEnd(16)} ${String(r.value.count).padStart(4)} postings`);
    valid.push({
      ...c,
      careers_url: careersUrl(c),
      permission_status: "unverified",
      enabled: true,
    });
  }

  if (!valid.length) {
    console.error("\nNo boards validated — nothing seeded.");
    process.exit(1);
  }

  const { error: coErr } = await db
    .from("companies")
    .upsert(valid, { onConflict: "ats_provider,ats_identifier" });
  if (coErr) throw new Error(`seed companies failed: ${coErr.message}`);

  console.log(
    `\ncompanies seeded: ${valid.length} of ${SEED_COMPANIES.length} validated`,
  );
}

function careersUrl(c) {
  switch (c.ats_provider) {
    case "greenhouse":
      return `https://boards.greenhouse.io/${c.ats_identifier}`;
    case "lever":
      return `https://jobs.lever.co/${c.ats_identifier}`;
    case "ashby":
      return `https://jobs.ashbyhq.com/${c.ats_identifier}`;
    case "smartrecruiters":
      return `https://jobs.smartrecruiters.com/${c.ats_identifier}`;
    case "wipro":
      return "https://careers.wipro.com/";
    default:
      return null;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
