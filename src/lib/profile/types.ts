/** Shared by the editor, the public page and the API. No server imports. */
import type { CSSProperties } from "react";

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Education = {
  id: string;
  degree: string;
  school: string;
  location: string;
  end: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  url: string;
  stack: string[];
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

export const SECTION_KEYS = ["skills", "certifications", "experience", "socials", "projects"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  skills: "Skills & Technologies",
  certifications: "Certifications",
  experience: "Experience & Education",
  socials: "Social Profiles",
  projects: "Projects",
};

export type Layout = { order: SectionKey[]; hidden: SectionKey[] };

export const SOCIALS = [
  { key: "linkedin", label: "LinkedIn", color: "#0a66c2", host: "linkedin.com" },
  { key: "github", label: "GitHub", color: "#e6edf3", host: "github.com" },
  { key: "twitter", label: "Twitter / X", color: "#e6edf3", host: "x.com|twitter.com" },
  { key: "leetcode", label: "LeetCode", color: "#f89f1b", host: "leetcode.com" },
  { key: "codeforces", label: "Codeforces", color: "#1f8acb", host: "codeforces.com" },
  { key: "codechef", label: "CodeChef", color: "#b08968", host: "codechef.com" },
  { key: "gfg", label: "GeeksforGeeks", color: "#2f8d46", host: "geeksforgeeks.org" },
  { key: "dribbble", label: "Dribbble", color: "#ea4c89", host: "dribbble.com" },
  { key: "behance", label: "Behance", color: "#1769ff", host: "behance.net" },
  { key: "website", label: "Portfolio / Other", color: "#a3e635", host: "" },
] as const;
export type SocialKey = (typeof SOCIALS)[number]["key"];

export const APPLY_FIELDS = [
  { key: "phone", label: "Phone Number", hint: "Contact number for job applications" },
  { key: "linkedin", label: "LinkedIn URL", hint: "Your LinkedIn profile link" },
  { key: "portfolio", label: "Portfolio / Website", hint: "Personal site, portfolio, or blog" },
  { key: "years", label: "Years of Experience", hint: "Total professional experience" },
  { key: "salary", label: "Desired Salary", hint: "Expected compensation, e.g. 12 LPA" },
] as const;
export type ApplyKey = (typeof APPLY_FIELDS)[number]["key"];

export const BANNERS: Record<string, string> = {
  lime: "linear-gradient(135deg,#16210f 0%,#1f3a14 45%,#0d110d 100%)",
  ocean: "linear-gradient(135deg,#0e1726 0%,#1e3a5f 50%,#0b0e14 100%)",
  violet: "linear-gradient(135deg,#181231 0%,#3b2f5c 50%,#0e0b16 100%)",
  ember: "linear-gradient(135deg,#2a1509 0%,#5c2f16 50%,#140b07 100%)",
  slate: "linear-gradient(135deg,#1a1d1a 0%,#2f363d 50%,#0e1114 100%)",
};

export type Theme = "midnight" | "daylight";

/** Everything the owner edits. */
export type ProfileData = {
  slug: string;
  fullName: string;
  email: string;
  headline: string;
  location: string;
  summary: string;
  openToWork: boolean;
  isPublic: boolean;
  avatarUrl: string | null;
  banner: string;
  /** Custom uploaded banner; when set it is shown instead of the gradient. */
  bannerUrl: string | null;
  githubUsername: string;
  socials: Partial<Record<SocialKey, string>>;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  layout: Layout;
  theme: Theme;
  applyDetails: Partial<Record<ApplyKey, string>>;
  resume: { path: string | null; filename: string | null; uploadedAt: string | null; importedAt: string | null };
};

export type Endorsement = {
  id: string;
  authorName: string;
  authorHeadline: string | null;
  relationship: string;
  body: string;
  createdAt: string;
};

export const RELATIONSHIPS = [
  "Worked together",
  "Managed them",
  "Reported to them",
  "Studied together",
  "Mentored them",
  "Collaborated on a project",
];

export type Message = {
  id: string;
  senderName: string;
  senderEmail: string;
  body: string;
  read: boolean;
  createdAt: string;
};

/** Owner-only extras shown in the editor. */
export type ProfileExtras = {
  views: { total: number; last7: number; last30: number; daily: { day: string; count: number }[] };
  endorsements: Endorsement[];
  messages: Message[];
  referrals: number;
};

export type ProfileResponse = { profile: ProfileData; extras: ProfileExtras };

/** Public page payload: never includes email, apply details or resume. */
export type PublicProfile = Omit<ProfileData, "email" | "applyDetails" | "resume" | "isPublic"> & {
  id: string;
  endorsements: Endorsement[];
};

export const DEFAULT_LAYOUT: Layout = { order: [...SECTION_KEYS], hidden: [] };

export type GithubCalendar = {
  username: string;
  total: number;
  days: { date: string; level: number; count: number }[];
};

/* ----------------------------------------------------- skill grouping */

const GROUPS: [string, string[]][] = [
  [
    "Languages",
    ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "PHP", "Ruby", "Kotlin", "Swift", "Rust", "Dart", "SQL", "HTML", "CSS", "R", "Scala", "Bash"],
  ],
  [
    "Frameworks & Libraries",
    ["React", "Next.js", "Node.js", "Express", "Vue.js", "Angular", "Redux", "React Native", "Flutter", "Django", "Flask", "FastAPI", "Spring Boot", "Tailwind CSS", "Bootstrap", "jQuery", ".NET", "Laravel", "Svelte", "Three.js", "GSAP", "NestJS", "Pandas", "NumPy", "TensorFlow", "PyTorch"],
  ],
  [
    "Tools & Platforms",
    ["Git", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Firebase", "Supabase", "Linux", "Jenkins", "CI/CD", "Figma", "Postman", "Kafka", "Vercel", "Netlify", "Nginx", "GraphQL", "WordPress"],
  ],
];

const GROUP_OF = new Map<string, string>();
for (const [g, items] of GROUPS) for (const i of items) GROUP_OF.set(i.toLowerCase(), g);

export function groupSkills(skills: string[]): { label: string; items: string[] }[] {
  const out = new Map<string, string[]>([
    ["Languages", []],
    ["Frameworks & Libraries", []],
    ["Tools & Platforms", []],
    ["Other", []],
  ]);
  for (const s of skills) out.get(GROUP_OF.get(s.toLowerCase()) ?? "Other")!.push(s);
  return [...out.entries()].filter(([, v]) => v.length).map(([label, items]) => ({ label, items }));
}

const SKILL_COLORS: Record<string, string> = {
  javascript: "#f7df1e", typescript: "#3178c6", python: "#3776ab", java: "#e76f00", php: "#8892bf",
  html: "#e34f26", css: "#2965f1", react: "#61dafb", "react native": "#61dafb", "next.js": "#e6edf3",
  "node.js": "#539e43", redux: "#764abc", mysql: "#00758f", postgresql: "#336791", mongodb: "#47a248",
  git: "#f05032", docker: "#2496ed", aws: "#ff9900", "tailwind css": "#38bdf8", go: "#00add8",
  "c++": "#00599c", redis: "#dc382d", graphql: "#e10098", figma: "#a259ff", kubernetes: "#326ce5",
};

/** Stable brand-ish dot color per skill; unknown skills get a hashed hue. */
export function skillColor(skill: string): string {
  const known = SKILL_COLORS[skill.toLowerCase()];
  if (known) return known;
  let h = 0;
  for (const ch of skill) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 60% 55%)`;
}

/** Only http(s) links are ever rendered, whatever is stored. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/** CSS background for a banner: the uploaded image if any, else the preset gradient. */
export function bannerBackground(p: { banner: string; bannerUrl: string | null }): CSSProperties {
  const safe = p.bannerUrl ? safeUrl(p.bannerUrl) : null;
  return safe
    ? { backgroundImage: `url("${safe.replace(/"/g, "%22")}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: BANNERS[p.banner] ?? BANNERS.lime };
}

export function publicProfileUrl(origin: string, slug: string) {
  return `${origin.replace(/\/$/, "")}/u/${slug}`;
}
