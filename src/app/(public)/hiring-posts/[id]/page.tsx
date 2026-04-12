import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, MapPin, Wifi, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHiringPostById } from "@/lib/actions/hiring-posts";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { ShareButton } from "./share-button";
import { ImageViewer } from "./image-viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getHiringPostById(id);

  if (!post) return { title: "Not Found" };

  const title = post.company_name
    ? `${post.title} — ${post.company_name}`
    : post.title;
  const description =
    post.description
      ? post.description.slice(0, 160)
      : `${post.title} — Hiring now. Check out this job opportunity on ${SITE_NAME}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/hiring-posts/${id}`,
      type: "article",
      ...(post.image_url ? { images: [{ url: post.image_url }] } : {}),
    },
    twitter: {
      card: post.image_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(post.image_url ? { images: [post.image_url] } : {}),
    },
    alternates: {
      canonical: `${SITE_URL}/hiring-posts/${id}`,
    },
  };
}

const EMAIL_REGEX = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;

function renderWithEmails(text: string): React.ReactNode {
  const parts = text.split(EMAIL_REGEX);
  return parts.map((part, i) =>
    EMAIL_REGEX.test(part) ? (
      <a
        key={i}
        href={`mailto:${part}`}
        className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5 hover:bg-emerald-100 transition-colors"
      >
        ✉ {part}
      </a>
    ) : (
      part
    )
  );
}

export default async function HiringPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getHiringPostById(id);

  if (!post) notFound();

  const shareUrl = `${SITE_URL}/hiring-posts/${id}`;
  const shareTitle = post.company_name
    ? `${post.title} — ${post.company_name}`
    : post.title;

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-87.5 h-87.5 bg-emerald-200/[0.07] top-[5%] -left-[8%]" />
      <div className="page-bg-orb w-75 h-75 bg-violet-200/6 top-[50%] -right-[6%]" />

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Back */}
        <Link href="/corporate-jobs">
          <Button
            variant="ghost"
            size="sm"
            className="mb-5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Corporate Jobs
          </Button>
        </Link>

        <div className="card-elevated bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
          {/* Hero banner */}
          <div className="relative bg-linear-to-br from-emerald-600 to-teal-700 p-6 sm:p-8">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                  <Briefcase className="h-3 w-3 text-white/80" />
                  <span className="text-white/90 text-xs font-bold">Hiring Now</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                  {post.title}
                </h1>
                {post.company_name && (
                  <p className="text-emerald-100 text-sm font-semibold mt-2">
                    {post.company_name}
                  </p>
                )}
                {/* Work mode badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                    post.work_mode === "remote"
                      ? "bg-white/20 text-white"
                      : post.work_mode === "hybrid"
                      ? "bg-white/20 text-white"
                      : "bg-white/20 text-white"
                  }`}>
                    {post.work_mode === "remote" ? (
                      <Wifi className="h-3 w-3" />
                    ) : (
                      <MapPin className="h-3 w-3" />
                    )}
                    {post.work_mode.charAt(0).toUpperCase() + post.work_mode.slice(1)}
                  </span>
                </div>
              </div>
              <ShareButton url={shareUrl} title={shareTitle} />
            </div>
          </div>

          {/* Image */}
          {post.image_url && (
            <ImageViewer src={post.image_url} alt={post.title} />
          )}

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Description */}
            {post.description && (
              <div className="space-y-2">
                <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Details
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {renderWithEmails(post.description)}
                </p>
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full border border-violet-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share CTA */}
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-extrabold text-emerald-800">Share this job</p>
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  Help someone find their next opportunity
                </p>
              </div>
              <ShareButton url={shareUrl} title={shareTitle} variant="solid" />
            </div>
          </div>
        </div>

        {/* Back link at bottom */}
        <div className="mt-6 text-center">
          <Link
            href="/corporate-jobs"
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            ← See all hiring posts
          </Link>
        </div>
      </div>
    </div>
  );
}
