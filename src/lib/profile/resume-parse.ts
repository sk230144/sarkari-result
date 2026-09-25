import { canonicalSkill } from "@/lib/analyzer/match";
import { SKILL_SYNONYMS } from "@/lib/analyzer/config";
import { SOCIALS, type Certification, type Education, type Experience, type Project, type SocialKey } from "./types";

/**
 * Turns resume text into profile sections with plain rules, no AI.
 * It reads section headings, date ranges and `|`-separated lines, and
 * re-joins bullets that the PDF wrapped across lines. Anything it gets
 * wrong the user fixes in the editor.
 */

type Section = "header" | "summary" | "experience" | "projects" | "skills" | "education" | "certifications" | "other";

const HEADINGS: [Section, RegExp][] = [
  ["summary", /^(summary|profile|professional summary|profile summary|about|about me|objective|career objective)$/i],
  ["experience", /^(experience|work experience|professional experience|employment|employment history|work history|internships?|internship experience)$/i],
  ["projects", /^(projects|personal projects|academic projects|key projects|side projects)$/i],
  ["skills", /^(skills|technical skills|key skills|core skills|skills & tools|tech stack|technologies|technical expertise)$/i],
  ["education", /^(education|academic background|academics|academic qualifications?|qualifications?)$/i],
  ["certifications", /^(certifications?|certificates?|courses|courses & certifications|licenses & certifications)$/i],
  ["other", /^(coding profiles|profiles|links|achievements|awards|honors|languages|hobbies|interests|activities|extra[- ]?curricular activities|publications|references|declaration|personal details|personal information|contact|contact me)$/i],
];

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const DATE = `(?:\\d{1,2}[/.-]\\d{4}|${MONTH}\\s*,?\\s*\\d{4}|\\d{4})`;
const RANGE = new RegExp(`(${DATE})\\s*(?:-|–|—|to)\\s*(${DATE}|present|current|now|ongoing|till date)`, "i");
const YEAR = /\b(19|20)\d{2}\b/;
const BULLET = /^[•●▪◦■□➢►▶✓✔\-*–—·‣⁃]\s*/;
const NUMBERED = /^\d{1,2}[.)]\s+/;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /\+?\d[\d\s-]{8,}\d/;
const URL_IN_TEXT = /\b(?:https?:\/\/|www\.)[^\s|,;()<>]+|\b(?:linkedin\.com|github\.com|leetcode\.com|codeforces\.com|codechef\.com|geeksforgeeks\.org|dribbble\.com|behance\.net|x\.com|twitter\.com)\/[^\s|,;()<>]+/gi;
const ACTION_VERB =
  /\b(Created|Built|Developed|Designed|Implemented|Engineered|Launched|Deployed|Architected|Crafted|Automated|Integrated|Made|Wrote|Led|Programmed|Coded|Constructed|Established|Published|Contributed)\b/;
const DEGREE =
  /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|bca|mca|mba|bba|b\.?\s?com|m\.?\s?com|bachelor|master|ph\.?\s?d|diploma|intermediate|high school|higher secondary|senior secondary|secondary|12th|10th|hsc|ssc|engineering|computer science|information technology)\b/i;
const SCHOOL = /\b(university|college|institute|school|academy|iit|nit|iiit|vidyalaya)\b/i;

function sectionOf(line: string): Section | null {
  const t = line.replace(/[:\s]+$/, "").trim();
  if (!t || t.length > 40) return null;
  for (const [s, re] of HEADINGS) if (re.test(t)) return s;
  return null;
}

