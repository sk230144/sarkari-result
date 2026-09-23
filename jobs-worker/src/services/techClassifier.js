import {
  TECH_TITLE_TERMS,
  TECH_DENY_TERMS,
  NON_TECH_TITLE_TERMS,
  SENIORITY_DENY_TERMS,
  ROLE_CATEGORIES,
  TECH_STACK_TERMS,
  EXPERIENCE_PATTERNS,
} from "../config/filters.js";

const norm = (s) => (s || "").toLowerCase();

/**
 * §7.1 — deterministic tech filter. Title first, then department.
 *
 * Returns isTech: true (keep), false (reject), or null (unclear — the job
 * is kept but flagged for review rather than guessed at, per §7.2).
 */
/**
 * Words that mark a role as *software* specifically, rather than any
 * discipline that happens to use the word "engineer".
 */
const SOFTWARE_SIGNALS = [
  "software", "developer", "development", "sde", "programmer", "full stack",
  "fullstack", "frontend", "front-end", "backend", "back-end", "web ",
  "mobile", "android", "ios", "devops", "sre", "site reliability", "cloud",
  "platform", "infrastructure", "data engineer", "data scientist",
  "data analyst", "analytics", "machine learning", "ml ", "ai ", "artificial intelligence",
  "qa ", "sdet", "test automation", "automation engineer", "api", "microservice",
  "database", "sql", "java", "python", "javascript", "typescript", ".net",
  "golang", "react", "angular", "node", "aws", "azure", "gcp", "kubernetes",
  "docker", "security engineer", "appsec", "cybersecurity", "soc ",
  "product manager", "product owner", "ux ", "ui ", "product design",
  "solution architect", "technical architect", "software architect",
  "system architect", "embedded software", "firmware", "sap ", "salesforce",
  "erp", "crm", "observability", "big data", "etl", "business intelligence",
  // IT operations and enterprise-application roles are software work too.
  // Deliberately specific: a bare "analyst" or "consultant" would admit
  // financial and HR roles, so each entry names the technology.
  "soc ", "soc l", "siem", "systems analyst", "technical analyst",
  "technical consultant", "solutions consultant", "systems administrator",
  "database administrator", "workload automation", "d365", "dynamics 365",
  "sharepoint", "servicenow", "middleware", "devsecops",
  "scrum master", "release manager", "technical program",
  // QA tooling, embedded software, e-commerce platforms and RPA.
  "tester", "selenium", "playwright", "cypress", "appium", "junit",
  "embedded sw", "embedded software", "sw engineer", "sw developer",
  "adobe commerce", "magento", "shopify", "wordpress", "drupal",
  "rpa", "uipath", "automation anywhere", "power platform",
  "technical lead", "tech lead",
  "automation testing", "manual testing", "computer vision", "nlp",
  "deep learning", "generative ai", "genai", "llm",
];

export function classifyTech(job) {
  const title = norm(job.title);
  const dept = norm(job.department);

  // Deny-lists win: "Civil Engineer" must not pass on the word "engineer",
  // and an Account Executive must not pass because its department says
  // "Product Sales". Both are checked before any positive signal.
  const denied = TECH_DENY_TERMS.find((t) => title.includes(t));
  if (denied) return { isTech: false, roleCategory: null, reason: `deny:${denied}` };

  const nonTech = NON_TECH_TITLE_TERMS.find((t) => title.includes(t));
  if (nonTech) {
    return { isTech: false, roleCategory: null, reason: `non-tech-title:${nonTech}` };
  }

  // Executive titles are dropped unless the title also names an engineering
  // discipline — "Director of Engineering" stays, "Director - Product" goes.
  const exec = SENIORITY_DENY_TERMS.find((t) => title.includes(t));
  if (exec) {
    const alsoTechnical = TECH_TITLE_TERMS.some(
      (t) => title.includes(t) && !["product manager", "product designer"].includes(t),
    );
    if (!alsoTechnical) {
      return { isTech: false, roleCategory: null, reason: `exec-title:${exec.trim()}` };
    }
  }

  const matched = TECH_TITLE_TERMS.find((t) => title.includes(t));
  if (matched) {
    // "Engineer" alone is ambiguous on a manufacturing board — Bosch posts
    // hundreds of process, quality and hardware engineers. When the only
    // signal is a generic word, require something that names software.
    const generic = ["engineer", "developer", "architect", "programmer"].includes(
      matched,
    );
    if (generic) {
      const software =
        SOFTWARE_SIGNALS.some((s) => title.includes(s)) ||
        SOFTWARE_SIGNALS.some((s) => dept.includes(s)) ||
        // An engineering/technology department is enough: "Staff Engineer"
        // under Engineering is a software role, the same title on a
        // manufacturing board is not.
        /\b(?:engineering|technology|software|r&d|digital|it)\b/i.test(dept);
      if (!software) {
        return {
          isTech: false,
          roleCategory: null,
          reason: "generic-engineer-no-software-signal",
        };
      }
    }
    return {
      isTech: true,
      roleCategory: detectRoleCategory(title, dept),
      reason: `title:${matched}`,
    };
  }

  // Title was inconclusive — fall back to the department/function field.
  const deptMatch = TECH_TITLE_TERMS.find((t) => dept.includes(t));
  if (deptMatch) {
    return {
      isTech: true,
      roleCategory: detectRoleCategory(title, dept),
      reason: `dept:${deptMatch}`,
    };
  }

  // No classic tech noun, but the title may still name software work —
  // "SOC L3 Analyst", "D365 Consultant", "Observability Platform Lead".
  const signal = SOFTWARE_SIGNALS.find((s) => title.includes(s));
  if (signal) {
    return {
      isTech: true,
      roleCategory: detectRoleCategory(title, dept),
      reason: `software-signal:${signal.trim()}`,
    };
  }

  const techDepts = ["engineering", "technology", "product", "design", "data"];
  if (techDepts.some((d) => dept.includes(d))) {
    // Plausibly tech but the title didn't confirm it — review, don't guess.
    return { isTech: null, roleCategory: null, reason: "ambiguous-dept" };
  }

  return { isTech: false, roleCategory: null, reason: "no-tech-signal" };
}

