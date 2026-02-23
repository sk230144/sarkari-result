"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";
import { AdminJobActions } from "@/components/admin/job-actions";
import { deleteMultipleJobs } from "@/lib/actions/admin";
import { toast } from "sonner";
import { Trash2, CheckSquare, Square, Minus } from "lucide-react";
import type { Job } from "@/types";

const categoryBadgeColors: Record<string, string> = {
  job: "bg-blue-50 text-blue-700",
  result: "bg-emerald-50 text-emerald-700",
  admit_card: "bg-violet-50 text-violet-700",
  answer_key: "bg-amber-50 text-amber-700",
  syllabus: "bg-pink-50 text-pink-700",
  scholarship: "bg-teal-50 text-teal-700",
};

export function AdminJobsClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const allSelected = selected.size === jobs.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(jobs.map((j) => j.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleMultiDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected job(s)? This cannot be undone.`)) return;

    setDeleting(true);
    const result = await deleteMultipleJobs(Array.from(selected));
    setDeleting(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`${selected.size} job(s) deleted`);
      setSelected(new Set());
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      {/* Multi-select toolbar */}
      <div className="flex items-center gap-3 py-2 px-1">
        {/* Select all checkbox */}
        <button
          onClick={toggleAll}
          className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
          title={allSelected ? "Deselect all" : "Select all"}
        >
          {allSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-600" />
          ) : someSelected ? (
            <Minus className="h-5 w-5 text-blue-400" />
          ) : (
            <Square className="h-5 w-5" />
          )}
        </button>

        {selected.size > 0 ? (
          <>
            <span className="text-sm font-bold text-slate-600">
              {selected.size} selected
            </span>
            <Button
              onClick={handleMultiDelete}
              disabled={deleting}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white font-black border-0 shadow-sm shadow-red-500/20 ml-1"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {deleting ? "Deleting..." : `Delete ${selected.size}`}
            </Button>
          </>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            Select jobs to delete in bulk
          </span>
        )}
      </div>

      {/* Job list */}
      {jobs.map((job) => {
        const catLabel =
          CATEGORIES.find((c) => c.value === job.category)?.label ||
          job.category;
        const isSelected = selected.has(job.id);

        return (
          <div
            key={job.id}
            className={`card-3d bg-white rounded-xl border transition-colors ${
              isSelected
                ? "border-blue-300 bg-blue-50/30"
                : "border-slate-200/60"
            }`}
          >
            <div className="flex items-start gap-3 p-4">
              {/* Checkbox */}
              <button
                onClick={() => toggleOne(job.id)}
                className="mt-0.5 text-slate-300 hover:text-blue-600 transition-colors shrink-0"
              >
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <Badge
                    variant="secondary"
                    className={`text-[11px] font-bold border-0 ${
                      categoryBadgeColors[job.category] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {catLabel}
                  </Badge>
                  {job.is_published ? (
                    <Badge className="text-[11px] bg-emerald-50 text-emerald-700 border-0 font-bold">
                      Published
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[11px] border-slate-300 text-slate-500"
                    >
                      Draft
                    </Badge>
                  )}
                  {job.is_featured && (
                    <Badge className="text-[11px] bg-amber-50 text-amber-700 border-0 font-bold">
                      Featured
                    </Badge>
                  )}
                </div>
                <Link
                  href={`/admin/jobs/${job.id}/edit`}
                  className="font-extrabold text-sm text-slate-800 hover:text-blue-700 transition-colors link-hover"
                >
                  {job.title}
                </Link>
                {job.organization && (
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    {job.organization}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Created {format(new Date(job.created_at), "dd MMM yyyy")}
                  {job.last_date &&
                    ` · Last date: ${format(new Date(job.last_date), "dd MMM yyyy")}`}
                </p>
              </div>

              {/* Actions dropdown */}
              <AdminJobActions job={job} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
