import { Building2, MapPin, Clock, ExternalLink, Wifi } from "lucide-react";
import type { Job } from "@/lib/jobs-shared";
import { REMOTE_LABELS, CATEGORY_LABELS } from "@/lib/jobs-shared";

/** "3 days ago" — the freshness signal readers scan for first. */
function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}

function salary(job: Job): string | null {
  if (job.salary_min == null && job.salary_max == null) return null;
  const cur = job.salary_currency ?? "";
  const fmt = (n: number) =>
    n >= 100_000 ? `${Math.round(n / 1000)}k` : String(Math.round(n));
  if (job.salary_min != null && job.salary_max != null) {
    return `${cur} ${fmt(job.salary_min)}–${fmt(job.salary_max)}`.trim();
  }
  const one = job.salary_min ?? job.salary_max;
  return one != null ? `${cur} ${fmt(one)}+`.trim() : null;
}

export function JobCard({ job }: { job: Job }) {
  const posted = timeAgo(job.source_posted_at ?? job.first_seen_at);
  const pay = salary(job);
  const isRemote = job.remote_type.startsWith("remote");
  const place = job.city ?? (isRemote ? REMOTE_LABELS[job.remote_type] ?? "Remote" : null);

  return (
    <article className="group rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--color-c-border-strong)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[14px] font-bold leading-snug text-[var(--color-c-text)]">
            {job.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-c-muted)]">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.company_name}</span>
          </p>
        </div>

        {posted && (
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-c-dim)]">
            <Clock className="h-3 w-3" />
            {posted}
          </span>
        )}
      </div>

      {/* Facts */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[var(--color-c-muted)]">
        {place && (
          <span className="inline-flex items-center gap-1">
            {isRemote ? <Wifi className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
            {place}
          </span>
        )}
        {job.experience_level && (
          <span className="inline-flex items-center gap-1">{job.experience_level} yrs</span>
        )}
        {pay && <span className="font-medium text-[var(--color-c-lime)]">{pay}</span>}
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {job.role_category && (
          <span className="rounded-full bg-[var(--color-c-chip-easy)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-c-lime)]">
            {CATEGORY_LABELS[job.role_category] ?? job.role_category}
          </span>
        )}
        {job.tech_stack.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-full border border-[var(--color-c-border)] px-2 py-0.5 text-[10px] text-[var(--color-c-text-4)]"
          >
            {t}
          </span>
        ))}
        {job.tech_stack.length > 4 && (
          <span className="text-[10px] text-[var(--color-c-dim)]">
            +{job.tech_stack.length - 4}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-c-border)] pt-3">
        {/* Provenance, per §16 — readers see where a listing came from. */}
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
          via {job.source}
        </span>
        <a
          href={job.apply_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)]"
        >
          Apply
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}