function titleCase(s: string): string {
  // Only rewrite shouting ("SONBHADRA, UTTAR PRADESH"); leave mixed case alone.
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Joins lines the PDF wrapped: a line continues the previous unless the previous ended a sentence. */
function joinWrapped(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const bulleted = BULLET.test(raw) || NUMBERED.test(raw);
    const line = raw.replace(BULLET, "").trim();
    if (!line) continue;
    const prev = out[out.length - 1];
    const continues =
      prev !== undefined && !bulleted && (!/[.!?:]$/.test(prev) || /^[a-z(,&]/.test(line));
    if (continues) out[out.length - 1] = `${prev} ${line}`;
    else out.push(line);
  }
  return out;
}

function splitParts(s: string): string[] {
  return s
    .split(/\s*\|\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------ sections */

function parseExperience(lines: string[]): Experience[] {
  const out: Experience[] = [];
  let current: Experience | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const range = raw.match(RANGE);

    if (range) {
      const withoutDates = raw.replace(range[0], " ").replace(/\s*\|\s*\|\s*/g, " | ");
      let parts = splitParts(withoutDates).filter((p) => !/^[-–—,\s]*$/.test(p));
      if (parts.length === 1 && !raw.includes("|")) {
        parts = parts[0].split(/\s+(?:at|@)\s+|\s+[-–—]\s+|,\s+/).map((p) => p.trim()).filter(Boolean);
      }
      // Date on its own line: the title is the line above, which was
      // wrongly taken as a bullet of the previous entry.
      if (!parts.length && current?.bullets.length) {
        const title = current.bullets.pop()!;
        parts = splitParts(title);
        if (parts.length === 1) parts = title.split(/\s+(?:at|@)\s+|\s+[-–—]\s+|,\s+/);
      }
      current = {
        id: crypto.randomUUID(),
        role: parts[0] ?? "",
        company: parts[1] ?? "",
        location: parts.slice(2).join(", "),
        start: range[1].trim(),
        end: titleCase(range[2].trim()),
        bullets: [],
      };
      out.push(current);
      continue;
    }

    if (!current) continue;
    const bulleted = BULLET.test(raw);
    const text = raw.replace(BULLET, "").trim();
    const last = current.bullets[current.bullets.length - 1];
    if (last !== undefined && !bulleted && (!/[.!?]$/.test(last) || /^[a-z(,&]/.test(text))) {
      current.bullets[current.bullets.length - 1] = `${last} ${text}`;
    } else {
      current.bullets.push(text);
    }
  }

  return out.map((e) => ({ ...e, bullets: e.bullets.slice(0, 8) }));
}

const KNOWN_SKILLS = [
  ...new Set([
    ...Object.values(SKILL_SYNONYMS),
    "React Native", "Three.js", "GSAP", "Tailwind CSS", "Firebase", "Supabase", "WordPress",
    "Socket.io", "WebSocket", "Twilio", "Stripe", "Stream.io", "Vercel", "Netlify", "Figma",
  ]),
];

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Known skills mentioned in free text, e.g. a project description. */
function skillsIn(text: string): string[] {
  const found = new Set<string>();
  if (/\bMERN\b/i.test(text)) ["MongoDB", "Express", "React", "Node.js"].forEach((s) => found.add(s));
  if (/\bMEAN\b/.test(text)) ["MongoDB", "Express", "Angular", "Node.js"].forEach((s) => found.add(s));
  for (const s of KNOWN_SKILLS) {
    if (s.length < 3 && s !== "Go") continue;
    const re = new RegExp(`(^|[^a-z0-9+#.])${escapeRegex(s.toLowerCase())}(\\.js)?($|[^a-z0-9+#])`, "i");
    if (re.test(text)) found.add(s);
  }
  // "React.js" etc. in prose.
  for (const m of text.matchAll(/\b([A-Za-z]+)\.js\b/g)) found.add(canonicalSkill(`${m[1]}.js`));
  // "Tailwind CSS" already covers "CSS".
  const list = [...found];
  return list
    .filter((s) => !list.some((o) => o !== s && o.toLowerCase().endsWith(` ${s.toLowerCase()}`)))
    .slice(0, 8);
}

function parseProjects(lines: string[]): Project[] {
  const entries: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const starts =
      NUMBERED.test(line) ||
      BULLET.test(line) ||
      (line.includes("|") && line.length < 120) ||
      entries.length === 0;
    if (starts) entries.push(line.replace(NUMBERED, "").replace(BULLET, ""));
    else entries[entries.length - 1] += ` ${line}`;
  }

  return entries.slice(0, 8).map((entry) => {
    let name = entry;
    let description = "";
    if (entry.includes("|")) {
      const [n, ...rest] = splitParts(entry);
      name = n;
      description = rest.join(" · ");
    } else {
      const sep = entry.match(/\s[-–—:]\s/);
      const verb = entry.match(ACTION_VERB);
      if (sep?.index && sep.index < 60) {
        name = entry.slice(0, sep.index);
        description = entry.slice(sep.index + sep[0].length);
      } else if (verb?.index && verb.index > 0 && verb.index < 60) {
        name = entry.slice(0, verb.index);
        description = entry.slice(verb.index);
      } else if (entry.length > 60) {
        name = entry.split(/\s+/).slice(0, 4).join(" ");
        description = entry;
      }
    }
    return {
      id: crypto.randomUUID(),
      name: name.trim().replace(/[,:;-]+$/, ""),
      description: description.trim(),
      url: "",
      stack: skillsIn(entry),
    };
  });
}

function parseSkills(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const body = line.includes(":") ? line.slice(line.indexOf(":") + 1) : line;
    for (const piece of body.split(/[,|•·;]/)) {
      const s = canonicalSkill(piece.replace(BULLET, "").trim());
      if (s.length < 1 || s.length > 40) continue;
      const k = s.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        out.push(s);
      }
    }
  }
  return out.slice(0, 40);
}

