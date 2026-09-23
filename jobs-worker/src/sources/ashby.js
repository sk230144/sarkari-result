import { fetchJson } from "../services/http.js";

/**
 * Ashby public job board API (§13.3).
 * GET api.ashbyhq.com/posting-api/job-board/{boardName}
 */
export const ashby = {
  key: "ashby",
  isCompleteInventory: true,

  async fetchJobs({ company }) {
    const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(
      company.ats_identifier,
    )}?includeCompensation=true`;
    const data = await fetchJson(url);
    return Array.isArray(data?.jobs) ? data.jobs : [];
  },

  normalize(raw, { company }) {
    const secondary = (raw.secondaryLocations ?? [])
      .map((l) => l?.location ?? l)
      .filter((v) => typeof v === "string");

    return {
      externalId: String(raw.id ?? raw.jobId ?? raw.jobUrl),
      source: "ashby",
      sourceCompanyId: company.ats_identifier,
      title: raw.title,
      companyName: company.company_name,
      companyDomain: company.company_domain ?? null,
      // Ashby splits primary and secondary locations; a role open in
      // Bengaluru as a secondary location still counts as India-eligible.
      rawLocation: [raw.location, ...secondary].filter(Boolean).join(", "),
      city: null,
      country: null,
      department: [raw.department, raw.team].filter(Boolean).join(", "),
      employmentType: raw.employmentType ?? null,
      description: raw.descriptionHtml ?? raw.descriptionPlain ?? null,
      applyUrl: raw.applyUrl || raw.jobUrl,
      sourceUrl: raw.jobUrl || raw.applyUrl,
      postedAt: raw.publishedAt ?? raw.updatedAt ?? null,
      remoteHint: raw.isRemote === true,
      workplaceType: raw.isRemote ? "remote" : null,
      salaryMin: raw.compensation?.scrapeableCompensationSalarySummary
        ? null
        : (raw.compensation?.summaryComponents?.[0]?.minValue ?? null),
      salaryMax: raw.compensation?.summaryComponents?.[0]?.maxValue ?? null,
      salaryCurrency:
        raw.compensation?.summaryComponents?.[0]?.currencyCode ?? null,
      techStack: [],
      sourceMetadata: {
        team: raw.team ?? null,
        secondaryLocations: secondary,
        isListed: raw.isListed ?? null,
      },
    };
  },
};

export default ashby;
