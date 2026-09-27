/** Blog shapes and rules, shared by the pages, the editor and the API. */

export const WORDS_MIN = 500;
export const WORDS_MAX = 2500;
export const TITLE_MAX = 150;
export const TAGS_MAX = 5;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 90;

/** Tag -> chip colours. The first six are the featured chips on /blog. */
export const BLOG_TAGS: { name: string; cls: string }[] = [
  { name: "Interview Prep", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  { name: "Resume Tips", cls: "border-violet-500/40 bg-violet-500/10 text-violet-300" },
  { name: "Job Search", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  { name: "System Design", cls: "border-orange-500/40 bg-orange-500/10 text-orange-300" },
  { name: "Machine Learning", cls: "border-pink-500/40 bg-pink-500/10 text-pink-300" },
  { name: "Generative AI", cls: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
  { name: "DSA", cls: "border-lime-400/40 bg-lime-400/10 text-lime-300" },
  { name: "Off-Campus", cls: "border-teal-400/40 bg-teal-400/10 text-teal-300" },
  { name: "Career Growth", cls: "border-indigo-400/40 bg-indigo-400/10 text-indigo-300" },
  { name: "Frontend", cls: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" },
  { name: "Backend", cls: "border-rose-400/40 bg-rose-400/10 text-rose-300" },
  { name: "Data Science", cls: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300" },
];
export const FEATURED_TAGS = BLOG_TAGS.slice(0, 6);
export const tagClass = (t: string) => BLOG_TAGS.find((x) => x.name === t)?.cls ?? "border-white/15 bg-white/5 text-[var(--color-c-text-4)]";

export type BlogStatus = "draft" | "pending" | "published" | "rejected";

/** What a listing card needs (no content). */
export type BlogCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  tags: string[];
  authorName: string;
  wordCount: number;
  views: number;
  publishedAt: string | null;
  status: BlogStatus;
  updatedAt: string;
};

export type BlogPost = BlogCard & { contentHtml: string; reviewNote: string | null; authorId: string | null };

/** What the editor sends. */
export type BlogDraft = {
  title: string;
  slug: string;
  authorName: string;
  coverUrl: string;
  tags: string[];
  contentHtml: string;
};

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

/** Words in HTML content, counted the same way in the editor and on the server. */
export function countWords(html: string) {
  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    // Inline formatting sits inside words ("<b>two</b>-three"), so it joins; blocks separate.
    .replace(/<\/?(?:strong|b|em|i|u|s|mark|code|a|span)(?:\s[^>]*)?>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&[a-z#0-9]+;/gi, "x");
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

export const readingMinutes = (words: number) => Math.max(1, Math.round(words / 220));

export const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "JA";
