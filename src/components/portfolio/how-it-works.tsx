import { Upload, Info, Share2, FileText } from "lucide-react";

const SHARE_TARGETS = [
  { label: "LinkedIn", tint: "text-[var(--color-c-blue)]" },
  { label: "Twitter", tint: "text-[var(--color-c-sky-2)]" },
  { label: "GitHub", tint: "text-[var(--color-c-text-4)]" },
  { label: "Email", tint: "text-[var(--color-c-red)]" },
  { label: "WhatsApp", tint: "text-[var(--color-c-emerald-2)]" },
];

export function PortfolioHowItWorks() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
            <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
            How it works
          </span>
          <h2 className="mt-4 text-[26px] font-bold tracking-tight text-[var(--color-c-text)]">
            From resume to portfolio.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-[var(--color-c-muted)]">
            Three steps. One minute. Zero configuration. No design skills
            needed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Step 01 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)]">
            <div className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-c-muted)]">
                <Upload className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
                Step 01 · Upload Your Resume
              </p>
              <h3 className="text-[15px] font-bold leading-snug text-[var(--color-c-text)]">
                Drop your PDF. Any format, any layout. We handle the rest.
              </h3>
            </div>
            <div className="mt-auto flex items-center justify-center border-t border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] p-6">
              <div className="w-full max-w-[230px] rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-1b)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-c-olive)] font-mono text-[8px] font-bold text-[var(--color-c-lime)]">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-[var(--color-c-text)]">
                      resume_rahul_2024.pdf
                    </p>
                    <p className="text-[9px] text-[var(--color-c-dim)]">
                      287 KB · Uploading…
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]">
                  <div className="fill-bar h-full w-[72%] rounded-full bg-[var(--color-c-lime)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)]">
            <div className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-c-muted)]">
                <Info className="h-3.5 w-3.5 text-[var(--color-c-blue)]" />
                Step 02 · AI Builds Your Portfolio
              </p>
              <h3 className="text-[15px] font-bold leading-snug text-[var(--color-c-text)]">
                Our Algo reads every line and structures your entire career in
                seconds.
              </h3>
            </div>
            <div className="mt-auto border-t border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] p-4 font-mono text-[10px] leading-relaxed">
              {[
                ["name", '"Rahul Sharma"', "#a3e635"],
                ["title", '"Full Stack Developer"', "#a3e635"],
                ["skills", '["React","TypeScript","AWS"...]', "#a3e635"],
                ["experience", '"2 roles · 3 years"', "#fbbf24"],
                ["projects", '"4 repos extracted"', "#fbbf24"],
                ["status", '"portfolio_ready ✓"', "#a3e635"],
              ].map(([k, v, color], i) => (
                <p
                  key={k}
                  className="line-in"
                  style={{ animationDelay: `${i * 0.18}s` }}
                >
                  <span className="text-[var(--color-c-sky-2)]">&quot;{k}&quot;</span>:{" "}
                  <span style={{ color }}>{v}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Step 03 — full width */}
          <div className="flex flex-col gap-5 rounded-xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)] p-5 md:col-span-2 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[var(--color-c-muted)]">
                <Share2 className="h-3.5 w-3.5 text-[var(--color-c-violet)]" />
                Step 03 · Share Your Live Portfolio Link
              </p>
              <h3 className="mb-2 text-[15px] font-bold leading-snug text-[var(--color-c-text)]">
                One link. Every recruiter.
                <br />
                Live the moment AI finishes.
              </h3>
              <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                Drop your devsunite.com/u/yourname in job applications, cold
                emails, LinkedIn bio, anywhere. Always current, always fast,
                zero maintenance.
              </p>
            </div>

            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] px-3 py-2">
                <span className="blink h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-c-lime)]" />
                <span className="flex-1 truncate font-mono text-[10px] text-[var(--color-c-text-4)]">
                  devsunite.com/u/rahulsharma
                </span>
                <span className="shrink-0 rounded border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[var(--color-c-lime)]">
                  LIVE
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHARE_TARGETS.map(({ label, tint }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-md border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-7b)] px-2 py-1 text-[10px] text-[var(--color-c-text-4)]"
                  >
                    <FileText className={`h-2.5 w-2.5 ${tint}`} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
