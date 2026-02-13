import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Briefcase,
  FileText,
  CreditCard,
  BookOpen,
  Star,
  Calendar,
  Building2,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  Award,
} from "lucide-react";
import { getLatestJobs, getFeaturedJobs } from "@/lib/actions/jobs";
import { CATEGORIES } from "@/lib/constants";
import { format } from "date-fns";
import type { Job } from "@/types";

const categoryConfig: Record<
  string,
  { icon: React.ReactNode; gradient: string; bg: string }
> = {
  job: {
    icon: <Briefcase className="h-6 w-6" />,
    gradient: "gradient-hero",
    bg: "bg-blue-50 group-hover:bg-blue-100",
  },
  result: {
    icon: <FileText className="h-6 w-6" />,
    gradient: "gradient-green",
    bg: "bg-emerald-50 group-hover:bg-emerald-100",
  },
  admit_card: {
    icon: <CreditCard className="h-6 w-6" />,
    gradient: "gradient-purple",
    bg: "bg-violet-50 group-hover:bg-violet-100",
  },
  answer_key: {
    icon: <BookOpen className="h-6 w-6" />,
    gradient: "gradient-orange",
    bg: "bg-orange-50 group-hover:bg-orange-100",
  },
  syllabus: {
    icon: <Award className="h-6 w-6" />,
    gradient: "gradient-pink",
    bg: "bg-pink-50 group-hover:bg-pink-100",
  },
  scholarship: {
    icon: <Star className="h-6 w-6" />,
    gradient: "gradient-teal",
    bg: "bg-teal-50 group-hover:bg-teal-100",
  },
};

const categoryBadgeColors: Record<string, string> = {
  job: "bg-blue-50 text-blue-700",
  result: "bg-emerald-50 text-emerald-700",
  admit_card: "bg-violet-50 text-violet-700",
  answer_key: "bg-amber-50 text-amber-700",
  syllabus: "bg-pink-50 text-pink-700",
  scholarship: "bg-teal-50 text-teal-700",
};

function QuickJobRow({ job, index }: { job: Job; index: number }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex items-center gap-4 py-3.5 px-4 hover:bg-blue-50/50 transition-all group"
    >
      {/* Number */}
      <span className="text-xs font-bold text-slate-300 w-5 text-center shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            variant="secondary"
            className={`text-[10px] font-bold border-0 ${
              categoryBadgeColors[job.category] || "bg-slate-100 text-slate-600"
            }`}
          >
            {CATEGORIES.find((c) => c.value === job.category)?.label ||
              job.category}
          </Badge>
          {job.is_featured && (
            <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
          )}
        </div>
        <p className="text-sm font-extrabold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
          {job.title}
        </p>
        {job.organization && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium group-hover:text-slate-500 transition-colors">
            <Building2 className="h-3 w-3" />
            {job.organization}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="text-right shrink-0">
        {job.last_date && (
          <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(job.last_date), "dd MMM")}
          </p>
        )}
      </div>

      <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export default async function HomePage() {
  const [latestJobs, featuredJobs] = await Promise.all([
    getLatestJobs(15),
    getFeaturedJobs(6),
  ]);

  return (
    <div className="min-h-screen page-bg">
      {/* Floating background orbs for entire page */}
      <div className="page-bg-orb w-[500px] h-[500px] bg-blue-200/[0.07] top-[20%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[400px] h-[400px] bg-indigo-200/[0.06] top-[50%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[350px] h-[350px] bg-violet-200/[0.05] bottom-[10%] left-[20%] animate-float" />

      {/* Hero Section - Compact */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Background dot pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-5 left-[10%] w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-5 right-[10%] w-40 h-40 bg-blue-300/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-3xl animate-float-slow" />

        <div className="relative container mx-auto px-4 py-10 md:py-14">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-4">
              <Zap className="h-3 w-3 text-amber-300" />
              <span className="text-white/90 text-xs font-bold">
                India&apos;s Trusted Govt Job Portal
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200">
                Government Jobs
              </span>
            </h1>

            <p className="mt-3 text-blue-100/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
              Latest sarkari naukri, results, admit cards, answer keys &
              scholarships — all in one place.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="btn-3d bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-800 font-black shadow-lg shadow-blue-900/20 px-7 h-11 shine"
                >
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/jobs?sort=featured">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass border-white/30 text-white hover:bg-white/20 font-black px-7 h-11"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Featured Jobs
                </Button>
              </Link>
            </div>

            {/* Inline stats */}
            <div className="mt-8 flex items-center justify-center gap-4 md:gap-8 flex-wrap">
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
                <Shield className="h-4 w-4 text-emerald-300" />
                <span className="text-white/90 text-xs font-bold">100% Free</span>
              </div>
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
                <Clock className="h-4 w-4 text-cyan-300" />
                <span className="text-white/90 text-xs font-bold">Daily Updated</span>
              </div>
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
                <TrendingUp className="h-4 w-4 text-amber-300" />
                <span className="text-white/90 text-xs font-bold">All India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const config = categoryConfig[cat.value];
            return (
              <Link
                key={cat.value}
                href={`/jobs?category=${cat.value}`}
                className="group"
              >
                <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-4 text-center shine">
                  <div className="icon-3d h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-600 transition-colors">
                    {config.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {cat.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-10 relative z-10">
        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="icon-3d h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-800">
                    Featured Jobs
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Handpicked opportunities
                  </p>
                </div>
              </div>
              <Link href="/jobs?sort=featured">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold"
                >
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="card-3d bg-white rounded-xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
              {featuredJobs.map((job, i) => (
                <QuickJobRow key={job.id} job={job} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Latest Jobs */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="icon-3d h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Latest Updates
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Most recent notifications
                </p>
              </div>
            </div>
            <Link href="/jobs">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
          {latestJobs.length > 0 ? (
            <div className="card-3d bg-white rounded-xl border border-slate-200/60 overflow-hidden divide-y divide-slate-100">
              {latestJobs.map((job, i) => (
                <QuickJobRow key={job.id} job={job} index={i} />
              ))}
            </div>
          ) : (
            <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-12 text-center">
              <div className="icon-3d h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-slate-600 font-bold">
                No jobs published yet
              </p>
              <p className="text-sm text-slate-400 mt-1 font-medium">
                Check back soon for updates!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
