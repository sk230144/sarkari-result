"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { getJobsForUserQualification } from "@/lib/actions/users";
import type { UserProfile } from "@/lib/actions/users";

interface JobItem {
  id: string;
  title: string;
  organization: string | null;
  qualification: string | null;
  apply_url: string | null;
}

const WHATSAPP_NUMBER = "916392891566";

export function NotificationActions({ user }: { user: UserProfile }) {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadJobs() {
    if (loaded) return;
    setLoading(true);
    const data = await getJobsForUserQualification(user.qualification || "");
    setJobs(data);
    setLoaded(true);
    setLoading(false);
  }

  function buildWhatsAppUrl() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobalerts24.com";
    const jobLines = jobs
      .map(
        (job, i) =>
          `${i + 1}. ${job.title}${job.organization ? ` - ${job.organization}` : ""}\n${siteUrl}/jobs/${job.id}`
      )
      .join("\n\n");

    const message = `Hello ${user.full_name || "User"}!\n\nHere are the latest jobs matching your qualification (${user.qualification} · ${user.degree_stream}):\n\n${jobLines}\n\n---\nJob Alerts 24 - Govt Jobs Portal`;

    return `https://wa.me/91${user.whatsapp_number}?text=${encodeURIComponent(message)}`;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          onClick={loadJobs}
          title="View matching jobs & send notification"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-slate-800">
            Jobs for {user.full_name || user.email}
          </DialogTitle>
          <p className="text-xs text-slate-500 font-medium">
            Qualification: {user.qualification} · {user.degree_stream} | WhatsApp: +91 {user.whatsapp_number}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              No matching jobs found for this qualification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              {jobs.map((job, i) => (
                <div
                  key={job.id}
                  className="flex items-start gap-2 rounded-lg border border-slate-200/60 bg-slate-50/50 p-3"
                >
                  <span className="text-xs font-bold text-slate-400 mt-0.5 shrink-0">
                    {i + 1}.
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-tight">
                      {job.title}
                    </p>
                    {job.organization && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {job.organization}
                      </p>
                    )}
                    {job.qualification && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Req: {job.qualification}
                      </p>
                    )}
                  </div>
                  <a
                    href={`/jobs/${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                  </a>
                </div>
              ))}
            </div>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                <MessageCircle className="h-4 w-4" />
                Send {jobs.length} Jobs on WhatsApp
              </Button>
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
