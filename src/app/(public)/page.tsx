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
import { CATEGORIES, SITE_NAME, SITE_URL } from "@/lib/constants";
import { format } from "date-fns";
import type { Job } from "@/types";

function HomeJsonLd() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    description:
      "India's trusted government job portal for latest sarkari naukri, results, admit cards, answer keys and scholarships.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Find latest government jobs, sarkari naukri, admit cards, answer keys. सरकारी नौकरी, रिजल्ट, एडमिट कार्ड - 24/7 अपडेट।",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/jobs?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["hi", "en"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

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
      <HomeJsonLd />
      {/* Floating background orbs for entire page */}
      <div className="page-bg-orb w-[500px] h-[500px] bg-blue-200/[0.07] top-[20%] -left-[10%] animate-float-slow" />
      <div className="page-bg-orb w-[400px] h-[400px] bg-indigo-200/[0.06] top-[50%] -right-[8%] animate-float-delayed" />
      <div className="page-bg-orb w-[350px] h-[350px] bg-violet-200/[0.05] bottom-[10%] left-[20%] animate-float" />

      {/* Hero Section */}
      <section className="relative gradient-hero overflow-hidden">
        {/* Mesh grid background */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Live wandering white blush */}
        <div
          className="absolute top-[-10%] left-[5%] w-[300px] h-[300px] rounded-full bg-white/30 blur-[80px]"
          style={{ animation: "blushDrift1 6s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[-5%] right-[10%] w-[260px] h-[260px] rounded-full bg-white/25 blur-[70px]"
          style={{ animation: "blushDrift2 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[20%] left-[45%] w-[220px] h-[220px] rounded-full bg-white/20 blur-[60px]"
          style={{ animation: "blushDrift3 10s ease-in-out infinite" }}
        />

        <div className="relative container mx-auto px-4 py-8 md:py-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 bg-white/[0.12] backdrop-blur-md border border-white/20">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-white text-xs font-bold tracking-wide">
                India&apos;s Trusted Govt Job Portal
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Your Gateway to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-violet-300">
                Government Jobs
              </span>
            </h1>

            <p className="mt-3 text-blue-200/90 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium">
              Latest sarkari naukri, results, admit cards, answer keys &
              scholarships — all in one place.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/jobs">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-800 font-black shadow-lg shadow-black/20 px-7 h-11 text-sm shine"
                >
                  Browse All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/jobs?sort=featured">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/[0.08] backdrop-blur-md border-white/20 text-white hover:bg-white/[0.15] font-black px-7 h-11 text-sm"
                >
                  <Star className="mr-2 h-4 w-4 text-amber-400" />
                  Featured Jobs
                </Button>
              </Link>
            </div>

            {/* Stat pills */}
            <div className="mt-6 flex items-center justify-center gap-3 md:gap-4 flex-wrap">
              <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/[0.1] backdrop-blur-md border border-white/[0.15]">
                <div className="h-5 w-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <Shield className="h-3 w-3 text-emerald-400" />
                </div>
                <span className="text-white text-xs font-bold">100% Free</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/[0.1] backdrop-blur-md border border-white/[0.15]">
                <div className="h-5 w-5 rounded-full bg-cyan-400/20 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-cyan-400" />
                </div>
                <span className="text-white text-xs font-bold">Daily Updated</span>
              </div>
              <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white/[0.1] backdrop-blur-md border border-white/[0.15]">
                <div className="h-5 w-5 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-amber-400" />
                </div>
                <span className="text-white text-xs font-bold">All India</span>
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

        {/* SEO Content Section */}
        <section className="mt-10 card-3d bg-white rounded-xl border border-slate-200/60 p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-slate-800 mb-3">
            Job Alerts 24 - सरकारी नौकरी अलर्ट 2025
          </h2>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed font-medium">
            <p>
              <strong>Job Alerts 24</strong> is your one-stop destination for all government job updates in India.
              We provide the latest <strong>sarkari naukri</strong> notifications, <strong>sarkari result</strong>,
              admit cards, answer keys, syllabus, and scholarship information from official sources.
            </p>
            <p>
              <strong>जॉब अलर्ट्स 24</strong> पर आपको मिलेगी सरकारी नौकरी की ताज़ा जानकारी। नवीनतम{" "}
              <strong>सरकारी भर्ती 2025</strong>, ऑनलाइन फॉर्म, एडमिट कार्ड, आंसर की, सिलेबस
              और रिजल्ट। SSC, UPSC, रेलवे, बैंक, रक्षा विभाग, पुलिस भर्ती, शिक्षक भर्ती
              और राज्य सरकार की सभी नौकरियाँ यहाँ उपलब्ध हैं।
            </p>
            <p>
              Whether you are looking for <strong>SSC CGL</strong>, <strong>UPSC Civil Services</strong>,{" "}
              <strong>Railway RRB NTPC</strong>, <strong>Bank PO/Clerk</strong>,{" "}
              <strong>State PSC</strong>, <strong>Defence Jobs</strong>, <strong>Police Bharti</strong>,
              or <strong>Teaching Jobs</strong> — we cover all central and state government vacancies
              with daily updates so you never miss an opportunity.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
