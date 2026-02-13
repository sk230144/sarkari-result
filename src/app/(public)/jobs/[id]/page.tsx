import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Users,
  IndianRupee,
  Clock,
  FileText,
  ExternalLink,
  ArrowLeft,
  Star,
  Share2,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { getJobById } from "@/lib/actions/jobs";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";

const categoryColors: Record<string, string> = {
  job: "bg-blue-50 text-blue-700 border-blue-200",
  result: "bg-emerald-50 text-emerald-700 border-emerald-200",
  admit_card: "bg-violet-50 text-violet-700 border-violet-200",
  answer_key: "bg-amber-50 text-amber-700 border-amber-200",
  syllabus: "bg-pink-50 text-pink-700 border-pink-200",
  scholarship: "bg-teal-50 text-teal-700 border-teal-200",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    return { title: "Not Found" };
  }

  return {
    title: `${job.title}${job.organization ? ` - ${job.organization}` : ""}`,
    description:
      job.short_description ||
      `${job.title} - Find details about this ${job.category} including last date, eligibility, and how to apply. ${SITE_NAME}`,
  };
}

function InfoCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`neu-flat flex items-center gap-3 p-3.5 rounded-xl border ${
        highlight
          ? "bg-emerald-50/80 border-emerald-200/60"
          : "bg-slate-50/80 border-slate-200/60"
      }`}
    >
      <div
        className={`icon-3d h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? "bg-emerald-100" : "bg-white"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-sm font-bold ${
            highlight ? "text-emerald-700" : "text-slate-700"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job || !job.is_published) {
    notFound();
  }

  const categoryLabel =
    CATEGORIES.find((c) => c.value === job.category)?.label || job.category;
  const isExpired = job.last_date && new Date(job.last_date) < new Date();

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl">
      {/* Back button */}
      <Link href="/jobs">
        <Button
          variant="ghost"
          size="sm"
          className="mb-5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Jobs
        </Button>
      </Link>

      <div className="card-elevated bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
        {/* Header with gradient and floating orbs */}
        <div className="gradient-hero p-6 sm:p-8 relative overflow-hidden">
          {/* Floating orbs */}
          <div className="absolute top-4 right-8 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-2 left-12 w-24 h-24 bg-blue-300/10 rounded-full blur-2xl animate-float-delayed" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-indigo-300/10 rounded-full blur-xl animate-float-slow" />

          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge className="glass text-white border-white/30 text-xs font-bold">
                  {categoryLabel}
                </Badge>
                {job.is_featured && (
                  <Badge className="bg-amber-400/90 text-amber-900 border-0 text-xs font-bold">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {isExpired && (
                  <Badge className="bg-red-400/90 text-white border-0 text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                {job.title}
              </h1>
              {job.organization && (
                <p className="text-blue-100 flex items-center gap-2 mt-3 text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  {job.organization}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="glass text-white/70 hover:text-white shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.state && (
              <InfoCard
                icon={<MapPin className="h-4 w-4 text-blue-500" />}
                label="State"
                value={job.state}
              />
            )}
            {job.qualification && (
              <InfoCard
                icon={<GraduationCap className="h-4 w-4 text-violet-500" />}
                label="Qualification"
                value={job.qualification}
              />
            )}
            <InfoCard
              icon={<Calendar className="h-4 w-4 text-slate-500" />}
              label="Post Date"
              value={format(new Date(job.post_date), "dd MMM yyyy")}
            />
            {job.last_date && (
              <InfoCard
                icon={
                  <Clock
                    className={`h-4 w-4 ${
                      isExpired ? "text-red-500" : "text-emerald-500"
                    }`}
                  />
                }
                label="Last Date"
                value={format(new Date(job.last_date), "dd MMM yyyy")}
                highlight={!isExpired}
              />
            )}
            {job.total_posts && (
              <InfoCard
                icon={<Users className="h-4 w-4 text-orange-500" />}
                label="Total Posts"
                value={String(job.total_posts)}
              />
            )}
            {job.fee && (
              <InfoCard
                icon={<IndianRupee className="h-4 w-4 text-green-600" />}
                label="Application Fee"
                value={job.fee}
              />
            )}
            {job.age_limit && (
              <InfoCard
                icon={<Users className="h-4 w-4 text-amber-500" />}
                label="Age Limit"
                value={job.age_limit}
              />
            )}
          </div>

          {/* Description */}
          {job.short_description && (
            <div className="neu-flat bg-slate-50/80 rounded-xl p-5 border border-slate-200/60">
              <h2 className="font-bold text-slate-700 mb-2 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Description
              </h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">
                {job.short_description}
              </p>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag: string) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`text-xs ${
                      categoryColors[job.category] ||
                      "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {job.apply_url && (
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button className="btn-3d w-full sm:w-auto gradient-hero text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 h-11 px-6 font-black shine">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Online
                </Button>
              </a>
            )}
            {job.notification_url && (
              <a
                href={job.notification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <Button
                  variant="outline"
                  className="btn-3d w-full sm:w-auto h-11 px-6 border-slate-300 text-slate-900 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 font-black"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Notification PDF
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
