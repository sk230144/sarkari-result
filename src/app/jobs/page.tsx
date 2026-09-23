import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Briefcase, RefreshCw, AlertCircle, Database } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { BackButton } from "@/components/dashboard/back-button";
import { getJobs, getJobFacets } from "@/lib/jobs";
import { PAGE_SIZE } from "@/lib/jobs-shared";

export const metadata: Metadata = {
  title: "Jobs — Job Alert 24",
  description:
    "India tech jobs and India-eligible remote roles, pulled automatically from company career pages and refreshed through the day.",
};

// Listings change through the day; revalidate rather than caching the build.
export const revalidate = 300;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) || undefined;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = {
    q: one(sp.q),
    category: one(sp.category),
    city: one(sp.city),
    remote: one(sp.remote),
    experience: one(sp.experience),
    page: Number(one(sp.page) ?? 1) || 1,
  };

  const [result, facets] = await Promise.all([
    getJobs(filters),
    getJobFacets(),
  ]);

  const lastSync = facets.lastSync
    ? new Date(facets.lastSync).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/" fixedChrome>
      {/* Three rows: header and pagination hold their height, the list
          between them takes the remainder and scrolls on its own. */}
      <div className="flex h-full flex-col">
        {/* --- pinned header --- */}
        <div className="shrink-0 border-b border-[var(--color-c-border)]">
          <div className="mx-auto w-full max-w-7xl px-6 py-3 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <BackButton fallback="/" />

              <h1 className="text-[18px] font-bold leading-none tracking-tight text-[var(--color-c-text)]">
                Jobs
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
                <Briefcase className="h-3 w-3" />
                India Tech + Remote
              </span>

              {/* Counts and freshness sit on the same line rather than
                  taking three stacked rows of vertical space. */}
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
                {result.total.toLocaleString("en-IN")}{" "}
                {result.total === 1 ? "job" : "jobs"}
                {result.total > PAGE_SIZE &&
                  ` · page ${result.page} of ${result.pageCount}`}
              </span>

              {lastSync && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-[var(--color-c-dim)]">
                  <RefreshCw className="h-3 w-3" />
                  {lastSync}
                </span>
              )}
            </div>

            {!result.error && (
              <div className="mt-2.5">
                <Suspense fallback={<div className="h-10" />}>
                  <JobFilters
                    cities={facets.cities}
                    categories={facets.categories}
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* --- scrolling list --- */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
            {/* The table is missing or unreachable — say so instead of
                showing an empty list that reads as "no jobs today". */}
            {result.error ? (
              <SetupNotice message={result.error} />
            ) : result.jobs.length === 0 ? (
              <EmptyState
                hasFilters={Boolean(
                  filters.q ||
                    filters.category ||
                    filters.city ||
                    filters.remote ||
                    filters.experience,
                )}
              />
            ) : (
              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {result.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </section>
            )}
          </div>
        </div>

        {/* --- pinned pagination --- */}
        {!result.error && result.pageCount > 1 && (
          <div className="shrink-0 border-t border-[var(--color-c-border)] bg-[var(--color-c-obsidian)]">
            <div className="mx-auto w-full max-w-7xl px-6 py-2.5 lg:px-8">
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                sp={sp}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function Pagination({
  page,
  pageCount,
  sp,
}: {
  page: number;
  pageCount: number;
  sp: Record<string, string | string[] | undefined>;
}) {
  const href = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k !== "page" && typeof v === "string") next.set(k, v);
    }
    if (p > 1) next.set("page", String(p));
    const qs = next.toString();
    return qs ? `/jobs?${qs}` : "/jobs";
  };

  return (
    // The pinned footer container supplies the border and padding.
    <nav className="flex items-center justify-between">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="rounded-lg border border-[var(--color-c-border)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)]"
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-[11px] text-[var(--color-c-dim)]">
        {page} / {pageCount}
      </span>
      {page < pageCount ? (
        <Link
          href={href(page + 1)}
          className="rounded-lg border border-[var(--color-c-border)] px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)]"
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-10 text-center">
      <Briefcase className="mx-auto h-8 w-8 text-[var(--color-c-dim)]" />
      <p className="mt-3 text-[13px] font-semibold text-[var(--color-c-text)]">
        {hasFilters ? "No jobs match those filters" : "No jobs yet"}
      </p>
      <p className="mt-1 text-[12px] text-[var(--color-c-muted)]">
        {hasFilters ? (
          <>
            Try widening the search —{" "}
            <Link href="/jobs" className="text-[var(--color-c-lime)] hover:underline">
              clear all filters
            </Link>
            .
          </>
        ) : (
          "The ingestion worker hasn't published any listings yet. New roles appear here automatically after the next sync."
        )}
      </p>
    </div>
  );
}

/** Shown when the jobs table isn't reachable — usually a pending migration. */
function SetupNotice({ message }: { message: string }) {
  const missingTable = /does not exist|schema cache|relation/i.test(message);

  return (
    <div className="rounded-xl border border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim)] p-6">
      <div className="flex items-start gap-3">
        {missingTable ? (
          <Database className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-c-amber)]" />
        ) : (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-c-amber)]" />
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[var(--color-c-text)]">
            {missingTable ? "Database not set up yet" : "Jobs are unavailable"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-c-text-4)]">
            {missingTable ? (
              <>
                Run <code className="rounded bg-[var(--color-c-surface-1)] px-1 py-0.5">supabase/migrations/0001_jobs_ingestion.sql</code>{" "}
                in the Supabase SQL editor, then seed and sync the worker.
              </>
            ) : (
              "The jobs service returned an error. Listings will appear once it recovers."
            )}
          </p>
          <p className="mt-2 font-mono text-[10px] text-[var(--color-c-dim)]">{message}</p>
        </div>
      </div>
    </div>
  );
}
