import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getPublishedPosts } from "@/lib/actions/blog";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
      publishedTime: post.published_at || post.created_at,
      authors: [post.author],
    },
  };
}

const categoryColors: Record<string, string> = {
  guide: "bg-blue-50 text-blue-700",
  tips: "bg-emerald-50 text-emerald-700",
  news: "bg-amber-50 text-amber-700",
  exam: "bg-violet-50 text-violet-700",
  general: "bg-slate-100 text-slate-600",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    url: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[400px] h-[400px] bg-blue-200/[0.07] top-[10%] -right-[10%] animate-float-slow" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="container mx-auto px-4 py-10 max-w-3xl relative z-10">
        {/* Back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        <article className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-10">
          {/* Meta */}
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="secondary"
              className={`text-[10px] font-bold border-0 ${
                categoryColors[post.category] || categoryColors.general
              }`}
            >
              {post.category}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-snug mb-4">
            {post.title}
          </h1>

          {/* Author + Date */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium mb-6 pb-6 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.published_at), "dd MMMM yyyy")}
              </span>
            )}
          </div>

          {/* Content */}
          <div
            className="prose prose-slate prose-sm sm:prose max-w-none
              prose-headings:font-extrabold prose-headings:text-slate-800
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-slate-800 prose-strong:font-extrabold
              prose-li:text-slate-600 prose-li:font-medium
              prose-ul:list-disc prose-ol:list-decimal
              prose-blockquote:border-blue-400 prose-blockquote:text-slate-500
              prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded
              prose-hr:border-slate-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex flex-wrap gap-2 items-center">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* CTA */}
        <div className="mt-6 card-3d bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-center text-white">
          <p className="font-extrabold text-lg mb-1">
            Looking for Government Jobs?
          </p>
          <p className="text-blue-100 text-sm font-medium mb-4">
            Browse latest sarkari naukri, results, and admit cards — all free.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-black text-sm px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Browse All Jobs
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
