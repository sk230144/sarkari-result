type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  theme: "charcoal" | "pink" | "green" | "lime" | "forest";
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Spent 6 months applying blind. Uploaded my resume, it flagged I was missing 11 keywords the JD had. Fixed it in 20 minutes. Got a callback the same week.",
    name: "Arjun Mehta",
    role: "Backend Engineer",
    initials: "AM",
    theme: "charcoal",
  },
  {
    quote:
      "I'm a bootcamp grad with no CS degree. The mock interviews felt uncomfortably real, which is exactly what I needed. Walked into my actual interview way less scared.",
    name: "Ananya Iyer",
    role: "Junior Frontend Dev",
    initials: "AI",
    theme: "pink",
  },
  {
    quote:
      "My public profile started getting inbound from recruiters I never reached out to. Closed a 3-month contract through it last quarter. Didn't send a single cold application.",
    name: "Rohan Deshpande",
    role: "Freelance Full Stack",
    initials: "RD",
    theme: "green",
  },
  {
    quote:
      "I rewrote my cover letter 12 times for one role. The AI version took 2 minutes and said things I wouldn't have thought to include. Got the interview. Got the job.",
    name: "Priya Nair",
    role: "Frontend Engineer",
    initials: "PN",
    theme: "lime",
  },
  {
    quote:
      "The prep wasn't generic LC grind. It pulled questions based on the actual company and role. One of them came up word for word in my onsite.",
    name: "Tom Reeves",
    role: "Data Engineer",
    initials: "TR",
    theme: "forest",
  },
];

const THEMES = {
  charcoal: {
    card: "bg-[#181a17] border border-[#282b24]",
    quote: "text-[#9ca3af]",
    body: "text-[#d1d5db]",
    divider: "border-[#292c25]",
    name: "text-white",
    role: "text-[#9ca3af]",
    avatar: "bg-[#242721] text-[#9ca3af]",
  },
  pink: {
    card: "bg-[#f5c6e8]",
    quote: "text-black",
    body: "text-black font-medium",
    divider: "border-black/20",
    name: "text-black",
    role: "text-black/70 font-semibold",
    avatar: "bg-black text-[#f5c6e8]",
  },
  green: {
    card: "bg-[#142a18] border border-[#294c2e]",
    quote: "text-[#4ade80]",
    body: "text-[#e2e8f0]",
    divider: "border-[#294c2e]",
    name: "text-white",
    role: "text-[#a3b8a6]",
    avatar: "bg-[#1e4222] text-[#4ade80]",
  },
  lime: {
    card: "bg-[#8cf058]",
    quote: "text-black",
    body: "text-black font-semibold",
    divider: "border-black/20",
    name: "text-black",
    role: "text-black/80 font-bold",
    avatar: "bg-black text-[#8cf058]",
  },
  forest: {
    card: "bg-[#122817] border border-[#244527]",
    quote: "text-[#4ade80]",
    body: "text-[#e2e8f0]",
    divider: "border-[#244527]",
    name: "text-white",
    role: "text-[#a3b8a6]",
    avatar: "bg-[#1e4222] text-[#4ade80]",
  },
} as const;

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          From overlooked to hired.
        </h2>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {TESTIMONIALS.map((t) => {
          const s = THEMES[t.theme];
          return (
            <div
              key={t.name}
              className={`flex min-h-[380px] flex-col justify-between rounded-2xl p-6 shadow-xl transition-transform duration-300 hover:-translate-y-2 ${s.card}`}
            >
              <div>
                <span
                  className={`mb-3 block font-serif text-2xl ${s.quote}`}
                  aria-hidden
                >
                  &#10077;
                </span>
                <p className={`text-xs leading-relaxed sm:text-sm ${s.body}`}>
                  {t.quote}
                </p>
              </div>
              <div
                className={`mt-4 flex items-center gap-3 border-t pt-6 ${s.divider}`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.avatar}`}
                >
                  {t.initials}
                </div>
                <div>
                  <span className={`block text-xs font-bold ${s.name}`}>
                    {t.name}
                  </span>
                  <span className={`text-[10px] ${s.role}`}>{t.role}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
