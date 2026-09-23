import { Briefcase } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CardSkeleton } from "@/components/ui/brand-loader";

/**
 * Jobs loads inside the same fixed-chrome frame as the real page, so the
 * header and filters hold their position and only the list area changes
 * when results arrive — no layout jump.
 */
export default function Loading() {
  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/" fixedChrome>
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-[var(--color-c-border)]">
          <div className="mx-auto w-full max-w-7xl px-6 py-3 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="h-[30px] w-[74px] rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]" />
              <h1 className="text-[18px] font-bold leading-none tracking-tight text-[var(--color-c-text)]">
                Jobs
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
                <Briefcase className="h-3 w-3" />
                India Tech + Remote
              </span>
              <span className="loader-dot text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
                Loading jobs…
              </span>
            </div>
            <div className="mt-2.5 h-10 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-8">
            <CardSkeleton count={9} />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
