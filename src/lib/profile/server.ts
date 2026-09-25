import "server-only";
import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractResumeText } from "@/lib/resume-text";
import { parseResume, pdfLinks } from "./resume-parse";
import {
  APPLY_FIELDS,
  BANNERS,
  DEFAULT_LAYOUT,
  SECTION_KEYS,
  SOCIALS,
  safeUrl,
  type Certification,
  type Education,
  type Endorsement,
  type Experience,
  type Layout,
  type ProfileData,
  type ProfileExtras,
  type Project,
  type PublicProfile,
  type SectionKey,
} from "./types";

export const PROFILE_COLUMNS =
  "id, email, full_name, avatar_url, resume_path, resume_filename, resume_uploaded_at, slug, headline, location, summary, open_to_work, is_public, banner, banner_url, github_username, socials, skills, experience, education, projects, certifications, layout, theme, apply_details, resume_imported_at";

export type ProfileRow = Record<string, unknown> & { id: string; slug: string };

export class ProfileError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/* --------------------------------------------------------- row mapping */

function layoutOf(v: unknown): Layout {
  const l = (v ?? {}) as Partial<Layout>;
  const order = Array.isArray(l.order) ? l.order.filter((k): k is SectionKey => SECTION_KEYS.includes(k)) : [];
  // Sections added later still appear, at the end.
  for (const k of SECTION_KEYS) if (!order.includes(k)) order.push(k);
  const hidden = Array.isArray(l.hidden) ? l.hidden.filter((k): k is SectionKey => SECTION_KEYS.includes(k)) : [];
  return { order, hidden };
}

export function rowToProfile(row: ProfileRow): ProfileData {
  return {
    slug: row.slug,
    fullName: (row.full_name as string) ?? "",
    email: (row.email as string) ?? "",
    headline: (row.headline as string) ?? "",
    location: (row.location as string) ?? "",
    summary: (row.summary as string) ?? "",
    openToWork: Boolean(row.open_to_work),
    isPublic: Boolean(row.is_public),
    avatarUrl: (row.avatar_url as string) ?? null,
    banner: BANNERS[row.banner as string] ? (row.banner as string) : "lime",
    bannerUrl: (row.banner_url as string) ?? null,
    githubUsername: (row.github_username as string) ?? "",
    socials: (row.socials as ProfileData["socials"]) ?? {},
    skills: (row.skills as string[]) ?? [],
    experience: (row.experience as Experience[]) ?? [],
    education: (row.education as Education[]) ?? [],
    projects: (row.projects as Project[]) ?? [],
    certifications: (row.certifications as Certification[]) ?? [],
    layout: layoutOf(row.layout),
    theme: row.theme === "daylight" ? "daylight" : "midnight",
    applyDetails: (row.apply_details as ProfileData["applyDetails"]) ?? {},
    resume: {
      path: (row.resume_path as string) ?? null,
      filename: (row.resume_filename as string) ?? null,
      uploadedAt: (row.resume_uploaded_at as string) ?? null,
      importedAt: (row.resume_imported_at as string) ?? null,
    },
  };
}

export function rowToPublic(row: ProfileRow, endorsements: Endorsement[]): PublicProfile {
  const p = rowToProfile(row);
  return {
    id: row.id,
    slug: p.slug,
    fullName: p.fullName || "Developer",
    headline: p.headline,
    location: p.location,
    summary: p.summary,
    openToWork: p.openToWork,
    avatarUrl: p.avatarUrl,
    banner: p.banner,
    bannerUrl: p.bannerUrl,
    githubUsername: p.githubUsername,
    socials: p.socials,
    skills: p.skills,
    experience: p.experience,
    education: p.education,
    projects: p.projects,
    certifications: p.certifications,
    layout: p.layout,
    theme: p.theme,
    endorsements,
  };
}

/* ---------------------------------------------------------- validation */

const RESERVED_SLUGS = new Set([
  "admin", "api", "login", "signup", "profile", "u", "jobs", "settings", "help", "about", "support", "jobalert24", "www",
]);
const SLUG = /^[a-z0-9][a-z0-9-]{2,29}$/;
const GITHUB_USER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function text(v: unknown, max: number, field: string): string {
  if (v === null || v === undefined) return "";
  if (typeof v !== "string") throw new ProfileError(`${field} must be text.`);
  const t = v.replace(/\s+/g, " ").trim();
  if (t.length > max) throw new ProfileError(`${field} is too long (max ${max} characters).`);
  return t;
}

function multiline(v: unknown, max: number, field: string): string {
  if (v === null || v === undefined) return "";
  if (typeof v !== "string") throw new ProfileError(`${field} must be text.`);
  const t = v.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (t.length > max) throw new ProfileError(`${field} is too long (max ${max} characters).`);
  return t;
}

function url(v: unknown, field: string): string {
  const t = text(v, 300, field);
  if (!t) return "";
  const safe = safeUrl(t);
  if (!safe) throw new ProfileError(`${field} must be a valid http(s) link.`);
  return safe;
}

