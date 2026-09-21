import { Upload, Info, Share2, FileText } from "lucide-react";

const SHARE_TARGETS = [
  { label: "LinkedIn", tint: "text-[#60a5fa]" },
  { label: "Twitter", tint: "text-[#7dd3fc]" },
  { label: "GitHub", tint: "text-[#d1d5db]" },
  { label: "Email", tint: "text-[#f87171]" },
  { label: "WhatsApp", tint: "text-[#34d399]" },
];

export function PortfolioHowItWorks() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2f4a25] bg-[#16210f] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#a3e635]">
            <span className="blink h-1 w-1 rounded-full bg-[#a3e635]" />
            How it works
          </span>
          <h2 className="mt-4 text-[26px] font-bold tracking-tight text-white">
            From resume to portfolio.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-[#8c9c90]">
            Three steps. One minute. Zero configuration. No design skills
            needed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Step 01 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#242a22] bg-[#111411]">
            <div className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[#8c9c90]">
                <Upload className="h-3.5 w-3.5 text-[#a3e635]" />
                Step 01 · Upload Your Resume
              </p>
              <h3 className="text-[15px] font-bold leading-snug text-white">
                Drop your PDF. Any format, any layout. We handle the rest.
              </h3>
            </div>
            <div className="mt-auto flex items-center justify-center border-t border-[#242a22] bg-[#0b0e0b] p-6">
              <div className="w-full max-w-[230px] rounded-lg border border-[#242a22] bg-[#101310] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#2f4a25] font-mono text-[8px] font-bold text-[#a3e635]">
                    PDF
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-white">
                      resume_rahul_2024.pdf
                    </p>
                    <p className="text-[9px] text-[#6b7280]">
                      287 KB · Uploading…
                    </p>
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#1e241d]">
                  <div className="fill-bar h-full w-[72%] rounded-full bg-[#a3e635]" />
                </div>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#242a22] bg-[#111411]">
            <div className="p-5">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[#8c9c90]">
                <Info className="h-3.5 w-3.5 text-[#60a5fa]" />
                Step 02 · AI Builds Your Portfolio
              </p>
              <h3 className="text-[15px] font-bold leading-snug text-white">
                Our Algo reads every line and structures your entire career in
                seconds.
              </h3>
            </div>
            <div className="mt-auto border-t border-[#242a22] bg-[#0b0e0b] p-4 font-mono text-[10px] leading-relaxed">
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
                  <span className="text-[#7dd3fc]">&quot;{k}&quot;</span>:{" "}
                  <span style={{ color }}>{v}</span>
                </p>
              ))}
            </div>
          </div>

          {/* Step 03 — full width */}
          <div className="flex flex-col gap-5 rounded-xl border border-[#242a22] bg-[#111411] p-5 md:col-span-2 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] text-[#8c9c90]">
                <Share2 className="h-3.5 w-3.5 text-[#a78bfa]" />
                Step 03 · Share Your Live Portfolio Link
              </p>
              <h3 className="mb-2 text-[15px] font-bold leading-snug text-white">
                One link. Every recruiter.
                <br />
                Live the moment AI finishes.
              </h3>
              <p className="text-[11px] leading-relaxed text-[#8c9c90]">
                Drop your devsunite.com/u/yourname in job applications, cold
                emails, LinkedIn bio, anywhere. Always current, always fast,
                zero maintenance.
              </p>
            </div>

            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#242a22] bg-[#0b0e0b] px-3 py-2">
                <span className="blink h-1.5 w-1.5 shrink-0 rounded-full bg-[#a3e635]" />
                <span className="flex-1 truncate font-mono text-[10px] text-[#d1d5db]">
                  devsunite.com/u/rahulsharma
                </span>
                <span className="shrink-0 rounded border border-[#2f4a25] bg-[#16210f] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#a3e635]">
                  LIVE
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SHARE_TARGETS.map(({ label, tint }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-md border border-[#242a22] bg-[#161a16] px-2 py-1 text-[10px] text-[#d1d5db]"
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
