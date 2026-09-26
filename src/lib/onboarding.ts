/** Options for the post-signup onboarding. Shared by the page and the API. */

export const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Singapore",
  "United Arab Emirates", "Netherlands", "Ireland", "France", "Japan", "Nepal", "Bangladesh",
  "Sri Lanka", "Pakistan", "Saudi Arabia", "Qatar", "Malaysia", "New Zealand", "Sweden",
  "Switzerland", "Poland", "Spain", "Italy", "Israel", "South Africa", "Brazil", "Mexico",
  "Indonesia", "Philippines", "Vietnam", "South Korea", "China", "Other",
];

export const STAGES = [
  {
    key: "active",
    title: "Active Job Seeker",
    body: "I am actively looking for new opportunities and want to find a role within the next six months.",
  },
  {
    key: "passive",
    title: "Passive Job Seeker",
    body: "I am open to opportunities that can take me to the next level or offer an interesting career transition.",
  },
  {
    key: "not_looking",
    title: "Not a Job Seeker",
    body: "I am not currently seeking new opportunities but want to take advantage of career-enhancing tools.",
  },
] as const;
export type Stage = (typeof STAGES)[number]["key"];

export const CHALLENGES = [
  "Writing/Tailoring my Resume",
  "ATS Resume Optimization",
  "Application Tracking & Management",
  "Not getting interview calls",
  "Networking",
  "Career Transition Support",
  "Negotiation",
  "Cover Letter Writing",
  "Mock Interview Prep",
  "Optimizing my LinkedIn",
  "DSA & Coding Prep",
  "Other",
];

export const SOURCES = [
  "LinkedIn", "Instagram", "YouTube", "Google Search", "Friend/colleague", "School/College", "Employer", "Other",
];

export type OnboardingState = {
  name: string;
  country: string | null;
  phone: string;
  consent: boolean;
  stage: Stage | null;
  challenges: string[];
  source: string | null;
  resume: { filename: string | null; uploadedAt: string | null } | null;
  onboardedAt: string | null;
};

/** Which tools to recommend for the challenges picked. */
export const TOOL_FOR_CHALLENGE: Record<string, string> = {
  "Writing/Tailoring my Resume": "resume",
  "ATS Resume Optimization": "resume",
  "Not getting interview calls": "resume",
  "Cover Letter Writing": "letter",
  "Mock Interview Prep": "interview",
  "Negotiation": "interview",
  "DSA & Coding Prep": "prep",
  "Career Transition Support": "prep",
  "Optimizing my LinkedIn": "portfolio",
  "Networking": "portfolio",
  "Application Tracking & Management": "tasks",
};
