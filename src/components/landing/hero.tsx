import { Sparkles, ArrowUp, Search, Chrome } from "lucide-react";
import { ShaderBackground } from "./shader-background";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden border-b border-[var(--color-c-raised)] px-6 py-20 text-center">
      {/* Living WebGL background — emerald auroras, dot matrix, telemetry rail */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        <ShaderBackground />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[var(--color-c-canvas-deep)]/40 via-transparent to-[var(--color-c-canvas-deep)]/80"
      />

      {/* Side dot rails */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 select-none flex-col gap-1.5 lg:flex"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--color-c-green)]" />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 select-none flex-col gap-1.5 opacity-30 lg:flex"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[var(--color-c-green)]" />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-c-forest-7)] bg-[var(--color-c-surface-3)]/90 px-4 py-1.5 shadow-[0_0_15px_rgba(74,222,128,0.1)] backdrop-blur-sm">
          <span className="text-sm">🌐</span>
          <span className="text-xs font-medium text-[var(--color-c-text-dim)]">
            Trusted by{" "}
            <strong className="font-semibold text-[var(--color-c-text)]">
              100K+ developers
            </strong>{" "}
            across the globe
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-[var(--color-c-text)] sm:text-6xl lg:text-7xl">
          One place for your entire <br />
          <span className="mt-2 inline-block rounded-full border-2 border-[var(--color-c-green)]/80 bg-[var(--color-c-green-dim-7)]/95 px-6 py-1.5 text-[var(--color-c-green)] shadow-[0_0_30px_rgba(74,222,128,0.25)] backdrop-blur-sm">
            job search.
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-base leading-relaxed text-[var(--color-c-text-dim)] sm:text-lg">
          See exactly what&apos;s failing in your resume, apply in one click,
          and walk into every interview prepared.
        </p>

        {/* AI prompt bar */}
        <div className="mx-auto mb-9 w-full max-w-2xl">
          <div className="flex items-center justify-between gap-3 rounded-full border border-[var(--color-c-forest-12)] bg-[var(--color-c-surface-4b)]/95 px-5 py-3 shadow-2xl backdrop-blur-md transition-colors focus-within:border-[var(--color-c-green)]">
            <div className="flex flex-1 items-center gap-3 overflow-hidden text-left">
              <Sparkles className="h-5 w-5 shrink-0 text-[var(--color-c-green)]" />
              <span className="truncate text-sm text-[var(--color-c-text-4)]">
                Why did my resume score 62/100 for this JD?
                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[var(--color-c-green)] align-middle" />
              </span>
            </div>
            <button
              type="button"
              aria-label="Submit search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-green)] text-black transition-transform hover:scale-105 hover:bg-[var(--color-c-accent)]"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-c-green)] px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-c-emerald-2)]"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
            <span>Search Jobs</span>
          </a>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-[var(--color-c-forest-20)] bg-[var(--color-c-surface-7)]/95 px-6 py-3.5 text-sm font-semibold text-[var(--color-c-text)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--color-c-surface-15b)]"
          >
            <Chrome className="h-4 w-4 text-[var(--color-c-green)]" />
            <span>Download Auto-Apply Extension</span>
          </a>
        </div>
      </div>
    </section>
  );
}
