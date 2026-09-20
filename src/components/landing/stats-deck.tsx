const ROLE_TAGS = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Data",
  "DevOps",
  "Mobile",
];

const COUNTRIES = ["India", "USA", "UK", "Singapore", "Germany", "Canada"];

const EQ_BARS = [24, 40, 32, 56, 44, 64, 48];

export function StatsDeck() {
  return (
    <section className="dot-grid-subtle mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 — Jobs listed */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] bg-[#f5c6e8] p-7 text-black shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-2">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              50,000+
            </h3>
            <p className="mb-2 text-base font-bold">Jobs listed</p>
            <p className="mb-6 text-xs font-medium text-black/75">
              Live openings across every tech role.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-start pt-8" aria-hidden>
            <div className="relative h-24 w-20 -rotate-6 rounded-xl bg-[#1f3f26] p-2 shadow-lg">
              <div className="absolute -top-2 left-8 h-4 w-4 rounded-full bg-[#fce7f3] shadow" />
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 w-3/4 rounded bg-[#4ade80]" />
                <div className="h-1.5 w-1/2 rounded bg-[#4ade80]" />
                <div className="h-1.5 w-2/3 rounded bg-[#4ade80]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Developers */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] border border-[#27532d] bg-[#132f1a] p-7 text-white shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-1">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              100K+
            </h3>
            <p className="mb-2 text-base font-bold text-[#4ade80]">
              Trusted by developers
            </p>
            <p className="mb-6 text-xs text-[#a3b8a6]">
              Real engineers, actively hiring and applying.
            </p>
          </div>
          <div className="space-y-6 pt-4" aria-hidden>
            <div className="flex h-16 items-end gap-1.5">
              {EQ_BARS.map((h, i) => (
                <div
                  key={i}
                  className="w-2.5 rounded-full bg-[#4ade80]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-3xl font-black text-[#4ade80]">
              <span>✳</span>
              <span>✳</span>
              <span>✳</span>
            </div>
          </div>
        </div>

        {/* Card 3 — Countries */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] border border-[#292c26] bg-[#181a17] p-7 text-white shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-1">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              150+
            </h3>
            <p className="mb-2 text-base font-bold">Countries</p>
            <p className="mb-6 text-xs text-[#9ca3af]">
              Job Alert 24 works wherever you&apos;re job hunting.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-[#373b32] bg-[#242721] px-3 py-1 text-[11px] font-medium text-[#d1d5db]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-start pt-6" aria-hidden>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#4ade80]/60">
              <div className="h-8 w-full rounded-full border-y border-[#4ade80]/60" />
              <div className="absolute h-full w-8 rounded-full border-x border-[#4ade80]/60" />
              <div className="absolute right-3 top-2 h-2 w-2 rounded-full bg-[#f472b6]" />
              <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            </div>
          </div>
        </div>

        {/* Card 4 — Companies */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] bg-[#dcd7c5] p-7 text-[#172016] shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-2">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              27,000+
            </h3>
            <p className="mb-2 text-base font-bold text-[#1f3f26]">
              Companies tracked
            </p>
            <p className="mb-6 text-xs text-[#444c41]">
              From startups to Google, Amazon, Microsoft.
            </p>
            <div className="grid grid-cols-3 gap-2" aria-hidden>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-base font-black text-[#4285F4]">G</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
                  <div className="bg-[#F25022]" />
                  <div className="bg-[#7FBA00]" />
                  <div className="bg-[#00A4EF]" />
                  <div className="bg-[#FFB900]" />
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-sm">
                a
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0668E1] shadow-sm">
                Meta
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-sm">

              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#E50914] shadow-sm">
                N
              </div>
            </div>
          </div>
          <div className="flex items-end gap-1 pt-6" aria-hidden>
            <div className="grid h-14 w-8 grid-cols-2 gap-0.5 rounded-md bg-[#1f3f26] p-1">
              <div className="h-2 w-2 rounded-[1px] bg-[#4ade80]" />
              <div className="h-2 w-2 rounded-[1px] bg-white" />
              <div className="h-2 w-2 rounded-[1px] bg-[#4ade80]" />
              <div className="h-2 w-2 rounded-[1px] bg-white" />
            </div>
            <div className="grid h-10 w-7 grid-cols-2 gap-0.5 rounded-md bg-[#2b5433] p-1">
              <div className="h-1.5 w-1.5 rounded-[1px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[1px] bg-[#4ade80]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
