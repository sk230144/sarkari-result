import { fetchText } from "../services/http.js";

/**
 * Wipro careers — read from the XML sitemap the site publishes for
 * crawlers and advertises in its own robots.txt.
 *
 * Permission basis: careers.wipro.com/robots.txt disallows ten paths
 * (/applybutton/, /talentcommunity/, /services/, …) and none of them cover
 * /job/ or the sitemap. No AI/LLM crawler is blocked. One request per sync
 * reads every posting, so this is far lighter on their servers than paging
 * a search UI.
 *
 * Every field comes from the URL slug — no page fetching, no HTML parsing:
 *   /job/{City}-{TITLE}-{COUNTRY}-{postcode}/{id}/
 */
const SITEMAP = "https://careers.wipro.com/sitemap.xml";

/**
 * Wipro tags roles L0-L4. These are internal complexity bands, not years of
 * experience: L1 covers both "Technical Lead" and "Solution Architect",
 * while L4 includes plain "Developer". Only L0 is unambiguous — it holds the
 * apprentice and trainee postings.
 *
 * Everything else is left unlabelled rather than guessed, per §2.2 ("do not
 * infer missing job facts; store null/unknown"). The title heuristic in the
 * shared classifier still applies "Senior"/"Lead" where the title says so.
 */
const GRADE_LEVELS = {
  L0: { level: "0-2", min: 0, max: 2 },
};

/** Country codes that appear in the slug; only IND is kept downstream. */
const COUNTRY_CODES =
  /-(IND|USA|SGP|GBR|PHL|DEU|BRA|MEX|CHN|AUS|CAN|POL|ROU|JPN|MYS|IDN|VNM|ZAF|ARE|SAU)(?=-|$)/;

export const wipro = {
  key: "wipro",
  isCompleteInventory: true,

  async fetchJobs() {
    const xml = await fetchText(SITEMAP);
    const out = [];

    // <url><loc>…</loc><lastmod>…</lastmod></url>
    const re = /<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      const loc = m[1];
      const lastmod = m[2] ?? null;

      const parts = loc.match(/\/job\/([^/]+)\/(\d+)\/?$/);
      if (!parts) continue;

      const slug = decodeURIComponent(parts[1]);
      // Skip non-India rows here rather than downstream: the sitemap holds
      // ~5,800 postings worldwide and only ~4,500 are Indian.
      const country = slug.match(COUNTRY_CODES)?.[1];
      if (country !== "IND") continue;

      out.push({ url: loc, slug, id: parts[2], lastmod });
    }
    return out;
  },

  normalize(raw, { company }) {
    // "Bengaluru-TEST-ENGINEER-L3-IND-560035"
    //  ^city   ^title            ^grade ^country ^postcode
    const segments = raw.slug.split("-");
    const city = segments[0];

    const countryIdx = segments.findIndex((s) => s === "IND");
    const titleParts = segments.slice(1, countryIdx === -1 ? undefined : countryIdx);

    // A trailing L0-L4 is a grade, not part of the job title.
    let grade = null;
    const last = titleParts[titleParts.length - 1];
    if (last && /^L[0-4](\(.*\))?$/.test(last)) {
      grade = last.slice(0, 2);
      titleParts.pop();
    }

    const title = titleParts
      .join(" ")
      .replace(/\s*\(\s*CONTRACT\s*\)\s*/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const g = grade ? GRADE_LEVELS[grade] : null;
    const isContract = /\(CONTRACT\)/i.test(raw.slug);

    return {
      externalId: raw.id,
      source: "wipro",
      sourceCompanyId: "wipro",
      // Slugs are upper-case; title-case reads properly in a listing.
      title: toTitleCase(title),
      companyName: company.company_name,
      companyDomain: company.company_domain ?? null,
      rawLocation: `${city}, India`,
      city: null,
      country: "India",
      department: "",
      employmentType: isContract ? "Contract" : "Full-time",
      experienceLevel: g?.level ?? null,
      experienceMin: g?.min ?? null,
      experienceMax: g?.max ?? null,
      // The sitemap carries no description; the apply page has the detail.
      description: null,
      applyUrl: raw.url,
      sourceUrl: raw.url,
      postedAt: raw.lastmod ? new Date(raw.lastmod).toISOString() : null,
      techStack: [],
      sourceMetadata: { grade, contract: isContract },
    };
  },
};

function toTitleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase())
    // Keep common acronyms upper-case.
    .replace(/\b(Sap|Aws|Sre|Qa|Ui|Ux|Api|Etl|Bi|It|Hr|Erp|Crm)\b/g, (x) =>
      x.toUpperCase(),
    );
}

export default wipro;
