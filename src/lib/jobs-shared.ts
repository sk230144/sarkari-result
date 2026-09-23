/**
 * Types and labels shared by the server query layer and the client filter
 * UI. This file must stay free of any database or secret access — the
 * server-only half lives in `jobs.ts`.
 */

export type RemoteType =
  | "onsite"
  | "hybrid"
  | "remote-india"
  | "remote-global"
  | "remote-unknown";

export type Job = {
  id: string;
  title: string;
  company_name: string;
  company_domain: string | null;
  role_category: string | null;
  experience_min: number | null;
  experience_max: number | null;
  experience_level: string | null;
  city: string | null;
  country: string | null;
  remote_type: RemoteType;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  tech_stack: string[];
  apply_url: string;
  source: string;
  source_posted_at: string | null;
  first_seen_at: string;
};

export type JobFilters = {
  q?: string;
  category?: string;
  city?: string;
  remote?: string;
  experience?: string;
  page?: number;
};

export const PAGE_SIZE = 20;

/** Facet values the UI offers, with the labels readers actually recognise. */
export const CATEGORY_LABELS: Record<string, string> = {
  software: "Software",
  backend: "Backend",
  frontend: "Frontend",
  fullstack: "Full Stack",
  devops: "DevOps / SRE",
  data: "Data",
  "ai-ml": "AI / ML",
  mobile: "Mobile",
  qa: "QA",
  security: "Security",
  product: "Product",
  design: "Design",
};

export const REMOTE_LABELS: Record<string, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  "remote-india": "Remote (India)",
  "remote-global": "Remote (Global)",
};

export const EXPERIENCE_LABELS: Record<string, string> = {
  internship: "Internship / Trainee",
  "0-2": "Fresher · 0–2 years",
  "2-5": "2–5 years",
  "5+": "5+ years",
};

export type JobsResult = {
  jobs: Job[];
  total: number;
  page: number;
  pageCount: number;
  /** Null when the database is reachable; a message when it is not. */
  error: string | null;
};
