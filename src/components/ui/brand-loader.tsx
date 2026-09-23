import { LogoClimb } from "./logo";

/**
 * The brand loading state, used by every route's `loading.tsx`.
 *
 * Built from the same walking mark and lowercase wordmark as the navbar, so a
 * loading screen reads as the product rather than a generic spinner. Server
 * component — pure CSS animation, no client JS needed to render it.
 */
export function BrandLoader({
  label = "Loading",
  fullScreen = true,
}: {
  /** What is being fetched, e.g. "Loading jobs". */
  label?: string;
  /** False when it sits inside an existing shell rather than a blank route. */
  fullScreen?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex w-full flex-col items-center justify-center gap-6 ${
        fullScreen ? "min-h-screen" : "min-h-[60vh]"
      } bg-[var(--color-c-canvas-deep)]`}
    >
      {/* Rings orbit the walking figure at the centre. */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="loader-ring absolute inset-0 rounded-full border-2 border-[var(--color-c-lime)]/15 border-t-[var(--color-c-lime)]" />
        <span className="loader-ring-slow absolute inset-2 rounded-full border-2 border-[var(--color-c-green)]/10 border-b-[var(--color-c-green)]" />
        <span className="loader-glow absolute inset-5 rounded-full bg-[var(--color-c-lime)]/10 blur-md" />
        {/* The logo itself walks while the rings turn around it. */}
        <LogoClimb
          className="relative h-11 w-11 text-[var(--color-c-lime)]"
          animate="always"
        />
      </div>

      <div className="flex flex-col items-center gap-2.5">
        <span className="text-[20px] font-bold lowercase tracking-tight text-[var(--color-c-text)]">
          jobalert24
        </span>

        {/* Three dots stagger so the wait reads as progress, not a freeze. */}
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-c-dim)]">
          {label}
          <span className="flex gap-1">
            <i className="loader-dot h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
            <i className="loader-dot loader-dot-2 h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
            <i className="loader-dot loader-dot-3 h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
          </span>
        </span>
      </div>

      {/* Screen readers get the status; the visual is decorative. */}
      <span className="sr-only">{label}, please wait.</span>
    </div>
  );
}

/**
 * Card-shaped placeholder for lists that load in place. Mirrors JobCard's
 * geometry so the layout does not jump when real content replaces it.
 */
export function CardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="skeleton-card rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4"
          // Staggered so the shimmer sweeps across the grid rather than
          // every card pulsing in lockstep.
          style={{ animationDelay: `${(i % 3) * 120}ms` }}
        >
          <div className="h-3.5 w-3/4 rounded bg-[var(--color-c-border)]" />
          <div className="mt-2.5 h-2.5 w-1/2 rounded bg-[var(--color-c-border)]" />
          <div className="mt-4 flex gap-2">
            <div className="h-2 w-16 rounded bg-[var(--color-c-border)]" />
            <div className="h-2 w-12 rounded bg-[var(--color-c-border)]" />
          </div>
          <div className="mt-4 flex gap-1.5">
            <div className="h-4 w-14 rounded-full bg-[var(--color-c-border)]" />
            <div className="h-4 w-16 rounded-full bg-[var(--color-c-border)]" />
            <div className="h-4 w-12 rounded-full bg-[var(--color-c-border)]" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-c-border)] pt-3">
            <div className="h-2 w-20 rounded bg-[var(--color-c-border)]" />
            <div className="h-6 w-16 rounded-lg bg-[var(--color-c-border)]" />
          </div>
        </div>
      ))}
    </section>
  );
}

export default BrandLoader;
