import { CountUp, EqBars, FlipGroup, FlipItem, Float, Reveal3D, Spin3D, Tilt } from "./motion-kit";

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

function Card({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <Reveal3D className="h-full" delay={i * 0.12}>
      <Tilt className="h-full rounded-[28px]" max={12}>
        {children}
      </Tilt>
    </Reveal3D>
  );
}

export function StatsDeck() {
  return (
    <section className="dot-grid-subtle mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 — Jobs listed */}
        <Card i={0}>
          <div className="flex h-full min-h-[460px] flex-col justify-between rounded-[28px] bg-[var(--color-c-pink-soft)] p-7 text-black shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-2">
            <div>
              <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
                <CountUp value="50,000+" />
              </h3>
              <p className="mb-2 text-base font-bold">Jobs listed</p>
              <p className="mb-6 text-xs font-medium text-black/75">
                Live openings across every tech role.
              </p>
              <FlipGroup className="flex flex-wrap gap-1.5">
                {ROLE_TAGS.map((tag) => (
                  <FlipItem key={tag}>
                    <span className="block rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-[var(--color-c-text)]">
                      {tag}
                    </span>
                  </FlipItem>
                ))}
              </FlipGroup>
            </div>
            <div className="flex justify-start pt-8" aria-hidden>
              <Float distance={10} duration={3.6}>
                <div className="relative h-24 w-20 -rotate-6 rounded-xl bg-[var(--color-c-surface-17)] p-2 shadow-lg">
                  <div className="absolute -top-2 left-8 h-4 w-4 rounded-full bg-[var(--color-c-pink-bg)] shadow" />
                  <div className="mt-4 space-y-1.5">
                    <div className="h-1.5 w-3/4 rounded bg-[var(--color-c-green)]" />
                    <div className="h-1.5 w-1/2 rounded bg-[var(--color-c-green)]" />
                    <div className="h-1.5 w-2/3 rounded bg-[var(--color-c-green)]" />
                  </div>
                </div>
              </Float>
            </div>
          </div>
        </Card>

        {/* Card 2 — Developers */}
        <Card i={1}>
          <div className="flex h-full min-h-[460px] flex-col justify-between rounded-[28px] border border-[var(--color-c-forest-17)] bg-[var(--color-c-forest)] p-7 text-[var(--color-c-text)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-1">
            <div>
              <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
                <CountUp value="100K+" />
              </h3>
              <p className="mb-2 text-base font-bold text-[var(--color-c-green)]">
                Trusted by developers
              </p>
              <p className="mb-6 text-xs text-[var(--color-c-text-muted-2)]">
                Real engineers, actively hiring and applying.
              </p>
            </div>
            <div className="space-y-6 pt-4" aria-hidden>
              <EqBars heights={EQ_BARS} />
              <div className="flex items-center gap-2 text-3xl font-black text-[var(--color-c-green)]">
                {[0, 1, 2].map((k) => (
                  <Spin3D key={k} duration={6 + k * 1.5}>
                    <span className="block">✳</span>
                  </Spin3D>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3 — Countries */}
        <Card i={2}>
          <div className="flex h-full min-h-[460px] flex-col justify-between rounded-[28px] border border-[var(--color-c-neutral-5)] bg-[var(--color-c-surface-8b)] p-7 text-[var(--color-c-text)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:-rotate-1">
            <div>
              <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
                <CountUp value="150+" />
              </h3>
              <p className="mb-2 text-base font-bold">Countries</p>
              <p className="mb-6 text-xs text-[var(--color-c-text-dim)]">
                Job Alert 24 works wherever you&apos;re job hunting.
              </p>
              <FlipGroup className="flex flex-wrap gap-1.5">
                {COUNTRIES.map((c) => (
                  <FlipItem key={c}>
                    <span className="block rounded-full border border-[var(--color-c-neutral-7)] bg-[var(--color-c-neutral-1)] px-3 py-1 text-[11px] font-medium text-[var(--color-c-text-4)]">
                      {c}
                    </span>
                  </FlipItem>
                ))}
              </FlipGroup>
            </div>
            <div className="flex justify-start pt-6" aria-hidden>
              <Spin3D duration={10}>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--color-c-green)]/60">
                  <div className="h-8 w-full rounded-full border-y border-[var(--color-c-green)]/60" />
                  <div className="absolute h-full w-8 rounded-full border-x border-[var(--color-c-green)]/60" />
                  <div className="absolute right-3 top-2 h-2 w-2 rounded-full bg-[var(--color-c-pink)]" />
                  <div className="absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full bg-[var(--color-c-green)]" />
                </div>
              </Spin3D>
            </div>
          </div>
        </Card>

        {/* Card 4 — Companies */}
        <Card i={3}>
          <div className="flex h-full min-h-[460px] flex-col justify-between rounded-[28px] bg-[var(--color-c-text-5)] p-7 text-[var(--color-c-surface-8)] shadow-xl transition-transform duration-300 hover:rotate-0 lg:rotate-2">
            <div>
              <h3 className="mb-1 text-4xl font-extrabold tracking-tight">
                <CountUp value="27,000+" />
              </h3>
              <p className="mb-2 text-base font-bold text-[var(--color-c-surface-17)]">
                Companies tracked
              </p>
              <p className="mb-6 text-xs text-[var(--color-c-neutral-8)]">
                From startups to Google, Amazon, Microsoft.
              </p>
              <FlipGroup className="grid grid-cols-3 gap-2">
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-hidden>
                    <span className="text-base font-black text-[#4285F4]">G</span>
                  </div>
                </FlipItem>
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm" aria-hidden>
                    <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
                      <div className="bg-[#F25022]" />
                      <div className="bg-[#7FBA00]" />
                      <div className="bg-[#00A4EF]" />
                      <div className="bg-[#FFB900]" />
                    </div>
                  </div>
                </FlipItem>
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-sm" aria-hidden>
                    a
                  </div>
                </FlipItem>
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-[#0668E1] shadow-sm" aria-hidden>
                    Meta
                  </div>
                </FlipItem>
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-black shadow-sm" aria-hidden />
                </FlipItem>
                <FlipItem>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[#E50914] shadow-sm" aria-hidden>
                    N
                  </div>
                </FlipItem>
              </FlipGroup>
            </div>
            <Float distance={6} duration={3.2} className="flex items-end gap-1 pt-6">
              <div className="grid h-14 w-8 grid-cols-2 gap-0.5 rounded-md bg-[var(--color-c-surface-17)] p-1" aria-hidden>
                <div className="h-2 w-2 rounded-[1px] bg-[var(--color-c-green)]" />
                <div className="h-2 w-2 rounded-[1px] bg-white" />
                <div className="h-2 w-2 rounded-[1px] bg-[var(--color-c-green)]" />
                <div className="h-2 w-2 rounded-[1px] bg-white" />
              </div>
              <div className="grid h-10 w-7 grid-cols-2 gap-0.5 rounded-md bg-[var(--color-c-forest-22)] p-1" aria-hidden>
                <div className="h-1.5 w-1.5 rounded-[1px] bg-white" />
                <div className="h-1.5 w-1.5 rounded-[1px] bg-[var(--color-c-green)]" />
              </div>
            </Float>
          </div>
        </Card>
      </div>
    </section>
  );
}
