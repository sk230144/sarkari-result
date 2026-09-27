import "server-only";
import sanitizeHtml from "sanitize-html";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BLOG_TAGS,
  SLUG_MAX,
  SLUG_RE,
  TAGS_MAX,
  TITLE_MAX,
  WORDS_MAX,
  countWords,
  slugify,
  type BlogCard,
  type BlogDraft,
  type BlogPost,
  type BlogStatus,
} from "./types";

export const CARD_COLUMNS =
  "id, slug, title, excerpt, cover_url, tags, author_name, word_count, views, published_at, status, updated_at";
export const POST_COLUMNS = `${CARD_COLUMNS}, content_html, review_note, author_id`;

export class BlogError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/* -------------------------------------------------------------- HTML */

const SANITIZE: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "h1", "h2", "h3", "strong", "b", "em", "i", "u", "s", "mark", "code", "pre",
    "ul", "ol", "li", "blockquote", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
  },
  // Text alignment from the editor, nothing else.
  allowedStyles: { "*": { "text-align": [/^(left|right|center|justify)$/] } },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (_tag, attribs) => {
      const href = attribs.href ?? "";
      const internal = href.startsWith("/") && !href.startsWith("//");
      const out: sanitizeHtml.Attributes = internal ? { href } : { href, target: "_blank", rel: "noopener noreferrer nofollow" };
      return { tagName: "a", attribs: out };
    },
  },
};

export const cleanHtml = (html: string) => sanitizeHtml(html, SANITIZE);

/** Gives each h2 an id so the table of contents can link to it. */
export function withHeadingIds(html: string) {
  const seen = new Map<string, number>();
  const toc: { id: string; text: string }[] = [];
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g, (_m, attrs = "", inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, " ").trim();
    let id = slugify(text) || "section";
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n) id = `${id}-${n + 1}`;
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

/** Plain-text summary for cards and meta descriptions. */
export function excerptOf(html: string, max = 180) {
  const text = html
    .replace(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

/* -------------------------------------------------------------- input */

function safeCover(v: string) {
  const t = v.trim();
  if (!t) return null;
  if (t.startsWith("/blog/")) return t;
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw 0;
    return u.toString();
  } catch {
    throw new BlogError("Cover image must be an http(s) link.");
  }
}

/** Validates the editor payload and returns DB columns. Word limits are checked by the caller. */
export function validateDraft(input: Partial<BlogDraft>, fallbackAuthor: string) {
  const title = String(input.title ?? "").replace(/\s+/g, " ").trim();
  if (!title) throw new BlogError("Add a title.");
  if (title.length > TITLE_MAX) throw new BlogError(`Title is too long (max ${TITLE_MAX} characters).`);

  const slug = String(input.slug ?? "").trim().toLowerCase() || slugify(title);
  if (slug.length < 3 || slug.length > SLUG_MAX || !SLUG_RE.test(slug)) {
    throw new BlogError("URL slug must be 3-90 characters: lowercase letters, numbers and single dashes.");
  }

  const tags = Array.isArray(input.tags) ? [...new Set(input.tags.filter((t) => BLOG_TAGS.some((b) => b.name === t)))] : [];
  if (tags.length > TAGS_MAX) throw new BlogError(`Pick at most ${TAGS_MAX} tags.`);

  const authorName = String(input.authorName ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || fallbackAuthor;
  const raw = String(input.contentHtml ?? "");
  if (raw.length > 400_000) throw new BlogError("The post is too large.", 413);
  const contentHtml = cleanHtml(raw);
  const wordCount = countWords(contentHtml);
  if (wordCount > WORDS_MAX) throw new BlogError(`Posts can be at most ${WORDS_MAX} words (this one has ${wordCount}).`);

  return {
    title,
    slug,
    tags,
    author_name: authorName,
    cover_url: safeCover(String(input.coverUrl ?? "")),
    content_html: contentHtml,
    excerpt: excerptOf(contentHtml),
    word_count: wordCount,
  };
}

export async function slugTaken(db: SupabaseClient, slug: string, exceptId?: string) {
  let q = db.from("blog_posts").select("id").eq("slug", slug);
  if (exceptId) q = q.neq("id", exceptId);
  const { data } = await q.maybeSingle();
  return Boolean(data);
}

/* -------------------------------------------------------------- rows */

export function rowToCard(r: Record<string, unknown>): BlogCard {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    excerpt: (r.excerpt as string) ?? "",
    coverUrl: (r.cover_url as string) ?? null,
    tags: (r.tags as string[]) ?? [],
    authorName: (r.author_name as string) ?? "Job Alert 24",
    wordCount: (r.word_count as number) ?? 0,
    views: (r.views as number) ?? 0,
    publishedAt: (r.published_at as string) ?? null,
    status: r.status as BlogStatus,
    updatedAt: r.updated_at as string,
  };
}

export function rowToPost(r: Record<string, unknown>): BlogPost {
  return {
    ...rowToCard(r),
    contentHtml: (r.content_html as string) ?? "",
    reviewNote: (r.review_note as string) ?? null,
    authorId: (r.author_id as string) ?? null,
  };
}