function list<T>(v: unknown, max: number, field: string, each: (x: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(v)) throw new ProfileError(`${field} must be a list.`);
  if (v.length > max) throw new ProfileError(`Too many ${field} (max ${max}).`);
  return v.map((x) => each((x ?? {}) as Record<string, unknown>));
}

function id(v: unknown): string {
  return typeof v === "string" && /^[\w-]{1,40}$/.test(v) ? v : crypto.randomUUID();
}

function skillList(v: unknown, max: number, field: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list(v, max, field, (x) => x as unknown)) {
    const t = text(s, 40, "Skill");
    if (t && !seen.has(t.toLowerCase())) {
      seen.add(t.toLowerCase());
      out.push(t);
    }
  }
  return out;
}

/**
 * Validates a partial profile update and returns DB columns.
 * Unknown keys are ignored; bad values throw a ProfileError.
 */
export async function validatePatch(
  db: SupabaseClient,
  userId: string,
  input: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};

  if ("fullName" in input) {
    const n = text(input.fullName, 80, "Name");
    if (!n) throw new ProfileError("Name cannot be empty.");
    out.full_name = n;
  }
  if ("headline" in input) out.headline = text(input.headline, 120, "Headline");
  if ("location" in input) out.location = text(input.location, 80, "Location");
  if ("summary" in input) out.summary = multiline(input.summary, 1200, "Summary");
  if ("openToWork" in input) out.open_to_work = input.openToWork === true;
  if ("isPublic" in input) out.is_public = input.isPublic === true;
  if ("banner" in input) {
    if (typeof input.banner !== "string" || !BANNERS[input.banner]) throw new ProfileError("Unknown banner.");
    out.banner = input.banner;
    // Choosing a gradient replaces any uploaded image.
    out.banner_url = null;
  }
  if ("theme" in input) {
    if (input.theme !== "midnight" && input.theme !== "daylight") throw new ProfileError("Unknown theme.");
    out.theme = input.theme;
  }
  if ("githubUsername" in input) {
    const g = text(input.githubUsername, 39, "GitHub username").replace(/^@/, "");
    if (g && !GITHUB_USER.test(g)) throw new ProfileError("That isn't a valid GitHub username.");
    out.github_username = g || null;
  }
  if ("socials" in input) {
    const s = (input.socials ?? {}) as Record<string, unknown>;
    const socials: Record<string, string> = {};
    for (const { key, label } of SOCIALS) {
      const u = url(s[key], label);
      if (u) socials[key] = u;
    }
    out.socials = socials;
  }
  if ("skills" in input) out.skills = skillList(input.skills, 60, "skills");
  if ("experience" in input) {
    out.experience = list(input.experience, 20, "experience entries", (x): Experience => ({
      id: id(x.id),
      role: text(x.role, 100, "Role"),
      company: text(x.company, 100, "Company"),
      location: text(x.location, 80, "Location"),
      start: text(x.start, 30, "Start date"),
      end: text(x.end, 30, "End date"),
      bullets: list(x.bullets ?? [], 10, "bullet points", (b) => text(b, 400, "Bullet point")).filter(Boolean),
    })).filter((e) => e.role || e.company);
  }
  if ("education" in input) {
    out.education = list(input.education, 10, "education entries", (x): Education => ({
      id: id(x.id),
      degree: text(x.degree, 120, "Degree"),
      school: text(x.school, 120, "School"),
      location: text(x.location, 80, "Location"),
      end: text(x.end, 30, "Year"),
    })).filter((e) => e.degree || e.school);
  }
  if ("projects" in input) {
    out.projects = list(input.projects, 20, "projects", (x): Project => ({
      id: id(x.id),
      name: text(x.name, 100, "Project name"),
      description: multiline(x.description, 600, "Project description"),
      url: url(x.url, "Project link"),
      stack: skillList(x.stack ?? [], 12, "project stack"),
    })).filter((p) => p.name);
  }
  if ("certifications" in input) {
    out.certifications = list(input.certifications, 20, "certifications", (x): Certification => ({
      id: id(x.id),
      name: text(x.name, 120, "Certification"),
      issuer: text(x.issuer, 100, "Issuer"),
      date: text(x.date, 30, "Date"),
      url: url(x.url, "Credential link"),
    })).filter((c) => c.name);
  }
  if ("layout" in input) {
    const l = (input.layout ?? {}) as Partial<Layout>;
    const order = Array.isArray(l.order) ? l.order : [];
    const valid =
      order.length === SECTION_KEYS.length && SECTION_KEYS.every((k) => order.includes(k));
    if (!valid) throw new ProfileError("Invalid section order.");
    const hidden = Array.isArray(l.hidden) ? l.hidden.filter((k) => SECTION_KEYS.includes(k)) : [];
    out.layout = { order, hidden };
  }
  if ("applyDetails" in input) {
    const a = (input.applyDetails ?? {}) as Record<string, unknown>;
    const details: Record<string, string> = {};
    for (const { key, label } of APPLY_FIELDS) {
      const v = key === "linkedin" || key === "portfolio" ? url(a[key], label) : text(a[key], 60, label);
      if (v) details[key] = v;
    }
    out.apply_details = details;
  }
  if ("slug" in input) {
    const s = text(input.slug, 30, "Profile URL").toLowerCase();
    if (!SLUG.test(s)) {
      throw new ProfileError("Profile URL must be 3-30 characters: lowercase letters, numbers and dashes.");
    }
    if (RESERVED_SLUGS.has(s)) throw new ProfileError("That URL is reserved. Please pick another.");
    const { data: taken } = await db.from("profiles").select("id").eq("slug", s).neq("id", userId).maybeSingle();
    if (taken) throw new ProfileError("That URL is already taken.", 409);
    out.slug = s;
  }

  return out;
}

