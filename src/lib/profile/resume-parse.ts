import { canonicalSkill } from "@/lib/analyzer/match";
import { SKILL_SYNONYMS } from "@/lib/analyzer/config";
import { SOCIALS, type Certification, type Education, type Experience, type Project, type SocialKey } from "./types";

/**
 * Turns resume text into profile sections with plain rules, no AI.
 * It reads section headings (including letter-spaced ones like
 * "E X P E R I E N C E"), date ranges, `|` / `—` separated lines, and
 * re-joins bullets that the PDF wrapped across lines. Anything it gets
 * wrong the user fixes in the editor.
 */

type Section = "header" | "summary" | "experience" | "projects" | "skills" | "education" | "certifications" | "other";

const HEADING_PHRASES: Record<Exclude<Section, "header">, string[]> = {
  summary: [
    "summary", "profile", "professional summary", "profile summary", "career summary", "executive summary",
    "about", "about me", "objective", "career objective", "professional profile",
  ],
  experience: [
    "experience", "work experience", "professional experience", "relevant experience", "employment",
    "employment history", "work history", "internship", "internships", "internship experience",
  ],
  projects: ["projects", "personal projects", "academic projects", "key projects", "side projects", "selected projects", "notable projects"],
  skills: [
    "skills", "technical skills", "key skills", "core skills", "core competencies", "skills and tools", "skills & tools",
    "tech stack", "technologies", "technical expertise", "skills summary",
  ],
  education: ["education", "academic background", "academics", "academic qualification", "academic qualifications", "qualification", "qualifications"],
  certifications: [
    "certification", "certifications", "certificate", "certificates", "courses", "courses and certifications",
    "courses & certifications", "licenses and certifications", "licenses & certifications",
  ],
  other: [
    "coding profiles", "profiles", "links", "achievements", "awards", "honors", "honours", "languages", "hobbies",
    "interests", "activities", "extracurricular activities", "extra curricular activities", "publications",
    "references", "declaration", "personal details", "personal information", "contact", "contact me",
    "leadership", "volunteering", "volunteer experience",
  ],
};

const headingKey = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const HEADINGS = new Map<string, Section>();
for (const [section, phrases] of Object.entries(HEADING_PHRASES)) {
  for (const p of phrases) HEADINGS.set(headingKey(p), section as Section);
}

const MONTH = "(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?";
const DATE = `(?:\\d{1,2}[/.-]\\d{4}|${MONTH}\\s*,?\\s*\\d{4}|\\d{4})`;
const RANGE = new RegExp(`(${DATE})\\s*(?:-|–|—|to)\\s*(${DATE}|present|current|now|ongoing|till date)`, "i");
const YEAR = /\b(19|20)\d{2}\b/;
const BULLET = /^[•●▪◦■□➢►▶▸▹◆◇❖➤➔→✓✔\-*–—·‣⁃]\s*/;
const NUMBERED = /^\d{1,2}[.)]\s+/;
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /\+?\d[\d\s-]{8,}\d/;
const TITLE_SEP = /\s+[—–|]\s+|\s+-\s+/;
const URL_IN_TEXT = /\b(?:https?:\/\/|www\.)[^\s|,;()<>•]+|\b(?:linkedin\.com|github\.com|leetcode\.com|codeforces\.com|codechef\.com|geeksforgeeks\.org|dribbble\.com|behance\.net|x\.com|twitter\.com)\/[^\s|,;()<>•]+/gi;
const ACTION_VERB =
  /\b(Created|Built|Developed|Designed|Implemented|Engineered|Launched|Deployed|Architected|Crafted|Automated|Integrated|Made|Wrote|Led|Programmed|Coded|Constructed|Established|Published|Contributed)\b/;
const DEGREE =
  /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|bca|mca|mba|bba|b\.?\s?com|m\.?\s?com|bachelor|master|ph\.?\s?d|diploma|intermediate|high school|higher secondary|senior secondary|secondary|12th|10th|hsc|ssc|engineering|computer science|information technology)\b/i;
