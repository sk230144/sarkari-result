import {
  INDIA_TERMS,
  CITY_ALIASES,
  GLOBAL_REMOTE_TERMS,
  EXCLUSION_PATTERNS,
  REMOTE_SCOPE_EXCLUSIONS,
  FOREIGN_LOCATION_TERMS,
} from "../config/filters.js";

const norm = (s) => (s || "").toLowerCase().trim();

/** Word-boundary match, so "asia" doesn't fire inside "Malaysia". */
function hasTerm(haystack, term) {
  if (!haystack) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, "i").test(haystack);
}

export function findIndiaCity(text) {
  const t = norm(text);
  for (const term of INDIA_TERMS) {
    if (term !== "india" && hasTerm(t, term)) {
      return CITY_ALIASES[term] ?? term.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  return null;
}

/** §6.3 — an explicit exclusion beats any generic "remote" wording. */
export function hasIndiaExclusion(text) {
  if (!text) return false;
  return EXCLUSION_PATTERNS.some((re) => re.test(text));
}

/**
 * Decides whether a job is visible to an Indian reader, and how to label it.
 *
 * Precedence follows §6.3: structured country fields beat text heuristics,
 * and explicit exclusions beat everything. When the answer is genuinely
 * unclear the job becomes remote-unknown rather than a guess (§6.3).
 *
 * @returns {{allowed: boolean, remoteType: string, city: string|null,
 *            needsReview: boolean, reason: string}}
 */
export function classifyIndiaEligibility(job) {
  const locationText = [job.city, job.state, job.country, job.rawLocation]
    .filter(Boolean)
    .join(", ");
  const loc = norm(locationText);
  // Only the opening of a description carries eligibility wording; scanning
  // the whole body produces false positives from unrelated boilerplate.
  const descHead = norm((job.description || "").slice(0, 1200));
  const title = norm(job.title);

  const exclusionText = `${title} ${loc} ${descHead}`;
  const excluded = hasIndiaExclusion(exclusionText);

  // Titles that name their own location — "Senior Support Engineer - Toronto",
  // "AI Support Engineer, Government - Washington, D.C.". The suffix is the
  // posting's real location even when the location field is vague.
  const titleNamesForeignCity =
    !/\bindia\b/i.test(title) &&
    FOREIGN_LOCATION_TERMS.some((term) => hasTerm(title, term));

  // --- structured signals first (§6.3) ---
  const countryIsIndia =
    norm(job.country) === "india" ||
    norm(job.country) === "in" ||
    /\bindia\b/i.test(loc);

  const city = findIndiaCity(locationText);
  // "Worldwide" or "Anywhere" as the whole location is a remote role even
  // when the word "remote" never appears.
  const globallyScoped = GLOBAL_REMOTE_TERMS.some((term) => hasTerm(loc, term));

  /**
   * A named foreign city anchors the role there regardless of any remote
   * flag. Ashby sets isRemote: true on every Replit posting while the
   * location reads "Foster City, CA" — trusting the flag would treat a
   * Californian hybrid job as globally remote.
   */
  const foreignAnchor =
    !countryIsIndia &&
    !city &&
    (titleNamesForeignCity ||
      FOREIGN_LOCATION_TERMS.some((term) => hasTerm(loc, term)));

  const saysRemote =
    !foreignAnchor &&
    (job.remoteHint === true ||
      /\bremote\b/i.test(title) ||
      /\bremote\b/i.test(loc) ||
      norm(job.workplaceType) === "remote" ||
      globallyScoped);

  // --- India-located roles ---
  // Checked before any regional exclusion: a posting listing both
  // "Bengaluru" and "Remote US" is open to India, and §6.3 puts structured
  // location above text heuristics.
  if (countryIsIndia || city) {
    if (saysRemote) {
      return {
        allowed: true,
        remoteType: "remote-india",
        city,
        needsReview: false,
        reason: "india-remote",
      };
    }
    const hybrid = /\bhybrid\b/i.test(`${title} ${loc} ${descHead}`);
    return {
      allowed: true,
      remoteType: hybrid ? "hybrid" : "onsite",
      city,
      needsReview: false,
      reason: hybrid ? "india-hybrid" : "india-onsite",
    };
  }

  // --- not located in India: only remote roles can still qualify ---
  if (!saysRemote) {
    return {
      allowed: false,
      remoteType: "onsite",
      city: null,
      needsReview: false,
      reason: "non-india-location",
    };
  }

  // "US-Remote", "Remote (EMEA)" — the location field itself scopes the
  // role to a region India isn't in.
  if (REMOTE_SCOPE_EXCLUSIONS.some((re) => re.test(locationText))) {
    return {
      allowed: false,
      remoteType: "remote-global",
      city: null,
      needsReview: false,
      reason: "geo-restricted-scope",
    };
  }

  if (excluded) {
    return {
      allowed: false,
      remoteType: "remote-global",
      city: null,
      needsReview: false,
      reason: "geo-restricted",
    };
  }

  if (globallyScoped) {
    return {
      allowed: true,
      remoteType: "remote-global",
      city: null,
      needsReview: false,
      reason: "remote-worldwide",
    };
  }

  // A named foreign city with no India option and no worldwide scope is a
  // local role abroad, not an unclear one — reject rather than queue it for
  // review. Without this, feeds that omit the country (Ashby returns a bare
  // "San Francisco") flood the review queue.
  if (
    titleNamesForeignCity ||
    FOREIGN_LOCATION_TERMS.some((term) => hasTerm(loc, term))
  ) {
    return {
      allowed: false,
      remoteType: "onsite",
      city: null,
      needsReview: false,
      reason: "foreign-location",
    };
  }

  // Remote, no stated restriction, no stated worldwide scope. §6.3 says
  // prefer remote-unknown over guessing, and keep it out of the default feed.
  return {
    allowed: true,
    remoteType: "remote-unknown",
    city: null,
    needsReview: true,
    reason: "remote-unclear",
  };
}
