/**
 * Filter regression tests — `npm test`.
 *
 * These encode the §6 and §7 rules as concrete cases. They run offline, so
 * a rule change can be checked in a second without hitting any provider.
 */
import { classifyIndiaEligibility } from "../services/eligibility.js";
import { classifyTech, extractExperience, extractTechStack } from "../services/techClassifier.js";
import { isSafeUrl, createFingerprint } from "../services/normalizeJob.js";

let failures = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.log(`  FAIL ${label}\n       got      ${JSON.stringify(actual)}\n       expected ${JSON.stringify(expected)}`);
  }
  return ok;
}

// ---- §6 India / remote eligibility ----
console.log("§6 eligibility");
const geo = (rawLocation, extra = {}) =>
  classifyIndiaEligibility({ title: "Backend Engineer", rawLocation, description: "", ...extra });

for (const [loc, allowed, remoteType] of [
  // India-located
  ["Bengaluru, India", true, "onsite"],
  ["Hyderabad", true, "onsite"],
  ["Remote, India", true, "remote-india"],
  ["India - Remote", true, "remote-india"],
  // §6.3 — an India option survives a co-listed foreign region
  ["Bengaluru, India OR Remote US", true, "remote-india"],
  // Globally open
  ["Remote - Worldwide", true, "remote-global"],
  ["Anywhere", true, "remote-global"],
  ["Remote APAC", true, "remote-global"],
  // Region-scoped away from India
  ["US-Remote", false, "remote-global"],
  ["Remote from the US", false, "remote-global"],
  ["Remote North America", false, "remote-global"],
  ["Remote (EMEA)", false, "remote-global"],
  // A named foreign city anchors the role before the remote-scope rules
  // run, so these reject as onsite rather than remote-global. Either way
  // they are dropped — the label just records why.
  ["Toronto, Canada Remote", false, "onsite"],
  ["US-SEA, US-SF, US-NYC, US-Remote", false, "onsite"],
  // Foreign onsite
  ["Seattle", false, "onsite"],
  ["Dublin, Ireland", false, "onsite"],
  // Bare foreign city with no country — Ashby returns these. Must reject
  // outright, not drift into the review queue as remote-unknown.
  ["San Francisco", false, "onsite"],
  ["Tokyo, Japan", false, "onsite"],
  ["Singapore", false, "onsite"],
  ["London", false, "onsite"],
  ["Remote - San Francisco", false, "onsite"],
]) {
  const g = geo(loc);
  check(`${loc} -> ${allowed ? "keep" : "drop"}/${remoteType}`, [g.allowed, g.remoteType], [allowed, remoteType]);
}

// A concrete foreign location beats a provider's remote flag. Ashby sets
// isRemote: true on every Replit posting while the location says
// "Foster City, CA" — trusting the flag would publish US jobs.
for (const loc of ["Foster City, CA", "NYC (SoHo)", "Salt Lake City, UT", "London Office"]) {
  check(`${loc} + isRemote wins for location`, geo(loc, { remoteHint: true }).allowed, false);
}
// India must survive the same path, including state suffixes.
for (const loc of ["Bengaluru, Karnataka", "Pune, Maharashtra", "Bangalore, KA", "Remote - India"]) {
  check(`${loc} stays eligible`, geo(loc, { remoteHint: true }).allowed, true);
}
// A title that names its own foreign city anchors the role there.
check(
  "Toronto in title rejects",
  classifyIndiaEligibility({ title: "Senior Support Engineer - Toronto", rawLocation: "Remote", description: "" }).allowed,
  false,
);
check(
  "Bengaluru in title keeps",
  classifyIndiaEligibility({ title: "Software Engineer - Bengaluru", rawLocation: "Remote", description: "" }).allowed,
  true,
);

// Unclear remote is kept but flagged, never guessed (§6.3).
check("bare Remote is review-flagged", geo("Remote").needsReview, true);
// An explicit exclusion in prose beats a generic remote (§6.3).
check(
  "prose exclusion wins",
  geo("Remote", { description: "You must reside in the US to be eligible." }).allowed,
  false,
);

