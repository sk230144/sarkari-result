import { Mail, Mic, Briefcase, Home, AudioLines } from "lucide-react";

const TICKER = [
  {
    icon: Mail,
    label: "Cover Letters",
    text: "Write a cover letter for this Google SWE role",
  },
  {
    icon: Mic,
    label: "Interviews",
    text: "Prep me for a system design interview at Amazon",
  },
  {
    icon: Briefcase,
    label: "Jobs",
    text: "Find jobs that match my GitHub profile",
  },
];

export function SocialProof() {
  return (
    <section className="border-y border-[var(--color-c-surface-12b)] bg-[var(--color-c-canvas-alt)]/60 py-16">
      <div className="mx-auto mb-12 max-w-3xl px-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-4xl">
          Real openings from companies you actually want
        </h2>
        <p className="text-sm text-[var(--color-c-text-dim)] sm:text-base">
          Our jobs board tracks real, live openings at companies like these, and
          thousands more.
        </p>
      </div>

      {/* Company badges */}
      <div className="mx-auto max-w-7xl overflow-x-auto px-6 pb-4">
        <div className="flex min-w-max items-center justify-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-lg font-semibold text-black shadow-md">
            <span className="text-xl font-black text-[#0668E1]">∞</span>
            <span>Meta</span>
          </div>
          <div className="flex items-center rounded-2xl border border-[var(--color-c-forest-14)] bg-[var(--color-c-surface-5)] px-5 py-3 text-xl font-black tracking-wider text-[#E50914] shadow-md">
            NETFLIX
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-white px-6 py-3 text-lg font-bold text-black shadow-md">
            <span className="font-extrabold tracking-tight">amazon</span>
            <span className="text-xs font-black text-[#FF9900]">⌣</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-c-forest-14)] bg-[var(--color-c-surface-5)] px-5 py-3 text-lg font-bold text-[#FF5A5F] shadow-md">
            <Home className="h-5 w-5" />
            <span>airbnb</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-c-forest-14)] bg-[var(--color-c-surface-5)] px-5 py-3 text-lg font-bold text-[#1ED760] shadow-md">
            <AudioLines className="h-5 w-5" />
            <span>Spotify</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-c-forest-14)] bg-[var(--color-c-surface-5)] px-5 py-3 text-lg font-bold tracking-widest text-[#E82127] shadow-md">
            <span>T E S L A</span>
          </div>
          <div className="flex items-center gap-1 rounded-2xl border border-[var(--color-c-forest-14)] bg-[var(--color-c-surface-5)] px-5 py-3 text-lg font-extrabold shadow-md">
            <span className="rounded bg-[#003580] px-2 py-0.5 text-xs text-[var(--color-c-text)]">
              B.
            </span>
            <span className="text-[var(--color-c-text)]">Booking.com</span>
          </div>
        </div>
      </div>

      {/* Marquee ticker — track duplicated for a seamless loop */}
      <div className="mt-10 overflow-hidden border-t border-[var(--color-c-surface-10c)] py-4">
        <div className="animate-marquee items-center text-sm">
          {[...TICKER, ...TICKER].map(({ icon: Icon, label, text }, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3 px-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-c-surface-11b)] text-[var(--color-c-green)]">
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-[var(--color-c-dim)]">{label}</span>
              <span className="font-semibold text-[var(--color-c-text)]">{text}</span>
              <span className="text-[var(--color-c-green)]">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
