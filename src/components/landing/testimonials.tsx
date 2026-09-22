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
    card: "bg-[var(--color-c-surface-8b)] border border-[var(--color-c-neutral-3)]",
    quote: "text-[var(--color-c-text-dim)]",
    body: "text-[var(--color-c-text-4)]",
    divider: "border-[var(--color-c-neutral-4)]",
    name: "text-[var(--color-c-text)]",
    role: "text-[var(--color-c-text-dim)]",
    avatar: "bg-[var(--color-c-neutral-1)] text-[var(--color-c-text-dim)]",
  },
  pink: {
    card: "bg-[var(--color-c-pink-soft)]",
    quote: "text-black",
    body: "text-black font-medium",
    divider: "border-black/20",
    name: "text-black",
    role: "text-black/70 font-semibold",
    avatar: "bg-black text-[var(--color-c-pink-soft)]",
  },
  green: {
    card: "bg-[var(--color-c-green-dim-6)] border border-[var(--color-c-forest-19)]",
    quote: "text-[var(--color-c-green)]",
    body: "text-[var(--color-c-text-3)]",
    divider: "border-[var(--color-c-forest-19)]",
    name: "text-[var(--color-c-text)]",
    role: "text-[var(--color-c-text-muted-2)]",
    avatar: "bg-[var(--color-c-forest-29)] text-[var(--color-c-green)]",
  },
  lime: {
    card: "bg-[var(--color-c-lime-2)]",
    quote: "text-black",
    body: "text-black font-semibold",
    divider: "border-black/20",
    name: "text-black",
    role: "text-black/80 font-bold",
    avatar: "bg-black text-[var(--color-c-lime-2)]",
  },
  forest: {
    card: "bg-[var(--color-c-surface-3b)] border border-[var(--color-c-forest-10)]",
    quote: "text-[var(--color-c-green)]",
    body: "text-[var(--color-c-text-3)]",
    divider: "border-[var(--color-c-forest-10)]",
    name: "text-[var(--color-c-text)]",
    role: "text-[var(--color-c-text-muted-2)]",
    avatar: "bg-[var(--color-c-forest-29)] text-[var(--color-c-green)]",
  },
} as const;

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl overflow-hidden px-6 py-24">
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--color-c-text)] sm:text-5xl">
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
