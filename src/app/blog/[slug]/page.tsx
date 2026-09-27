import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowRight, CalendarDays, Clock, Eye, FileText, Monitor, PenLine } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BlogCardView, avatarTint } from "@/components/blog/blog-card";
import { AdminPostActions, ReadingProgress, ShareButtons, TableOfContents, ViewBeacon } from "@/components/blog/article-client";
import { isAdminEmail } from "@/lib/admin";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { CARD_COLUMNS, POST_COLUMNS, cleanHtml, rowToCard, rowToPost, withHeadingIds } from "@/lib/blog/server";
import { SLUG_RE, fmtDate, initials, readingMinutes, tagClass } from "@/lib/blog/types";

export const dynamic = "force-dynamic";

const load = cache(async (slug: string) => {
  if (!SLUG_RE.test(slug)) return null;
  const db = serviceDb();
  const { data } = await db.from("blog_posts").select(POST_COLUMNS).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const post = rowToPost(data);
  const user = await getSessionUser();
  const admin = isAdminEmail(user?.email);
  // Drafts and posts in review are visible to their author and admins only.
  if (post.status !== "published" && (!user || (user.id !== post.authorId && !admin))) return null;
  return { post, admin };
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = (await load((await params).slug))?.post;
  if (!post) return { title: "Post not found — Job Alert 24", robots: { index: false } };
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const image = post.coverUrl ? (post.coverUrl.startsWith("/") ? `${site}${post.coverUrl}` : post.coverUrl) : undefined;
  return {
    title: `${post.title} — Job Alert 24 Blog`,
    description: post.excerpt,
    robots: post.status === "published" ? undefined : { index: false, follow: false },
    openGraph: { title: post.title, description: post.excerpt, type: "article", images: image ? [image] : undefined, publishedTime: post.publishedAt ?? undefined, authors: [post.authorName] },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images: image ? [image] : undefined },
  };
}

const STATUS_NOTE: Record<string, string> = {
  draft: "This is a draft. Only you can see it.",
  pending: "Waiting for review. Only you and the Job Alert 24 team can see it until it's approved.",
  rejected: "This post needs changes before it can be published.",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const loaded = await load((await params).slug);
  if (!loaded) notFound();
  const { post, admin } = loaded;
  const { html, toc } = withHeadingIds(cleanHtml(post.contentHtml));
  const { data: more } = await serviceDb()
    .from("blog_posts")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);
  const published = post.status === "published";

  return (
    <DashboardShell canvas="obsidian" backTo="/blog">
      <ReadingProgress />
      {published && <ViewBeacon slug={post.slug} />}
      <article className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        {admin && <AdminPostActions id={post.id} />}
        {!published && !admin && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-3 text-[13px] text-amber-200">
            <span>
              {STATUS_NOTE[post.status]}
              {post.status === "rejected" && post.reviewNote && <span className="mt-1 block text-amber-300/90">Reviewer note: {post.reviewNote}</span>}
            </span>
            <Link href={`/blog/edit/${post.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-300 px-3 py-1.5 text-[12px] font-bold text-black">
              <PenLine className="h-3.5 w-3.5" /> Edit post
            </Link>
          </div>
        )}

        {/* header */}
        <header className="mx-auto max-w-3xl text-center">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((t) => (
                <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} className={`rounded-full border px-3 py-1 text-[12px] font-medium ${tagClass(t)}`}>
                  {t}
                </Link>
              ))}
            </div>
          )}
          <h1 className="mt-5 text-[clamp(1.8rem,4.2vw,3rem)] font-extrabold leading-[1.12] tracking-[-0.04em] text-[var(--color-c-text)]">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-[var(--color-c-muted)]">
            <span className="inline-flex items-center gap-2">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${avatarTint(post.authorName)}`}>{initials(post.authorName)}</span>
              <span className="font-semibold text-[var(--color-c-text)]">{post.authorName}</span>
            </span>
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {fmtDate(post.publishedAt)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {readingMinutes(post.wordCount)} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> {post.wordCount.toLocaleString("en-US")} words
            </span>
            {published && (
              <span className="inline-flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> {post.views.toLocaleString("en-IN")} views
              </span>
            )}
          </div>
        </header>

        {post.coverUrl && (
          <div className="mx-auto mt-9 max-w-5xl overflow-hidden rounded-[26px] border border-white/[0.08] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt={post.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        )}

        {/* body + aside */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="blog-prose min-w-0" dangerouslySetInnerHTML={{ __html: html }} />
          <aside className="order-first lg:order-none">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="hidden lg:block">
                <TableOfContents items={toc} />
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-[#141713] p-4">
                <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">Share this post</p>
                <ShareButtons title={post.title} />
              </div>
              <Link
                href="/mock-interview#generate"
                className="group block overflow-hidden rounded-2xl border border-[var(--color-c-lime)]/25 bg-gradient-to-b from-[var(--color-c-lime)]/[0.09] to-transparent p-4"
              >
                <Monitor className="h-5 w-5 text-[var(--color-c-lime)]" />
                <p className="mt-2.5 text-[14px] font-bold text-[var(--color-c-text)]">Practise before the real round</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-c-muted)]">A free mock interview built from your resume and target role, with feedback on every answer.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[var(--color-c-lime)]">
                  Start a mock interview <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </aside>
        </div>

        {/* more */}
        {(more ?? []).length > 0 && (
          <section className="mx-auto mt-20 max-w-6xl">
            <div className="mb-5 flex items-end justify-between gap-3">
              <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">More from the blog</h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--color-c-lime)] hover:underline">
                All posts <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(more ?? []).map((r) => (
                <BlogCardView key={r.id as string} post={rowToCard(r)} />
              ))}
            </div>
          </section>
        )}
      </article>
    </DashboardShell>
  );
}
