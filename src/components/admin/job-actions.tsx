"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";
import {
  deleteJob,
  toggleJobPublish,
  toggleJobFeatured,
} from "@/lib/actions/admin";
import { toast } from "sonner";
import type { Job } from "@/types";

export function AdminJobActions({ job }: { job: Job }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this job?")) return;
    const result = await deleteJob(job.id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Job deleted");
      router.refresh();
    }
  }

  async function handleTogglePublish() {
    const result = await toggleJobPublish(job.id, !job.is_published);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(job.is_published ? "Job unpublished" : "Job published");
      router.refresh();
    }
  }

  async function handleToggleFeatured() {
    const result = await toggleJobFeatured(job.id, !job.is_featured);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(
        job.is_featured ? "Removed from featured" : "Marked as featured"
      );
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/jobs/${job.id}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTogglePublish}>
          {job.is_published ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleFeatured}>
          <Star className="h-4 w-4 mr-2" />
          {job.is_featured ? "Remove Featured" : "Mark Featured"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
