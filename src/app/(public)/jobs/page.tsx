import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicJobs } from "@/lib/actions/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/constants";
import { Briefcase, SearchX } from "lucide-react";
import type { JobCategory } from "@/types";

export const metadata: Metadata = {
  title: "सरकारी नौकरी 2025 - Latest Govt Jobs, Results, Admit Cards",
  description:
    "Browse latest government jobs, sarkari naukri, results, admit cards, answer keys, and scholarships. सरकारी नौकरी भर्ती 2025 - SSC, Railway, Bank, UPSC, State Govt Jobs. Apply online with free job alerts.",
  keywords: [
    "sarkari naukri 2025",
    "government jobs",
    "latest govt jobs",
    "online form",
    "sarkari result",
    "SSC recruitment",
    "railway bharti",
    "bank jobs",
  ],
};

function JobListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-3"
        >
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function JobList({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { jobs, count } = await getPublicJobs({
    category: (searchParams.category as JobCategory) || "all",
    state: searchParams.state,
    qualification: searchParams.qualification,
    search: searchParams.search,
    sort:
      (searchParams.sort as "newest" | "last_date" | "featured") || "newest",
    page: Number(searchParams.page || "1"),
  });

  if (jobs.length === 0) {
    return (
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-12 text-center">
        <div className="icon-3d h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <SearchX className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-slate-600 font-bold">No jobs found</p>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  const categoryLabel = searchParams.category
    ? CATEGORIES.find((c) => c.value === searchParams.category)?.label
    : null;

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4 font-semibold">
        Showing {jobs.length} of {count} {categoryLabel || "results"}
      </p>
      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      <Pagination totalCount={count} />
    </div>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="icon-3d h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Briefcase className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">
            Browse Jobs & Updates
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Find your next opportunity
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <JobFilters />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<JobListSkeleton />}>
          <JobList searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
