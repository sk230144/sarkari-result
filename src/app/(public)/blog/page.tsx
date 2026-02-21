import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/actions/blog";
import { SITE_URL } from "@/lib/constants";
import { Calendar, User, Tag, ArrowRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog - Government Job Tips, Exam Guides & Career Advice",
  description:
    "Read expert articles on government job preparation, SSC, UPSC, Railway exam tips, resume writing, and career guidance. Free guides for sarkari naukri aspirants.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

const categoryColors: Record<string, string> = {
  guide: "bg-blue-50 text-blue-700",
  tips: "bg-emerald-50 text-emerald-700",
  news: "bg-amber-50 text-amber-700",
  exam: "bg-violet-50 text-violet-700",
  general: "bg-slate-100 text-slate-600",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts(20);

  return (
    <div className="min-h-screen page-bg">
      <div className="page-bg-orb w-[400px] h-[400px] bg-blue-200/[0.07] top-[10%] -right-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[300px] h-[300px] bg-indigo-200/[0.06] bottom-[20%] -left-[8%] animate-float-delayed" />

      <div className="container mx-auto px-4 py-10 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 bg-blue-50 border border-blue-100">
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-blue-700 text-xs font-bold tracking-wide">
              Career Guides & Exam Tips
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            Job Alerts 24{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Blog
            </span>
          </h1>
          <p className="text-slate-500 text-base font-medium max-w-xl mx-auto">
            Expert guides, exam tips, and career advice for government job
            aspirants.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-16 text-center">
            <div className="icon-3d h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-slate-600 font-bold">No posts published yet</p>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Check back soon for expert guides!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <article className="card-3d bg-white rounded-xl border border-slate-200/60 p-6 h-full flex flex-col hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold border-0 ${
                        categoryColors[post.category] || categoryColors.general
                      }`}
                    >
                      {post.category}
                    </Badge>
                  </div>

                  <h2 className="text-base font-extrabold text-slate-800 group-hover:text-blue-700 transition-colors mb-2 leading-snug">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.published_at), "dd MMM yyyy")}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