function parseEducation(lines: string[]): Education[] {
  const entries: string[][] = [];
  for (const raw of lines) {
    const line = raw.replace(BULLET, "").trim();
    if (!line) continue;
    const starts = line.includes("|") || DEGREE.test(line) || SCHOOL.test(line);
    if (starts || !entries.length) entries.push(splitParts(line));
    else {
      // Wrapped continuation, e.g. "PRADESH" after "SONBHADRA, UTTAR".
      const last = entries[entries.length - 1];
      last[last.length - 1] = `${last[last.length - 1]} ${line}`;
    }
  }

  return entries.slice(0, 5).map((parts) => {
    const dateIdx = parts.findIndex((p) => YEAR.test(p) && p.replace(/[\d/.\s–-]|present/gi, "").length < 4);
    const end = dateIdx >= 0 ? parts[dateIdx] : "";
    const rest = parts.filter((_, i) => i !== dateIdx);
    const degree = rest.find((p) => DEGREE.test(p)) ?? rest[0] ?? "";
    const school = rest.find((p) => p !== degree && SCHOOL.test(p)) ?? rest.find((p) => p !== degree) ?? "";
    const location = rest.filter((p) => p !== degree && p !== school).join(", ");
    return {
      id: crypto.randomUUID(),
      degree,
      school,
      location: titleCase(location),
      end,
    };
  });
}

function parseCertifications(lines: string[]): Certification[] {
  return joinWrapped(lines)
    .slice(0, 10)
    .map((line) => {
      const parts = line.split(/\s*[|–—]\s*|\s+-\s+/).map((p) => p.trim()).filter(Boolean);
      const date = parts.find((p) => YEAR.test(p) && p.length < 20) ?? "";
      const rest = parts.filter((p) => p !== date);
      return { id: crypto.randomUUID(), name: rest[0] ?? line, issuer: rest[1] ?? "", date, url: "" };
    });
}

/* ------------------------------------------------------------- links */

