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
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] bg-[var(--color-c-pink-soft)] p-7 text-black shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-2">
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
                  className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-[var(--color-c-text)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-start pt-8" aria-hidden>
            <div className="relative h-24 w-20 -rotate-6 rounded-xl bg-[var(--color-c-surface-17)] p-2 shadow-lg">
              <div className="absolute -top-2 left-8 h-4 w-4 rounded-full bg-[var(--color-c-pink-bg)] shadow" />
              <div className="mt-4 space-y-1.5">
                <div className="h-1.5 w-3/4 rounded bg-[var(--color-c-green)]" />
                <div className="h-1.5 w-1/2 rounded bg-[var(--color-c-green)]" />
                <div className="h-1.5 w-2/3 rounded bg-[var(--color-c-green)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Developers */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] border border-[var(--color-c-forest-17)] bg-[var(--color-c-forest)] p-7 text-[var(--color-c-text)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-1">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              100K+
            </h3>
            <p className="mb-2 text-base font-bold text-[var(--color-c-green)]">
              Trusted by developers
            </p>
            <p className="mb-6 text-xs text-[var(--color-c-text-muted-2)]">
              Real engineers, actively hiring and applying.
            </p>
          </div>
          <div className="space-y-6 pt-4" aria-hidden>
            <div className="flex h-16 items-end gap-1.5">
              {EQ_BARS.map((h, i) => (
                <div
                  key={i}
                  className="w-2.5 rounded-full bg-[var(--color-c-green)]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-3xl font-black text-[var(--color-c-green)]">
              <span>✳</span>
              <span>✳</span>
              <span>✳</span>
            </div>
          </div>
        </div>

        {/* Card 3 — Countries */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] border border-[var(--color-c-neutral-5)] bg-[var(--color-c-surface-8b)] p-7 text-[var(--color-c-text)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-1">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              150+
            </h3>
            <p className="mb-2 text-base font-bold">Countries</p>
            <p className="mb-6 text-xs text-[var(--color-c-text-dim)]">
              Job Alert 24 works wherever you&apos;re job hunting.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COUNTRIES.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-[var(--color-c-neutral-7)] bg-[var(--color-c-neutral-1)] px-3 py-1 text-[11px] font-medium text-[var(--color-c-text-4)]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-start pt-6" aria-hidden>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-c-green)]/60">
              <div className="h-8 w-full rounded-full border-y border-[var(--color-c-green)]/60" />
              <div className="absolute h-full w-8 rounded-full border-x border-[var(--color-c-green)]/60" />
              <div className="absolute right-3 top-2 h-2 w-2 rounded-full bg-[var(--color-c-pink)]" />
              <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[var(--color-c-green)]" />
            </div>
          </div>
        </div>

        {/* Card 4 — Companies */}
        <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] bg-[var(--color-c-text-5)] p-7 text-[var(--color-c-surface-8)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-2">
          <div>
            <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
              27,000+
            </h3>
            <p className="mb-2 text-base font-bold text-[var(--color-c-surface-17)]">
              Companies tracked
            </p>
            <p className="mb-6 text-xs text-[var(--color-c-neutral-8)]">
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
            <div className="grid h-14 w-8 grid-cols-2 gap-0.5 rounded-md bg-[var(--color-c-surface-17)] p-1">
              <div className="h-2 w-2 rounded-[1px] bg-[var(--color-c-green)]" />
              <div className="h-2 w-2 rounded-[1px] bg-white" />
              <div className="h-2 w-2 rounded-[1px] bg-[var(--color-c-green)]" />
              <div className="h-2 w-2 rounded-[1px] bg-white" />
            </div>
            <div className="grid h-10 w-7 grid-cols-2 gap-0.5 rounded-md bg-[var(--color-c-forest-22)] p-1">
              <div className="h-1.5 w-1.5 rounded-[1px] bg-white" />
              <div className="h-1.5 w-1.5 rounded-[1px] bg-[var(--color-c-green)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
