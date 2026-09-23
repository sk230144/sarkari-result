/**
 * Starter ATS registry (§4).
 *
 * Every entry here was probed live and returned a valid feed containing at
 * least one India-located or India-eligible remote role. The seed script
 * re-validates each one before saving, so a board that has since moved or
 * closed is skipped rather than stored as a permanently failing source.
 *
 * permission_status stays 'unverified' until someone confirms redistribution
 * rights for that employer — a reachable endpoint is not permission (§3.1).
 *
 * Grow this list via the monthly discovery workflow in §4.1.
 */
export const SEED_COMPANIES = [
  // ---- Greenhouse ----
  { company_name: "Stripe", ats_provider: "greenhouse", ats_identifier: "stripe", company_domain: "stripe.com" },
  { company_name: "Databricks", ats_provider: "greenhouse", ats_identifier: "databricks", company_domain: "databricks.com" },
  { company_name: "MongoDB", ats_provider: "greenhouse", ats_identifier: "mongodb", company_domain: "mongodb.com" },
  { company_name: "Okta", ats_provider: "greenhouse", ats_identifier: "okta", company_domain: "okta.com" },
  { company_name: "GitLab", ats_provider: "greenhouse", ats_identifier: "gitlab", company_domain: "gitlab.com" },
  { company_name: "HackerRank", ats_provider: "greenhouse", ats_identifier: "hackerrank", company_domain: "hackerrank.com" },
  { company_name: "Elastic", ats_provider: "greenhouse", ats_identifier: "elastic", company_domain: "elastic.co" },
  { company_name: "Twilio", ats_provider: "greenhouse", ats_identifier: "twilio", company_domain: "twilio.com" },
  { company_name: "New Relic", ats_provider: "greenhouse", ats_identifier: "newrelic", company_domain: "newrelic.com" },
  { company_name: "Druva", ats_provider: "greenhouse", ats_identifier: "druva", company_domain: "druva.com" },
  { company_name: "Datadog", ats_provider: "greenhouse", ats_identifier: "datadog", company_domain: "datadoghq.com" },
  { company_name: "Groww", ats_provider: "greenhouse", ats_identifier: "groww", company_domain: "groww.in" },
  { company_name: "Airbnb", ats_provider: "greenhouse", ats_identifier: "airbnb", company_domain: "airbnb.com" },
  { company_name: "Sumo Logic", ats_provider: "greenhouse", ats_identifier: "sumologic", company_domain: "sumologic.com" },
  { company_name: "Observe.AI", ats_provider: "greenhouse", ats_identifier: "observeai", company_domain: "observe.ai" },
  { company_name: "LaunchDarkly", ats_provider: "greenhouse", ats_identifier: "launchdarkly", company_domain: "launchdarkly.com" },
  { company_name: "Chainguard", ats_provider: "greenhouse", ats_identifier: "chainguard", company_domain: "chainguard.dev" },
  { company_name: "Amplitude", ats_provider: "greenhouse", ats_identifier: "amplitude", company_domain: "amplitude.com" },
  { company_name: "Vercel", ats_provider: "greenhouse", ats_identifier: "vercel", company_domain: "vercel.com" },
  // India-heavy engineering orgs — these post more mid and junior roles
  // than the US enterprise boards above, which skew senior.
  { company_name: "Zscaler", ats_provider: "greenhouse", ats_identifier: "zscaler", company_domain: "zscaler.com" },
  { company_name: "Rubrik", ats_provider: "greenhouse", ats_identifier: "rubrik", company_domain: "rubrik.com" },
  { company_name: "Netradyne", ats_provider: "greenhouse", ats_identifier: "netradyne", company_domain: "netradyne.com" },
  { company_name: "InMobi", ats_provider: "greenhouse", ats_identifier: "inmobi", company_domain: "inmobi.com" },

  // ---- Lever ----
  { company_name: "Meesho", ats_provider: "lever", ats_identifier: "meesho", company_domain: "meesho.com" },
  { company_name: "Zeta", ats_provider: "lever", ats_identifier: "zeta", company_domain: "zeta.tech" },
  { company_name: "Mindtickle", ats_provider: "lever", ats_identifier: "mindtickle", company_domain: "mindtickle.com" },
  // Indian product companies — these hire 1-5 year engineers in NCR and
  // Bengaluru, which the US enterprise boards above almost never do.
  { company_name: "Paytm", ats_provider: "lever", ats_identifier: "paytm", company_domain: "paytm.com" },

  // ---- Ashby ----
  { company_name: "OpenAI", ats_provider: "ashby", ats_identifier: "openai", company_domain: "openai.com" },
  { company_name: "Vanta", ats_provider: "ashby", ats_identifier: "vanta", company_domain: "vanta.com" },
  { company_name: "Ramp", ats_provider: "ashby", ats_identifier: "ramp", company_domain: "ramp.com" },
  { company_name: "Replit", ats_provider: "ashby", ats_identifier: "replit", company_domain: "replit.com" },
  { company_name: "PostHog", ats_provider: "ashby", ats_identifier: "posthog", company_domain: "posthog.com" },
  { company_name: "ClickUp", ats_provider: "ashby", ats_identifier: "clickup", company_domain: "clickup.com" },
  { company_name: "Sarvam AI", ats_provider: "ashby", ats_identifier: "sarvam", company_domain: "sarvam.ai" },
  { company_name: "Tekion", ats_provider: "ashby", ats_identifier: "tekion", company_domain: "tekion.com" },

  // ---- SmartRecruiters ----
  // These matter most for early-career supply: the API filters by country
  // server-side and returns the employer's own experienceLevel, so junior
  // roles are labelled rather than inferred.
  { company_name: "Bosch", ats_provider: "smartrecruiters", ats_identifier: "BoschGroup", company_domain: "bosch.com" },
  { company_name: "Continental", ats_provider: "smartrecruiters", ats_identifier: "Continental", company_domain: "continental.com" },
  { company_name: "Freshworks", ats_provider: "smartrecruiters", ats_identifier: "Freshworks", company_domain: "freshworks.com" },
  { company_name: "Swiggy", ats_provider: "smartrecruiters", ats_identifier: "Swiggy", company_domain: "swiggy.com" },
  { company_name: "Sutherland", ats_provider: "smartrecruiters", ats_identifier: "Sutherland", company_domain: "sutherlandglobal.com" },
  { company_name: "Unacademy", ats_provider: "smartrecruiters", ats_identifier: "Unacademy", company_domain: "unacademy.com" },

  // ---- Direct careers sitemap ----
  // Read from the XML sitemap Wipro publishes for crawlers and names in its
  // own robots.txt. One request covers ~4,600 India postings.
  { company_name: "Wipro", ats_provider: "wipro", ats_identifier: "wipro", company_domain: "wipro.com" },
];