function detectRoleCategory(title, dept) {
  const text = `${title} ${dept}`;
  for (const [category, keywords] of ROLE_CATEGORIES) {
    if (keywords.some((k) => text.includes(k))) return category;
  }
  return "other";
}

/**
 * §8.1 — pulls a years-of-experience range out of the description.
 * Returns nulls when nothing is stated; the doc is explicit that missing
 * facts must not be invented (§2.2).
 */
export function extractExperience(text, title = "") {
  // The title is the employer's own seniority statement and outranks any
  // number scraped from prose — descriptions contain "4x year over year"
  // growth copy and "our graduates" boilerplate that both mislead.
  const senior = /\b(?:senior|sr\.?|staff|principal|lead|head|director|architect|manager)\b/i.test(
    title,
  );
  const junior = /\b(?:intern|internship|trainee|apprentice|graduate|fresher|entry[- ]level|junior|new grad|campus)\b/i.test(
    title,
  );

  if (!text) {
    if (senior && !junior) return { min: 5, max: null, level: "5+" };
    if (junior) return { min: 0, max: 1, level: "0-2" };
    return { min: null, max: null, level: null };
  }

  // Only the first part of a description states requirements; scanning the
  // whole body picks up unrelated numbers from benefits and boilerplate.
  const head = text.slice(0, 2500);

  for (const re of EXPERIENCE_PATTERNS) {
    const m = head.match(re);
    if (!m) continue;

    // "4x year over year" and "our company is 5 years old" are not
    // requirements. Accept the number only when the surrounding text reads
    // like a requirement, and reject the known false-positive phrasings.
    const around = head.slice(
      Math.max(0, m.index - 70),
      m.index + m[0].length + 70,
    );
    const isCompanyFact =
      /\b(?:year over year|yoy|years old|years of operation|founded|since \d{4}|growth|revenue)\b/i.test(
        around,
      );
    if (isCompanyFact) continue;

    const readsAsRequirement =
      /\b(?:experience|exp\.?|background|working|worked|building|built|developing|hands[- ]on|proven|track record|expertise|minimum|at least|require)\b/i.test(
        around,
      );
    if (!readsAsRequirement) continue;

    const a = Number(m[1]);
    const b = m[2] !== undefined ? Number(m[2]) : null;
    if (!Number.isFinite(a) || a > 30) continue;

    const min = a;
    const max = b !== null && Number.isFinite(b) && b <= 40 ? b : null;
    return { min, max, level: toLevel(min, max) };
  }

  // A senior title settles it before prose keywords get a say.
  if (senior && !junior) return { min: 5, max: null, level: "5+" };

  // Common phrasings that imply a level without naming a number.
  if (
    /\b(?:freshers?|entry[- ]level|graduates?|interns?(?:hip)?|final[- ]year|campus hire|no prior experience|recent grad)\b/i.test(
      head,
    )
  ) {
    return { min: 0, max: 1, level: "0-2" };
  }
  if (/\b(?:senior|sr\.?|lead|staff|principal)\b/i.test(head)) {
    return { min: null, max: null, level: "5+" };
  }

  return { min: null, max: null, level: null };
}

/**
 * Buckets a range into the §8.1 filter facets.
 *
 * An open-ended requirement ("5+ years", max === null) sits in the top
 * bucket, while a bounded "3-5 years" is mid-level — so the boundary value
 * alone isn't enough to decide.
 */
function toLevel(min, max = null) {
  // The floor is what gates an applicant: "1-3 years" is open to someone
  // with one year, so it belongs in 0-2 even though it tops out at 3.
  if (min <= 1) return "0-2";
  if (min < 5) return "2-5";
  return "5+";
}

/** §8.1 — tech_stack chips, from the title and description. */
export function extractTechStack(job) {
  const text = norm(`${job.title} ${(job.description || "").slice(0, 4000)}`);
  const found = new Set();

  for (const term of TECH_STACK_TERMS) {
    // Escape regex metacharacters — "c++", ".net" and "node.js" contain them.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#]|$)`, "i").test(text)) {
      found.add(term);
    }
  }
  return [...found].slice(0, 15);
}