/* -------------------------------------------------------- resume import */

/**
 * Reads the saved resume and turns it into profile sections (no AI).
 * Sections found in the resume replace the current ones; one-line fields
 * (headline, location, links) are only filled where still empty, so a
 * re-import never wipes something the user typed by hand.
 */
export async function importFromResume(db: SupabaseClient, row: ProfileRow): Promise<Record<string, unknown>> {
  if (!row.resume_path) throw new ProfileError("Upload a resume first.", 404);
  const { data: blob, error } = await db.storage.from("user-documents").download(row.resume_path as string);
  if (error || !blob) throw new ProfileError("Could not load your resume.", 502);

  const pdf = Buffer.from(await blob.arrayBuffer());
  let raw: string;
  try {
    raw = await extractResumeText(pdf);
  } catch (e) {
    throw new ProfileError(e instanceof Error ? e.message : "Could not read your resume.", 422);
  }
  const parsed = parseResume(raw, pdfLinks(pdf));
  const p = rowToProfile(row);

  const update: Record<string, unknown> = { resume_imported_at: new Date().toISOString() };
  if (parsed.experience.length) update.experience = parsed.experience;
  if (parsed.education.length) update.education = parsed.education;
  if (parsed.projects.length) update.projects = parsed.projects;
  if (parsed.certifications.length) update.certifications = parsed.certifications;
  if (parsed.skills.length) update.skills = parsed.skills;

  if (!p.fullName && parsed.name) update.full_name = parsed.name;
  if (!p.headline && parsed.headline) update.headline = parsed.headline.slice(0, 120);
  if (!p.location && parsed.location) update.location = parsed.location.slice(0, 80);
  if (!p.summary && parsed.summary) update.summary = parsed.summary.slice(0, 1200);
  if (!p.githubUsername && parsed.githubUsername) update.github_username = parsed.githubUsername;
  update.socials = { ...parsed.socials, ...p.socials };

  const apply = { ...p.applyDetails };
  if (!apply.phone && parsed.phone) apply.phone = parsed.phone.slice(0, 60);
  if (!apply.linkedin && parsed.socials.linkedin) apply.linkedin = parsed.socials.linkedin;
  if (!apply.portfolio && parsed.socials.website) apply.portfolio = parsed.socials.website;
  update.apply_details = apply;

  return update;
}

/* ------------------------------------------------------------- extras */

export async function loadEndorsements(db: SupabaseClient, profileId: string): Promise<Endorsement[]> {
  const { data } = await db
    .from("endorsements")
    .select("id, author_name, author_headline, relationship, body, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((e) => ({
    id: e.id,
    authorName: e.author_name,
    authorHeadline: e.author_headline,
    relationship: e.relationship,
    body: e.body,
    createdAt: e.created_at,
  }));
}

export async function loadExtras(db: SupabaseClient, userId: string): Promise<ProfileExtras> {
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  const [views, total, endorsements, messages, referrals] = await Promise.all([
    db.from("profile_views").select("day").eq("profile_id", userId).gte("day", since),
    db.from("profile_views").select("id", { count: "exact", head: true }).eq("profile_id", userId),
    loadEndorsements(db, userId),
    db
      .from("profile_messages")
      .select("id, sender_name, sender_email, body, read, created_at")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", userId),
  ]);

  const perDay = new Map<string, number>();
  for (const v of views.data ?? []) perDay.set(v.day as string, (perDay.get(v.day as string) ?? 0) + 1);
  const daily: { day: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    daily.push({ day: d, count: perDay.get(d) ?? 0 });
  }

  return {
    views: {
      total: total.count ?? 0,
      last30: views.data?.length ?? 0,
      last7: daily.filter((d) => d.day >= weekAgo).reduce((n, d) => n + d.count, 0),
      daily,
    },
    endorsements,
    messages: (messages.data ?? []).map((m) => ({
      id: m.id,
      senderName: m.sender_name,
      senderEmail: m.sender_email,
      body: m.body,
      read: m.read,
      createdAt: m.created_at,
    })),
    referrals: referrals.count ?? 0,
  };
}

/** Salted, per-day hash so a visitor counts once a day and is never stored raw. */
export function viewerHash(ip: string, ua: string): string {
  const salt = process.env.PROFILE_VIEW_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || "jobalert24";
  const day = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 40);
}

export { DEFAULT_LAYOUT };
