import { fetchJson } from "../services/http.js";

/**
 * Greenhouse job board API (§13.1).
 * GET boards-api.greenhouse.io/v1/boards/{boardToken}/jobs?content=true
 *
 * A company's board is its complete published inventory, so a job that
 * disappears from it is meaningful evidence of closure (§11.2).
 */
export const greenhouse = {
  key: "greenhouse",
  isCompleteInventory: true,

  async fetchJobs({ company }) {
    const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
      company.ats_identifier,
    )}/jobs?content=true`;
    const data = await fetchJson(url);
    return Array.isArray(data?.jobs) ? data.jobs : [];
  },

  normalize(raw, { company }) {
    const offices = (raw.offices ?? []).map((o) => o.name).filter(Boolean);
    const departments = (raw.departments ?? []).map((d) => d.name).filter(Boolean);

    return {
      externalId: String(raw.id),
      source: "greenhouse",
      sourceCompanyId: company.ats_identifier,
      title: raw.title,
      companyName: company.company_name,
      companyDomain: company.company_domain ?? null,
      rawLocation: raw.location?.name ?? offices.join(", ") ?? null,
      city: null,
      country: null,
      department: departments.join(", "),
      // Greenhouse returns the description HTML-escaped inside `content`.
      description: decodeEntities(raw.content ?? ""),
      applyUrl: raw.absolute_url,
      sourceUrl: raw.absolute_url,
      postedAt: raw.updated_at ?? raw.first_published ?? null,
      techStack: [],
      sourceMetadata: {
        offices,
        departments,
        requisition_id: raw.requisition_id ?? null,
      },
    };
  },

  /** §11.3 — a 404 from the canonical listing is closure evidence. */
  async verify(job) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(
        job.source_company_id,
      )}/jobs/${encodeURIComponent(job.external_id)}`;
      await fetchJson(url);
      return "active";
    } catch (err) {
      if (err.status === 404 || err.status === 410) return "closed";
      return "unknown";
    }
  },
};

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export default greenhouse;
