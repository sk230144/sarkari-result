/**
 * Pipeline smoke test — fetches live boards and runs the full §B.1 pipeline
 * without touching the database. Proves the filters behave before any
 * schema exists or anything is deployed.
 *
 *   node src/jobs/dryRun.js [limitPerCompany]
 */
import { getAdapter } from "../sources/index.js";
import { prepareJob } from "../services/normalizeJob.js";

const SAMPLE = [
  { company_name: "Stripe", ats_provider: "greenhouse", ats_identifier: "stripe" },
  { company_name: "Databricks", ats_provider: "greenhouse", ats_identifier: "databricks" },
  { company_name: "Groww", ats_provider: "greenhouse", ats_identifier: "groww" },
  { company_name: "Meesho", ats_provider: "lever", ats_identifier: "meesho" },
  { company_name: "Zeta", ats_provider: "lever", ats_identifier: "zeta" },
  { company_name: "Vanta", ats_provider: "ashby", ats_identifier: "vanta" },
  { company_name: "PostHog", ats_provider: "ashby", ats_identifier: "posthog" },
];

const reasons = {};
const kept = [];

for (const company of SAMPLE) {
  const adapter = getAdapter(company.ats_provider);
  let raws;
  try {
    raws = await adapter.fetchJobs({ company });
  } catch (err) {
    console.log(`${company.company_name.padEnd(12)} FETCH FAILED — ${err.message}`);
    continue;
  }

  let keep = 0;
  for (const raw of raws) {
    const out = prepareJob(raw, adapter, { company });
    if (out.action === "upsert") {
      keep += 1;
      kept.push(out.job);
    } else {
      reasons[out.reason] = (reasons[out.reason] ?? 0) + 1;
    }
  }
  console.log(
    `${company.company_name.padEnd(12)} ${String(raws.length).padStart(4)} fetched -> ${String(keep).padStart(3)} kept`,
  );
}

console.log(`\n=== ${kept.length} jobs passed the pipeline ===\n`);

const by = (fn) =>
  kept.reduce((a, j) => {
    const k = fn(j) ?? "(none)";
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {});

console.log("remote_type:  ", by((j) => j.remoteType));
console.log("role_category:", by((j) => j.roleCategory));
console.log("city:         ", by((j) => j.city));
console.log("experience:   ", by((j) => j.experienceLevel));
console.log("needs_review: ", kept.filter((j) => j.needsReview).length);

console.log("\n=== sample of 8 ===");
for (const j of kept.slice(0, 8)) {
  console.log(
    `\n  ${j.title}\n  ${j.companyName} · ${j.city ?? j.remoteType} · ` +
      `${j.roleCategory} · ${j.experienceLevel ?? "exp n/a"}` +
      `\n  stack: ${j.techStack.slice(0, 6).join(", ") || "(none detected)"}` +
      `\n  ${j.applyUrl}`,
  );
}

console.log("\n=== reject reasons ===");
for (const [r, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(5)}  ${r}`);
}

// Duplicate-fingerprint sanity check (§10.2).
const fps = new Map();
for (const j of kept) fps.set(j.fingerprint, (fps.get(j.fingerprint) ?? 0) + 1);
const dupes = [...fps.values()].filter((n) => n > 1).length;
console.log(`\nfingerprints: ${fps.size} unique, ${dupes} with collisions`);
