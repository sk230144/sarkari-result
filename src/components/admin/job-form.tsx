"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  FileText,
  Calendar,
  Link2,
  Tag,
  Settings2,
  Info,
} from "lucide-react";
import { createJob, updateJob } from "@/lib/actions/admin";
import { CATEGORIES, STATES, QUALIFICATIONS } from "@/lib/constants";
import { toast } from "sonner";
import type { Job } from "@/types";

interface JobFormProps {
  job?: Job;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="icon-3d h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-slate-700 text-sm">{title}</h2>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

export function JobForm({ job }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!job;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateJob(job.id, formData)
        : await createJob(formData);

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  const inputClass =
    "bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300 focus:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] rounded-lg transition-shadow";

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-5 sm:p-6">
        <SectionHeader
          icon={<Info className="h-4 w-4 text-blue-600" />}
          title="Basic Information"
          subtitle="Title, organization, and classification"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title" className="text-sm text-slate-600">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={job?.title || ""}
              placeholder="e.g. SSC CGL 2026 Recruitment"
              className={`h-11 ${inputClass}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization" className="text-sm text-slate-600">
              Organization
            </Label>
            <Input
              id="organization"
              name="organization"
              defaultValue={job?.organization || ""}
              placeholder="e.g. Staff Selection Commission"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Category</Label>
            <Select name="category" defaultValue={job?.category || "job"}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">State</Label>
            <Select name="state" defaultValue={job?.state || ""}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {STATES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Qualification</Label>
            <Select
              name="qualification"
              defaultValue={job?.qualification || ""}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {QUALIFICATIONS.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dates & Numbers */}
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-5 sm:p-6">
        <SectionHeader
          icon={<Calendar className="h-4 w-4 text-blue-600" />}
          title="Dates & Details"
          subtitle="Important dates, posts count, fees"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="post_date" className="text-sm text-slate-600">
              Post Date
            </Label>
            <Input
              id="post_date"
              name="post_date"
              type="date"
              defaultValue={
                job?.post_date || new Date().toISOString().split("T")[0]
              }
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_date" className="text-sm text-slate-600">
              Last Date
            </Label>
            <Input
              id="last_date"
              name="last_date"
              type="date"
              defaultValue={job?.last_date || ""}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_posts" className="text-sm text-slate-600">
              Total Posts
            </Label>
            <Input
              id="total_posts"
              name="total_posts"
              type="number"
              defaultValue={job?.total_posts || ""}
              placeholder="e.g. 500"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee" className="text-sm text-slate-600">
              Application Fee
            </Label>
            <Input
              id="fee"
              name="fee"
              defaultValue={job?.fee || ""}
              placeholder="e.g. Gen: ₹100, SC/ST: Free"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age_limit" className="text-sm text-slate-600">
              Age Limit
            </Label>
            <Input
              id="age_limit"
              name="age_limit"
              defaultValue={job?.age_limit || ""}
              placeholder="e.g. 18-32 years"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Description & Links */}
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-5 sm:p-6">
        <SectionHeader
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          title="Description & Links"
          subtitle="Job details, notification PDF, and apply link"
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="short_description"
              className="text-sm text-slate-600"
            >
              Short Description
            </Label>
            <Textarea
              id="short_description"
              name="short_description"
              rows={4}
              defaultValue={job?.short_description || ""}
              placeholder="Brief description about this job/result..."
              className={`resize-none ${inputClass}`}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                Notification PDF URL
              </Label>
              <Input
                name="notification_url"
                type="url"
                defaultValue={job?.notification_url || ""}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-slate-600 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                Apply Online URL
              </Label>
              <Input
                name="apply_url"
                type="url"
                defaultValue={job?.apply_url || ""}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-slate-600 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Tags (comma separated)
            </Label>
            <Input
              name="tags"
              defaultValue={job?.tags?.join(", ") || ""}
              placeholder="e.g. SSC, Central Govt, Graduate"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Publishing */}
      <div className="card-3d bg-white rounded-xl border border-slate-200/60 p-5 sm:p-6">
        <SectionHeader
          icon={<Settings2 className="h-4 w-4 text-blue-600" />}
          title="Publishing"
          subtitle="Control visibility and featured status"
        />
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="is_published_checkbox"
              defaultChecked={job?.is_published || false}
              onChange={(e) => {
                const hidden = e.target.form?.querySelector(
                  'input[name="is_published"]'
                ) as HTMLInputElement;
                if (hidden) hidden.value = String(e.target.checked);
              }}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                Publish immediately
              </span>
              <p className="text-xs text-slate-400">
                Visible to public users
              </p>
            </div>
          </label>
          <input
            type="hidden"
            name="is_published"
            defaultValue={String(job?.is_published || false)}
          />

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="is_featured_checkbox"
              defaultChecked={job?.is_featured || false}
              onChange={(e) => {
                const hidden = e.target.form?.querySelector(
                  'input[name="is_featured"]'
                ) as HTMLInputElement;
                if (hidden) hidden.value = String(e.target.checked);
              }}
              className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
            />
            <div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-amber-600 transition-colors">
                Mark as featured
              </span>
              <p className="text-xs text-slate-400">
                Highlighted on home page
              </p>
            </div>
          </label>
          <input
            type="hidden"
            name="is_featured"
            defaultValue={String(job?.is_featured || false)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="btn-3d gradient-hero text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 h-11 px-6 font-black shine"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isEdit ? "Update Job" : "Create Job"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-11 px-6 border-slate-300 text-slate-800 hover:bg-slate-50 hover:text-slate-900 font-bold"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