const SCHOOL = /\b(university|college|institute|school|academy|iit|nit|iiit|vidyalaya)\b/i;
// Words that only ever name a qualification; "Engineering" alone can be part
// of a college name ("Rajkiya Engineering College"), these cannot.
const STRONG_DEGREE =
  /\b(b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?sc|m\.?\s?sc|bca|mca|mba|bba|b\.?\s?com|m\.?\s?com|bachelor|master|ph\.?\s?d|diploma|intermediate|higher secondary|senior secondary|12th|10th|hsc|ssc)\b/i;

/** Appends a wrapped line, re-joining words split with a trailing hyphen ("re-" + "ranking"). */
function appendWrapped(prev: string, next: string) {
  return /\w-$/.test(prev) ? `${prev.slice(0, -1)}${next}` : `${prev} ${next}`;
}

function sectionOf(line: string): Section | null {
  const t = line.trim();
  if (!t || t.length > 70) return null;
  const k = headingKey(t);
  if (!k || k.length > 40) return null;
  return HEADINGS.get(k) ?? null;
}

function titleCase(s: string): string {
  // Only rewrite shouting ("SONBHADRA, UTTAR PRADESH"); leave mixed case alone.
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

function stripBullet(line: string) {
  return line.trim().replace(NUMBERED, "").replace(BULLET, "").trim();
}

/** A line continues the previous one when the previous didn't end a sentence, or this one starts lower-case. */
function continues(prev: string | undefined, next: string) {
  return prev !== undefined && (!/[.!?]$/.test(prev) || /^[a-z(,&%]/.test(next));
}

/** Joins lines the PDF wrapped. Bulleted/numbered lines always start a new item. */
function joinWrapped(lines: string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    const bulleted = BULLET.test(t) || NUMBERED.test(t);
    const line = stripBullet(t);
    if (!line) continue;
    const prev = out[out.length - 1];
    if (!bulleted && continues(prev, line)) out[out.length - 1] = appendWrapped(prev, line);
    else out.push(line);
  }
  return out;
}

function splitParts(s: string): string[] {
  return s
    .split(/\s*[|•]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------ sections */

function parseExperience(lines: string[]): Experience[] {
  const out: Experience[] = [];
  let current: Experience | null = null;

  for (const rawLine of lines) {
    const raw = rawLine.trim();
    if (!raw) continue;
    const range = raw.match(RANGE);

    if (range && !BULLET.test(raw)) {
      const withoutDates = raw.replace(range[0], " ");
      let parts = splitParts(withoutDates).filter((p) => !/^[-–—,\s]*$/.test(p));
      if (parts.length === 1 && !/[|•]/.test(raw)) {
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
        role: (parts[0] ?? "").replace(/[—–-]\s*$/, "").trim(),
        company: (parts[1] ?? "").replace(/[—–-]\s*$/, "").trim(),
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
    const text = stripBullet(raw);
    const last = current.bullets[current.bullets.length - 1];
    if (!bulleted && continues(last, text)) current.bullets[current.bullets.length - 1] = appendWrapped(last, text);
    else current.bullets.push(text);
  }

  return out.map((e) => ({ ...e, bullets: e.bullets.slice(0, 8) }));
}

const KNOWN_SKILLS = [
  ...new Set([
    ...Object.values(SKILL_SYNONYMS),
    "React Native", "Three.js", "GSAP", "Tailwind CSS", "Firebase", "Supabase", "WordPress",
    "Socket.io", "WebSocket", "Twilio", "Stripe", "Stream.io", "Vercel", "Netlify", "Figma",
    "LangChain", "LangGraph", "CrewAI", "LlamaIndex", "OpenAI", "Gemini", "Claude", "Milvus", "Pinecone",
    "ChromaDB", "pgvector", "FAISS", "Ragas", "LangSmith", "Hugging Face", "Pydantic", "SQLAlchemy", "Agno",
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
  for (const m of text.matchAll(/\b([A-Za-z]+)\.js\b/g)) found.add(canonicalSkill(`${m[1]}.js`));
  // "Tailwind CSS" already covers "CSS".
  const list = [...found];
  return list.filter((s) => !list.some((o) => o !== s && o.toLowerCase().endsWith(` ${s.toLowerCase()}`)));
}

/** "React, Node.js, AWS (EC2, S3)" → ["React", "Node.js", "AWS"], canonical names. */
function skillList(text: string): string[] {
  return text
    .replace(/\([^)]*\)/g, "")
    .split(/[,|•·;]/)
    .map((p) => canonicalSkill(p.replace(/\s+/g, " ").trim()))
    .filter((s) => s.length >= 1 && s.length <= 40);
}

function unique(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function withPeriod(s: string) {
  return /[.!?)]$/.test(s) ? s : `${s}.`;
}

function parseProjects(lines: string[]): Project[] {
  const clean = lines.map((l) => l.trim()).filter(Boolean);
  const bulleted = (l: string) => BULLET.test(l);
  const numbered = (l: string) => NUMBERED.test(l);

  // Two layouts: a plain title line followed by bullet points, or one
  // numbered/bulleted entry per project. Pick by what the section contains.
  const titleLike = (l: string) =>
    !bulleted(l) && !numbered(l) && /^[A-Z0-9]/.test(l) && (TITLE_SEP.test(l) || l.length <= 60);
  const titleMode = clean.some(bulleted) && clean.some(titleLike);

  const entries: { title: string; body: string[] }[] = [];
  for (const line of clean) {
    const text = stripBullet(line);
    if (!text) continue;
    const last = entries[entries.length - 1];

    if (titleMode) {
      if (titleLike(line)) entries.push({ title: text, body: [] });
      else if (!last) entries.push({ title: text, body: [] });
      else if (bulleted(line)) last.body.push(text);
      else if (last.body.length) last.body[last.body.length - 1] = appendWrapped(last.body[last.body.length - 1], text);
      else last.title = appendWrapped(last.title, text);
    } else {
      const starts = numbered(line) || bulleted(line) || (/[|]/.test(line) && line.length < 120) || !last;
      if (starts) entries.push({ title: text, body: [] });
      else last.title += ` ${text}`;
    }
  }

  return entries.slice(0, 8).map(({ title, body }) => {
    let name = title;
    let tagline = "";
    let stack: string[] = [];

    const segs = title.split(TITLE_SEP).map((s) => s.trim()).filter(Boolean);
    if (segs.length > 1) {
      name = segs[0];
      const lastSeg = segs[segs.length - 1];
      const middle = segs.slice(1, lastSeg.includes(",") ? -1 : undefined);
      if (lastSeg.includes(",")) stack = skillList(lastSeg);
      tagline = middle.join(" — ");
    } else if (!body.length) {
      // One line holds both, e.g. "Talent IQ Created a real-time …".
      const verb = title.match(ACTION_VERB);
      if (verb?.index && verb.index > 0 && verb.index < 60) {
        name = title.slice(0, verb.index);
        tagline = title.slice(verb.index);
      } else if (title.length > 60) {
        name = title.split(/\s+/).slice(0, 4).join(" ");
        tagline = title;
      }
    }

    const description = [tagline, ...body].filter(Boolean).map(withPeriod).join(" ").slice(0, 600);
    return {
      id: crypto.randomUUID(),
      name: name.trim().replace(/[,:;—–-]+$/, "").slice(0, 100),
      description,
      url: "",
      stack: unique([...stack, ...skillsIn(`${title} ${body.join(" ")}`)]).slice(0, 10),
    };
  });
}

function parseSkills(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of joinWrapped(lines)) {
    const body = line.includes(":") ? line.slice(line.indexOf(":") + 1) : line;
    out.push(...skillList(body));
  }
  return unique(out).slice(0, 40);
}

function parseEducation(lines: string[]): Education[] {
  const out: Education[] = [];
  let cur: Education | null = null;
  const fresh = (): Education => ({ id: crypto.randomUUID(), degree: "", school: "", location: "", end: "" });

  for (const raw of lines) {
    const line = stripBullet(raw);
    if (!line) continue;
    const parts = splitParts(line);
    const isContinuation = parts.length === 1 && !DEGREE.test(line) && !SCHOOL.test(line) && !YEAR.test(line);
    if (isContinuation && cur) {
      // Wrapped tail, e.g. "PRADESH" after "SONBHADRA, UTTAR".
      if (cur.location) cur.location = `${cur.location} ${line}`;
      else if (cur.school) cur.school = `${cur.school} ${line}`;
      else cur.degree = `${cur.degree} ${line}`;
      continue;
    }

    for (const part of parts) {
      const isDate = YEAR.test(part) && part.replace(/[\d/.\s–—-]|present|current/gi, "").length < 4;
      if (isDate) {
        if (!cur) out.push((cur = fresh()));
        const years = part.match(/\b(19|20)\d{2}\b|present/gi) ?? [];
        cur.end = /\//.test(part) && years.length === 1 ? part.trim() : titleCase(years[years.length - 1] ?? part);
      } else if (SCHOOL.test(part) && !STRONG_DEGREE.test(part)) {
        if (!cur || cur.school) out.push((cur = fresh()));
        cur.school = part;
      } else if (DEGREE.test(part)) {
        if (!cur || cur.degree) out.push((cur = fresh()));
        cur.degree = part.replace(/\s+[—–]\s+/g, ", ");
      } else if (cur) {
        cur.location = cur.location ? `${cur.location}, ${part}` : part;
      } else {
        out.push((cur = fresh()));
        cur.degree = part;
      }
    }
  }

  return out
    .filter((e) => e.degree || e.school)
    .slice(0, 5)
    .map((e) => ({ ...e, location: titleCase(e.location) }));
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
  let host = "";
  try {
    host = new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
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

const NAME_LINE = (l: string) =>
  /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(l) && l.split(/\s+/).length >= 2 && l.split(/\s+/).length <= 4 && !sectionOf(l);

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

  const summary = joinWrapped(buckets.summary).join(" ").slice(0, 1200);
  const experience = parseExperience(buckets.experience);
  const projects = parseProjects(buckets.projects);
  const education = parseEducation(buckets.education);
  const certifications = parseCertifications(buckets.certifications);
  const skills = parseSkills(buckets.skills);

  // Contact line: the one holding an email or phone, wherever it sits.
  const contactLine = lines.find((l) => EMAIL.test(l) || PHONE.test(l)) ?? "";
  const location =
    splitParts(contactLine).find(
      (p) => /[a-z]/i.test(p) && !EMAIL.test(p) && !PHONE.test(p) && !/https?:|www\.|\.(com|io|dev|in|me)\b/i.test(p) && p.length <= 40,
    ) ?? "";
  const phone = contactLine.match(PHONE)?.[0].trim() ?? "";

  // Name: the first line, or the line just above a contact line at the bottom.
  const trimmed = lines.map((l) => l.trim());
  const contactIdx = trimmed.indexOf(contactLine.trim());
  const nameIdx = [0, contactIdx - 1].find((i) => i >= 0 && NAME_LINE(trimmed[i] ?? ""));
  const name = nameIdx !== undefined ? titleCase(trimmed[nameIdx]) : null;

  // Headline: a short title line right under the name at the top ("GenAI & LLM Application Engineer"),
  // else the role named at the start of the summary, else the latest job title.
  const underName = nameIdx === 0 ? trimmed[1] ?? "" : "";
  const headerTitle =
    underName && underName.length <= 70 && !EMAIL.test(underName) && !PHONE.test(underName) && !sectionOf(underName) && !/\d{3}/.test(underName)
      ? underName
      : "";
  const summaryRole = summary.match(
    /^(?:[A-Z][\w-]*\s+){0,1}?([A-Z][\w+#./& -]{1,40}?\b(?:Developer|Engineer|Designer|Analyst|Scientist|Manager|Architect|Consultant|Specialist|Intern|Programmer|Administrator|Tester))\b/,
  )?.[1];
  const headline = titleCase(headerTitle) || summaryRole || experience[0]?.role || "";

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
