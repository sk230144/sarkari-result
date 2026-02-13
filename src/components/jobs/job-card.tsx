import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  GraduationCap,
  Building2,
  Star,
  ArrowRight,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import type { Job } from "@/types";
import { CATEGORIES } from "@/lib/constants";

const categoryConfig: Record<string, { color: string; iconBg: string }> = {
  job: { color: "bg-blue-50 text-blue-700 border-blue-200", iconBg: "bg-blue-100 text-blue-600" },
  result: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", iconBg: "bg-emerald-100 text-emerald-600" },
  admit_card: { color: "bg-violet-50 text-violet-700 border-violet-200", iconBg: "bg-violet-100 text-violet-600" },
  answer_key: { color: "bg-amber-50 text-amber-700 border-amber-200", iconBg: "bg-amber-100 text-amber-600" },
  syllabus: { color: "bg-pink-50 text-pink-700 border-pink-200", iconBg: "bg-pink-100 text-pink-600" },
  scholarship: { color: "bg-teal-50 text-teal-700 border-teal-200", iconBg: "bg-teal-100 text-teal-600" },
};

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || value;
}

export function JobCard({ job }: { job: Job }) {
  const isExpired = job.last_date && new Date(job.last_date) < new Date();
  const config = categoryConfig[job.category] || categoryConfig.job;

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="relative card-3d rounded-2xl p-4 sm:p-5 overflow-hidden shine">
        {job.is_featured && (
          <div className="absolute top-0 right-0">
            <div className="gradient-amber text-white text-[10px] font-bold px-3.5 py-1.5 rounded-bl-xl shadow-md shadow-amber-500/20">
              <Star className="h-3 w-3 inline mr-0.5 -mt-0.5 fill-white" /> FEATURED
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className={`hidden sm:flex h-12 w-12 rounded-xl icon-3d ${config.iconBg} items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            <Building2 className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={`text-[11px] font-bold border ${config.color}`}>
                {getCategoryLabel(job.category)}
              </Badge>
              {isExpired && (
                <Badge variant="outline" className="text-[10px] border-red-200 text-red-500 bg-red-50/80">Expired</Badge>
              )}
              {job.total_posts && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Users className="h-3 w-3" /> {job.total_posts} Posts
                </span>
              )}
            </div>

            <h3 className="font-black text-[15px] leading-snug text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
              {job.title}
            </h3>

            {job.organization && (
              <p className="text-sm text-slate-400 mt-1 truncate font-semibold group-hover:text-slate-500 transition-colors">{job.organization}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              {job.state && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold group-hover:text-slate-600 transition-colors">
                  <MapPin className="h-3.5 w-3.5 text-slate-300" /> {job.state}
                </span>
              )}
              {job.qualification && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold group-hover:text-slate-600 transition-colors">
                  <GraduationCap className="h-3.5 w-3.5 text-slate-300" /> {job.qualification}
                </span>
              )}
              {job.last_date && (
                <span className={`flex items-center gap-1.5 text-xs font-bold ${isExpired ? "text-red-500" : "text-emerald-600"}`}>
                  <Calendar className="h-3.5 w-3.5" /> Last: {format(new Date(job.last_date), "dd MMM yyyy")}
                </span>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center self-center">
            <div className="h-8 w-8 rounded-lg neu-flat flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
