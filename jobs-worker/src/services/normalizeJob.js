import { createHash } from "node:crypto";
import sanitizeHtml from "sanitize-html";
import { classifyIndiaEligibility } from "./eligibility.js";
import {
  classifyTech,
  extractExperience,
  extractTechStack,
} from "./techClassifier.js";

/** §16.1 — imported HTML is sanitized before it is ever stored or rendered. */
export function cleanDescription(raw) {
  if (!raw) return null;
  const html = sanitizeHtml(raw, {
    allowedTags: ["p", "ul", "ol", "li", "strong", "em", "br", "a", "h2", "h3"],
    allowedAttributes: { a: ["href", "target", "rel"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
    },
  });
  return html.trim() || null;
}

/** Plain text for the classifiers, which should not see markup. */
export function toPlainText(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** §16 — only http/https apply URLs are allowed through. */
export function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

const normalizeForKey = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** §10.2 — soft duplicate signal across sources. */
export function createFingerprint(job) {
  const scope = job.city ? normalizeForKey(job.city) : job.remoteType || "";
  const basis = [
    normalizeForKey(job.companyName),
    normalizeForKey(job.title),
    scope,
  ].join("|");
  return createHash("sha256").update(basis).digest("hex");
}

export function slugify(title, company) {
  return `${normalizeForKey(title)} ${normalizeForKey(company)}`
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
}

/**
 * The §B.1 pipeline: normalize -> validate -> India eligibility -> tech
 * filter -> enrich -> fingerprint.
 *
 * @returns {{action: 'upsert'|'reject', job?: object, reason?: string}}
 */
export function prepareJob(raw, adapter, context = {}) {
  let job;
  try {
    job = adapter.normalize(raw, context);
  } catch (err) {
    return { action: "reject", reason: `normalize-error:${err.message}` };
  }

  if (!job?.title || !job?.companyName || !job?.externalId) {
    return { action: "reject", reason: "invalid-missing-fields" };
  }
  if (!isSafeUrl(job.applyUrl)) {
    return { action: "reject", reason: "invalid-apply-url" };
  }

  const plain = toPlainText(job.description);
  const geo = classifyIndiaEligibility({ ...job, description: plain });
  if (!geo.allowed) return { action: "reject", reason: geo.reason };

  const tech = classifyTech(job);
  if (tech.isTech === false) return { action: "reject", reason: "non-tech" };

  const experience = extractExperience(plain, job.title);

  // An internship is a distinct thing from "0-2 years" — a student filtering
  // for internships doesn't want a role wanting two years of production
  // experience. Detected from the title, where employers always state it.
  const isInternship =
    /\b(?:intern|internship|apprentice|trainee|co-?op)\b/i.test(job.title) ||
    /\b(?:internship|apprenticeship)\b/i.test(plain.slice(0, 400));

  return {
    action: "upsert",
    job: {
      ...job,
      description: cleanDescription(job.description),
      city: geo.city ?? job.city ?? null,
      country: geo.city || geo.remoteType === "remote-india" ? "India" : job.country ?? null,
      remoteType: geo.remoteType,
      roleCategory: tech.roleCategory ?? job.roleCategory ?? null,
      experienceMin: isInternship ? 0 : (experience.min ?? job.experienceMin),
      experienceMax: isInternship ? 1 : (experience.max ?? job.experienceMax),
      // The title-aware extractor wins over a provider's own field: some
      // employers tag "Senior Engineer / Assistant Manager" as entry_level,
      // and a senior title in the fresher bucket is worse than no label.
      experienceLevel: isInternship
        ? "internship"
        : (experience.level ?? job.experienceLevel),
      employmentType: isInternship
        ? "Internship"
        : (job.employmentType ?? null),
      techStack: job.techStack?.length
        ? job.techStack
        : extractTechStack({ ...job, description: plain }),
      // Unclear remote scope or unclear role — visible to admins, hidden
      // from the default feed until reviewed (§6.3, §7.2).
      needsReview: geo.needsReview || tech.isTech === null,
      slug: slugify(job.title, job.companyName),
      fingerprint: createFingerprint({ ...job, ...geo }),
    },
  };
}