function socialFor(url: string): SocialKey | null {
  const host = (() => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();
  for (const s of SOCIALS) {
    if (!s.host) continue;
    if (s.host.split("|").some((h) => host === h || host.endsWith(`.${h}`))) return s.key;
  }
  return null;
}

function normalizeUrl(u: string) {
  const trimmed = u.trim().replace(/[.,)]+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

/* -------------------------------------------------------------- main */

export type ParsedResume = {
  name: string | null;
  headline: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  socials: Partial<Record<SocialKey, string>>;
  githubUsername: string;
  phone: string;
};

/**
 * @param text raw text from the PDF parser
 * @param links link targets read from the PDF's annotations, in page order
 */
export function parseResume(text: string, links: string[]): ParsedResume {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const buckets: Record<Section, string[]> = {
    header: [], summary: [], experience: [], projects: [], skills: [], education: [], certifications: [], other: [],
  };
  let current: Section = "header";
  for (const line of lines) {
    const s = sectionOf(line);
    if (s) current = s;
    else buckets[current].push(line);
  }

  const summary = joinWrapped(buckets.summary).join(" ").slice(0, 800);
  const experience = parseExperience(buckets.experience);
  const projects = parseProjects(buckets.projects);
  const education = parseEducation(buckets.education);
  const certifications = parseCertifications(buckets.certifications);
  const skills = parseSkills(buckets.skills);

  // Contact line: the one holding an email or phone, wherever it sits.
  const contactLine = lines.find((l) => EMAIL.test(l) || PHONE.test(l)) ?? "";
  const location =
    splitParts(contactLine).find(
      (p) => /[a-z]/i.test(p) && !EMAIL.test(p) && !PHONE.test(p) && !/https?:|www\.|\.com/i.test(p) && p.length <= 40,
    ) ?? "";
  const phone = contactLine.match(PHONE)?.[0].trim() ?? "";

  // Name: the line just above the contact line, or the first line.
  const contactIdx = lines.indexOf(contactLine);
  const nameCandidates = [lines[contactIdx - 1], lines[0]].map((l) => l?.trim() ?? "");
  const name =
    nameCandidates.find((l) => /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(l) && l.split(/\s+/).length >= 2 && l.split(/\s+/).length <= 4 && !sectionOf(l)) ?? null;

  const headlineMatch = summary.match(
    /^([A-Z][\w+#./ -]{1,40}?\b(?:Developer|Engineer|Designer|Analyst|Scientist|Manager|Architect|Consultant|Specialist|Intern|Programmer|Administrator|Tester))\b/,
  );
  const headline = headlineMatch?.[1] ?? experience[0]?.role ?? "";

  // Links: socials by host; the rest go to projects in order, then website.
  const allLinks = [...links, ...(text.match(URL_IN_TEXT) ?? [])].map(normalizeUrl);
  const socials: Partial<Record<SocialKey, string>> = {};
  const other: string[] = [];
  for (const url of [...new Set(allLinks)]) {
    const key = socialFor(url);
    if (key) socials[key] ??= url;
    else other.push(url);
  }
  projects.forEach((p, i) => {
    if (other[i]) p.url = other[i];
  });
  if (other.length > projects.length && !socials.website) socials.website = other[projects.length];

  const gh = socials.github?.match(/github\.com\/([A-Za-z0-9-]{1,39})\/?$/)?.[1] ?? "";

  return {
    name,
    headline,
    location: titleCase(location),
    summary,
    skills,
    experience,
    education,
    projects,
    certifications,
    socials,
    githubUsername: gh,
    phone,
  };
}

/** Link targets from PDF link annotations (not visible in extracted text). */
export function pdfLinks(pdf: Buffer): string[] {
  const raw = pdf.toString("latin1");
  const out: string[] = [];
  for (const m of raw.matchAll(/\/URI\s*\(([^)]{4,300})\)/g)) {
    const u = m[1].replace(/\\([()\\])/g, "$1");
    if (/^https?:\/\//i.test(u) && !out.includes(u)) out.push(u);
  }
  return out.slice(0, 30);
}
