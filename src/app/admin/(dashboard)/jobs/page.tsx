import Link from "next/link";
import { getAdminJobs } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Sparkles } from "lucide-react";
import { AdminJobsClient } from "@/components/admin/admin-jobs-client";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page || "1");
  const search = params.search || "";
  const { jobs, count } = await getAdminJobs(page, search);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Manage Jobs</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {count} total posts
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button className="btn-3d gradient-hero text-white shadow-lg shadow-blue-500/25 font-black shine">
            <Plus className="h-4 w-4 mr-1.5" />
            New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-12 text-center relative overflow-hidden">
          <div className="absolute top-4 right-8 w-32 h-32 bg-blue-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-4 left-8 w-24 h-24 bg-indigo-100/30 rounded-full blur-2xl" />
          <div className="relative">
            <div className="icon-3d h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 animate-float">
              <Briefcase className="h-7 w-7 text-blue-400" />
            </div>
            <p className="text-slate-600 font-bold text-lg">No jobs yet</p>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Create your first job post to get started
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Your portal awaits content</span>
            </div>
            <Link href="/admin/jobs/new" className="inline-block mt-5">
              <Button className="btn-3d gradient-hero text-white shadow-lg shadow-blue-500/25 shine">
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Job
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <AdminJobsClient jobs={jobs} />
      )}
    </div>
  );
}
