import { Sparkles, ArrowUp, Search, Chrome } from "lucide-react";
import { ShaderBackground } from "./shader-background";

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden border-b border-[#182016] px-6 py-20 text-center">
      {/* Living WebGL background — emerald auroras, dot matrix, telemetry rail */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full">
        <ShaderBackground />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#0c0e0b]/40 via-transparent to-[#0c0e0b]/80"
      />

      {/* Side dot rails */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-10 top-1/2 z-10 hidden -translate-y-1/2 select-none flex-col gap-1.5 lg:flex"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-10 top-1/2 z-10 hidden -translate-y-1/2 select-none flex-col gap-1.5 opacity-30 lg:flex"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121611]/90 px-4 py-1.5 shadow-[0_0_15px_rgba(74,222,128,0.1)] backdrop-blur-sm">
          <span className="text-sm">🌐</span>
          <span className="text-xs font-medium text-[#9ca3af]">
            Trusted by{" "}
            <strong className="font-semibold text-white">
              100K+ developers
            </strong>{" "}
            across the globe
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-6xl lg:text-7xl">
          One place for your entire <br />
          <span className="mt-2 inline-block rounded-full border-2 border-[#4ade80]/80 bg-[#142e1b]/95 px-6 py-1.5 text-[#4ade80] shadow-[0_0_30px_rgba(74,222,128,0.25)] backdrop-blur-sm">
            job search.
          </span>
        </h1>

        <p className="mb-10 max-w-2xl text-base leading-relaxed text-[#9ca3af] sm:text-lg">
          See exactly what&apos;s failing in your resume, apply in one click,
          and walk into every interview prepared.
        </p>

        {/* AI prompt bar */}
        <div className="mx-auto mb-9 w-full max-w-2xl">
          <div className="flex items-center justify-between gap-3 rounded-full border border-[#263523] bg-[#131711]/95 px-5 py-3 shadow-2xl backdrop-blur-md transition-colors focus-within:border-[#4ade80]">
            <div className="flex flex-1 items-center gap-3 overflow-hidden text-left">
              <Sparkles className="h-5 w-5 shrink-0 text-[#4ade80]" />
              <span className="truncate text-sm text-[#d1d5db]">
                Why did my resume score 62/100 for this JD?
                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-[#4ade80] align-middle" />
              </span>
            </div>
            <button
              type="button"
              aria-label="Submit search"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4ade80] text-black transition-transform hover:scale-105 hover:bg-[#22c55e]"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#jobs"
            className="inline-flex items-center gap-2 rounded-full bg-[#4ade80] px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all hover:-translate-y-0.5 hover:bg-[#34d399]"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
            <span>Search Jobs</span>
          </a>
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-[#2b3926] bg-[#161a14]/95 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-[#1f251c]"
          >
            <Chrome className="h-4 w-4 text-[#4ade80]" />
            <span>Download Auto-Apply Extension</span>
          </a>
        </div>
      </div>
    </section>
  );
}
