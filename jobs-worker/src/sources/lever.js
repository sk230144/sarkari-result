import { fetchJson } from "../services/http.js";

/**
 * Lever postings API (§13.2).
 * GET api.lever.co/v0/postings/{site}?mode=json
 */
export const lever = {
  key: "lever",
  isCompleteInventory: true,

  async fetchJobs({ company }) {
    const url = `https://api.lever.co/v0/postings/${encodeURIComponent(
      company.ats_identifier,
    )}?mode=json`;
    const data = await fetchJson(url);
    return Array.isArray(data) ? data : [];
  },

  normalize(raw, { company }) {
    const c = raw.categories ?? {};
    return {
      externalId: String(raw.id),
      source: "lever",
      sourceCompanyId: company.ats_identifier,
      title: raw.text,
      companyName: company.company_name,
      companyDomain: company.company_domain ?? null,
      rawLocation: c.location ?? null,
      city: null,
      country: null,
      department: [c.department, c.team].filter(Boolean).join(", "),
      employmentType: c.commitment ?? null,
      // `descriptionHtml` is the body; `lists` holds the bulleted sections.
      description: [
        raw.descriptionHtml ?? raw.description ?? "",
        ...(raw.lists ?? []).map(
          (l) => `<h3>${l.text ?? ""}</h3><ul>${l.content ?? ""}</ul>`,
        ),
        raw.additionalHtml ?? "",
      ]
        .filter(Boolean)
        .join(""),
      applyUrl: raw.applyUrl || raw.hostedUrl,
      sourceUrl: raw.hostedUrl || raw.applyUrl,
      postedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
      // Lever exposes a workplace type on newer postings.
      workplaceType: raw.workplaceType ?? null,
      remoteHint: /remote/i.test(c.location ?? "") || raw.workplaceType === "remote",
      techStack: [],
      sourceMetadata: {
        team: c.team ?? null,
        commitment: c.commitment ?? null,
        allLocations: raw.categories?.allLocations ?? null,
      },
    };
  },

  async verify(job) {
    try {
      const url = `https://api.lever.co/v0/postings/${encodeURIComponent(
        job.source_company_id,
      )}/${encodeURIComponent(job.external_id)}`;
      await fetchJson(url);
      return "active";
    } catch (err) {
      if (err.status === 404 || err.status === 410) return "closed";
      return "unknown";
    }
  },
};

export default lever;