/** §9.1 — provider rows, with the cadence and policy flags from §14.1. */
export const SEED_SOURCES = [
  {
    source_key: "greenhouse",
    source_type: "ats",
    sync_interval_minutes: 360,
    attribution_required: false,
    allow_redistribution: false,
    max_requests_per_run: 200,
  },
  {
    source_key: "lever",
    source_type: "ats",
    sync_interval_minutes: 360,
    attribution_required: false,
    allow_redistribution: false,
    max_requests_per_run: 200,
  },
  {
    source_key: "ashby",
    source_type: "ats",
    sync_interval_minutes: 360,
    attribution_required: false,
    allow_redistribution: false,
    max_requests_per_run: 200,
  },
  {
    source_key: "wipro",
    source_type: "sitemap",
    sync_interval_minutes: 360,
    attribution_required: false,
    allow_redistribution: false,
    // One sitemap request per run — lighter than paging their search UI.
    max_requests_per_run: 5,
  },
  {
    source_key: "smartrecruiters",
    source_type: "ats",
    sync_interval_minutes: 360,
    attribution_required: false,
    allow_redistribution: false,
    // Paged listing plus one detail call per posting — a 500-role employer
    // costs ~520 requests. Descriptions are worth it: without them a quarter
    // of listings carry no experience level at all.
    max_requests_per_run: 1200,
  },
];