// ---- §7 tech classification ----
console.log("§7 tech filter");
for (const [title, dept, isTech, category] of [
  ["Senior Software Engineer", "Engineering", true, "software"],
  ["Machine Learning Engineer", "Engineering", true, "ai-ml"],
  ["Backend Engineer, Payments", "Engineering", true, "backend"],
  ["Site Reliability Engineer", "Infrastructure", true, "devops"],
  ["Data Engineer", "Data", true, "data"],
  ["Android Developer", "Mobile", true, "mobile"],
  ["Product Manager, Payments", "Product", true, "product"],
  // Non-software "engineer" titles (§7.1 deny-list)
  ["Civil Engineer", "Operations", false, null],
  ["Mechanical Engineer", "Manufacturing", false, null],
  // GTM/legal roles inside a Product department
  ["Account Executive Product - Fraud & Risk", "Product Sales", false, null],
  ["Product Counsel", "Legal", false, null],
  ["Pre-Sales Solutions Architect", "Product", false, null],
  ["Marketing Manager", "Product", false, null],
  ["Technical Recruiter", "People", false, null],
  // Executive titles go unless the title names an engineering discipline.
  ["Director - Product", "Product", false, null],
  ["Director Data Science", "Data", false, null],
  ["Head of Sales", "Sales", false, null],
  ["Director of Engineering", "Engineering", true, "software"],
  ["Director, Engineering, Platform Operations", "Engineering", true, "software"],
  // Support and enablement are not software engineering.
  ["Senior Support Engineer", "Support", false, null],
  ["Senior Instructional Designer", "Learning", false, null],
  // Manufacturing boards (Bosch, Continental) post hundreds of roles that
  // contain "Engineer" but are not software.
  ["Senior Power Systems Engineer", "", false, null],
  ["Supplier Quality Engineer", "", false, null],
  ["Senior Hardware Design Engineer", "", false, null],
  ["System Architect - ADAS", "", false, null],
  ["Senior Model-Based Design (MBD) Engineer", "", false, null],
  ["Front Line Manager", "", false, null],
  ["Cost Engineering & Benchmarking", "", false, null],
  // A generic title needs a software signal somewhere.
  ["Staff Engineer", "Manufacturing", false, null],
  ["Staff Engineer", "Engineering", true, "software"],
  // Software work that names no classic tech noun.
  ["SOC L3 Analyst", "", true, "security"],
  ["D365 F&O SCM Consultant", "", true, "other"],
  // ...but a bare analyst/consultant is not admitted.
  ["Financial Analyst", "Finance", false, null],
  ["HR Consultant", "People", false, null],
]) {
  const r = classifyTech({ title, department: dept });
  check(`${title} -> ${isTech}/${category}`, [r.isTech, r.roleCategory], [isTech, category]);
}

// ---- §8.1 enrichment ----
console.log("§8.1 enrichment");
check("range 3-5 years", extractExperience("We want 3-5 years of experience.").level, "2-5");
check("5+ years", extractExperience("5+ years building systems").level, "5+");
check("fresher", extractExperience("Open to freshers and graduates").level, "0-2");
// §2.2 — never invent a fact the posting doesn't state.
check("silent description stays null", extractExperience("Join our team!").level, null);

// The floor gates the applicant: "1-3 years" is open to a one-year dev, so
// it belongs in the fresher bucket rather than mid-level.
check("1-3 years is entry", extractExperience("1-3 years of experience").level, "0-2");
check("2-4 years is mid", extractExperience("2-4 years of experience").level, "2-5");
check("5-8 years is senior", extractExperience("5-8 years of experience").level, "5+");

// A number needs experience context — marketing copy is not a requirement.
check(
  "growth copy is not experience",
  extractExperience("growth exceeding 4x year over year", "Senior Staff Research Engineer").level,
  "5+",
);
check(
  "company age is not experience",
  extractExperience("our company is 5 years old").level,
  null,
);
// The title's own seniority outranks stray prose keywords.
check(
  "senior title beats graduate boilerplate",
  extractExperience("we hire many graduates", "Principal Engineer").level,
  "5+",
);
check(
  "intern title wins",
  extractExperience("internship program", "Software Engineer, Intern").level,
  "0-2",
);

const stack = extractTechStack({ title: "Backend Engineer", description: "We use Node.js, PostgreSQL and AWS." });
check("stack detected", ["node.js", "postgresql", "aws"].every((t) => stack.includes(t)), true);
// "go" must not fire inside ordinary words.
check("no substring false positive", extractTechStack({ title: "Account Manager", description: "a good algorithm" }).includes("go"), false);

// ---- §16 URL safety ----
console.log("§16 url safety");
check("https ok", isSafeUrl("https://example.com/job/1"), true);
check("javascript: rejected", isSafeUrl("javascript:alert(1)"), false);
check("data: rejected", isSafeUrl("data:text/html,<script>"), false);
check("empty rejected", isSafeUrl(""), false);

// ---- §10.2 fingerprint ----
console.log("§10.2 fingerprint");
const base = { companyName: "Acme", title: "Backend Engineer", city: "Bengaluru", remoteType: "onsite" };
check("stable across sources", createFingerprint(base) === createFingerprint({ ...base }), true);
check("case/spacing insensitive", createFingerprint(base) === createFingerprint({ ...base, companyName: " ACME ", title: "Backend  Engineer" }), true);
check("differs by city", createFingerprint(base) !== createFingerprint({ ...base, city: "Pune" }), true);

console.log(failures === 0 ? "\nAll filter tests passed." : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
