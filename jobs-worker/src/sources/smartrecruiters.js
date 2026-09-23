import { fetchJson, mapWithConcurrency } from "../services/http.js";
import config from "../config/env.js";

/**
 * SmartRecruiters public postings API (§13.5).
 * GET api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings
 *
 * Two things make this the most useful ATS for the India feed:
 *   - `country=in` filters server-side, so a 5,000-posting employer costs
 *     one small request instead of paging the whole board.
 *   - `experienceLevel` is a structured field, so junior roles are labelled
 *     by the employer rather than guessed from description prose.
 */
const PAGE_LIMIT = 100;
/** Guards against an unbounded loop if an employer has thousands of roles. */
const MAX_PAGES = 10;

/**
 * SmartRecruiters' own levels, mapped to this platform's buckets.
 *
 * `associate` is deliberately absent. Employers use it as an internal grade
 * rather than an experience band — Bosch tags 329 of 516 postings that way,
 * including "Sr. Model Based Design Engineer". Trusting it put senior roles
 * in the fresher bucket, so those fall through to description parsing and
 * the title heuristic instead.
 */
const LEVEL_MAP = {
  internship: "internship",
  student: "internship",
  entry_level: "0-2",
  mid_senior_level: "2-5",
  director: "5+",
  executive: "5+",
};

export const smartrecruiters = {
  key: "smartrecruiters",
  isCompleteInventory: true,

  async fetchJobs({ company }) {
    const id = encodeURIComponent(company.ats_identifier);
    const out = [];

    for (let page = 0; page < MAX_PAGES; page += 1) {
      const url =
        `https://api.smartrecruiters.com/v1/companies/${id}/postings` +
        `?limit=${PAGE_LIMIT}&offset=${page * PAGE_LIMIT}&country=in`;
      const data = await fetchJson(url);
      const batch = Array.isArray(data?.content) ? data.content : [];
      out.push(...batch);

      if (batch.length < PAGE_LIMIT) break;
    }

    // The listing omits descriptions, which leaves the experience parser
    // with nothing to read — a quarter of these jobs ended up unlabelled.
    // Fetch each posting's detail so "3-5 years" in the text is usable.
    // A failed detail call degrades to the listing record, never drops it.
    const detailed = await mapWithConcurrency(
      out,
      config.http.concurrency,
      async (post) => {
        const d = await fetchJson(
          `https://api.smartrecruiters.com/v1/companies/${id}/postings/${post.id}`,
        );
        const s = d?.jobAd?.sections ?? {};
        const description = [
          s.jobDescription?.text,
          s.qualifications?.text,
          s.additionalInformation?.text,
        ]
          .filter(Boolean)
          .join("\n");
        return { ...post, __description: description || null, __applyUrl: d?.applyUrl ?? d?.postingUrl ?? null };
      },
    );

    return detailed.map((r, i) => (r.ok ? r.value : out[i]));
  },

  normalize(raw, { company }) {
    const loc = raw.location ?? {};
    const level = LEVEL_MAP[raw.experienceLevel?.id] ?? null;
    const isInternship = level === "internship";

    // The listing endpoint omits the description; `ref` points at the full
    // posting, which is also the page a candidate should land on.
    const applyUrl =
      raw.__applyUrl ||
      raw.ref ||
      `https://jobs.smartrecruiters.com/${company.ats_identifier}/${raw.id}`;

    return {
      externalId: String(raw.id),
      source: "smartrecruiters",
      sourceCompanyId: company.ats_identifier,
      title: raw.name,
      companyName: company.company_name,
      companyDomain: company.company_domain ?? null,
      rawLocation: [loc.city, loc.region, loc.country === "in" ? "India" : loc.country]
        .filter(Boolean)
        .join(", "),
      city: null,
      country: loc.country === "in" ? "India" : null,
      department: [raw.department?.label, raw.function?.label]
        .filter(Boolean)
        .join(", "),
      employmentType: isInternship
        ? "Internship"
        : (raw.typeOfEmployment?.label ?? null),
      // Trust the employer's own structured level over prose parsing.
      experienceLevel: level,
      experienceMin: isInternship ? 0 : level === "0-2" ? 0 : null,
      experienceMax: isInternship ? 1 : level === "0-2" ? 2 : null,
      description: raw.__description ?? null,
      applyUrl,
      sourceUrl: applyUrl,
      postedAt: raw.releasedDate ?? null,
      remoteHint: loc.remote === true,
      workplaceType: loc.remote ? "remote" : loc.hybrid ? "hybrid" : null,
      techStack: [],
      sourceMetadata: {
        refNumber: raw.refNumber ?? null,
        industry: raw.industry?.label ?? null,
        experienceLevelRaw: raw.experienceLevel?.id ?? null,
      },
    };
  },
};

export default smartrecruiters;
