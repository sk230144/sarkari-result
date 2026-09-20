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
    <section className="border-y border-[#1c221a] bg-[#0d100c]/60 py-16">
      <div className="mx-auto mb-12 max-w-3xl px-6 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Real openings from companies you actually want
        </h2>
        <p className="text-sm text-[#9ca3af] sm:text-base">
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
          <div className="flex items-center rounded-2xl border border-[#273022] bg-[#141812] px-5 py-3 text-xl font-black tracking-wider text-[#E50914] shadow-md">
            NETFLIX
          </div>
          <div className="flex items-center gap-1 rounded-2xl bg-white px-6 py-3 text-lg font-bold text-black shadow-md">
            <span className="font-extrabold tracking-tight">amazon</span>
            <span className="text-xs font-black text-[#FF9900]">⌣</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#273022] bg-[#141812] px-5 py-3 text-lg font-bold text-[#FF5A5F] shadow-md">
            <Home className="h-5 w-5" />
            <span>airbnb</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#273022] bg-[#141812] px-5 py-3 text-lg font-bold text-[#1ED760] shadow-md">
            <AudioLines className="h-5 w-5" />
            <span>Spotify</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#273022] bg-[#141812] px-5 py-3 text-lg font-bold tracking-widest text-[#E82127] shadow-md">
            <span>T E S L A</span>
          </div>
          <div className="flex items-center gap-1 rounded-2xl border border-[#273022] bg-[#141812] px-5 py-3 text-lg font-extrabold shadow-md">
            <span className="rounded bg-[#003580] px-2 py-0.5 text-xs text-white">
              B.
            </span>
            <span className="text-white">Booking.com</span>
          </div>
        </div>
      </div>

      {/* Marquee ticker — track duplicated for a seamless loop */}
      <div className="mt-10 overflow-hidden border-t border-[#1a2217] py-4">
        <div className="animate-marquee items-center text-sm">
          {[...TICKER, ...TICKER].map(({ icon: Icon, label, text }, i) => (
            <div key={i} className="flex shrink-0 items-center gap-3 px-6">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1b2519] text-[#4ade80]">
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-[#6b7280]">{label}</span>
              <span className="font-semibold text-white">{text}</span>
              <span className="text-[#4ade80]">•</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
