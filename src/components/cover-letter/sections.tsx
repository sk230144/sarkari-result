import Link from "next/link";
import {
  Check,
  FileText,
  X,
  Target,
  Monitor,
  BadgeCheck,
  Briefcase,
  Table,
  Network,
  ArrowUpRight,
} from "lucide-react";
import { GenerateCta, Kicker, Reveal, TypeLoop } from "./primitives";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",
  backgroundSize: "22px 22px",
};

export function DreamJobBanner() {
  return (
    <section className="px-6 py-12 lg:px-8">
      <Reveal>
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#1d231b] to-[#0f110e] px-7 py-14 sm:px-12 md:grid-cols-2">
          <div aria-hidden className="absolute inset-0" style={GRID_BG} />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 70%)",
            }}
          />

          <div className="relative">
            <h2 className="text-[clamp(1.8rem,3.8vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--color-c-text)]">
              Your dream job starts with the right first impression.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[var(--color-c-muted)]">
              Stop sending the same letter to every company. Get one written
              fresh for this exact role, in under 30 seconds.
            </p>
            <div className="mt-7">
              <GenerateCta size="md" />
            </div>
          </div>

          <div className="relative">
            <div className="float-card rounded-2xl border border-white/10 bg-[#171a17]/95 p-5 shadow-2xl" style={{ ["--tilt" as string]: "-2deg" }}>
              <span className="mb-4 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]/70" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]/70" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]/70" />
              </span>
              <p className="rounded-md bg-[var(--color-c-lime)]/15 px-2 py-1.5 text-[12px] font-semibold text-[var(--color-c-lime)]">
                <TypeLoop
                  texts={[
                    "Dear Hiring Manager,",
                    "Tailored to: SDE-1, Bengaluru",
                    "JD match: 94%",
                  ]}
                  speed={50}
                  hold={1600}
                />
              </p>
              <span className="mt-3 block h-1.5 w-full rounded-full bg-white/[0.07]" />
              <span className="mt-2 block h-1.5 w-5/6 rounded-full bg-white/[0.07]" />
              <span className="mt-2 block h-1.5 w-2/3 rounded-full bg-white/[0.07]" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const ROWS = [
  ["Swap your name into a fixed paragraph", "Written fresh from your resume and the JD, every time"],
  ["Generic phrases that could apply to anyone", "Specific to the skills and experience that actually match the role"],
  ["One template for every application", "A new, tailored letter in seconds for every new JD"],
];

export function Comparison() {
  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <Kicker>The difference</Kicker>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Not a fill-in-the-blank template
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141713]">
            <div className="grid grid-cols-2 border-b border-white/[0.06] text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]">
              <span className="px-4 py-4 text-[var(--color-c-dim)]">Generic tools</span>
              <span className="border-l border-white/[0.06] bg-[var(--color-c-lime)]/[0.05] px-4 py-4 text-[var(--color-c-lime)]">
                Job Alert 24
              </span>
            </div>
            {ROWS.map(([bad, good], i) => (
              <div
                key={bad}
                className={`group grid grid-cols-2 ${i < ROWS.length - 1 ? "border-b border-white/[0.06]" : ""}`}
              >
                <span className="flex items-start gap-2.5 px-4 py-5 text-[13px] text-[var(--color-c-dim)] sm:px-6">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-c-dim)]" />
                  {bad}
                </span>
                <span className="flex items-start gap-2.5 border-l border-white/[0.06] bg-[var(--color-c-lime)]/[0.04] px-4 py-5 text-[13px] font-semibold text-[var(--color-c-text)] transition-colors group-hover:bg-[var(--color-c-lime)]/[0.08] sm:px-6">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-c-lime)]" strokeWidth={3} />
                  {good}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TOOLS: {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  body: string;
  href: string | null;
  tint: string;
}[] = [
  {
    icon: FileText,
    name: "Cover Letter",
    body: "Generate a personalised, ATS-friendly cover letter for any job in seconds.",
    href: "/cover-letter",
    tint: "#c084fc",
  },
  {
    icon: Target,
    name: "Resume Analysis",
    body: "Get your ATS match score, missing keywords, and a fix-it checklist instantly.",
    href: "/resume-analysis",
    tint: "#facc15",
  },
  {
    icon: Monitor,
    name: "Mock Interview",
    body: "Practise technical and HR rounds with AI-generated, role-specific questions.",
    href: null,
    tint: "#60a5fa",
  },
  {
    icon: BadgeCheck,
    name: "Portfolio Builder",
    body: "Turn your resume into a live, shareable developer portfolio in 60 seconds.",
    href: "/portfolio-builder",
    tint: "#a3e635",
  },
  {
    icon: Briefcase,
    name: "Jobs Board",
    body: "Browse fresh roles from top companies, updated every few hours.",
    href: "/jobs",
    tint: "#38bdf8",
  },
  {
    icon: Table,
    name: "DSA Sheets",
    body: "Track your progress across Striver, Love Babbar, NeetCode and more.",
    href: "/dsa-sheets",
    tint: "#fb923c",
  },
  {
    icon: Network,
    name: "System Design",
    body: "Work through the system design questions top companies actually ask.",
    href: "/system-design",
    tint: "#f87171",
  },
];

/** `current` is the page's own tool, left out of the grid. */
export function Toolkit({ current }: { current?: string } = {}) {
  const tools = TOOLS.filter((t) => t.href !== current).slice(0, 6);
  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-4xl border-t border-white/[0.06] pt-16">
        <Reveal className="text-center">
          <h2 className="text-[clamp(1.7rem,3.8vw,2.4rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Explore Job Alert 24&apos;s full toolkit
          </h2>
          <p className="mt-2 text-[14px] text-[var(--color-c-muted)]">
            Everything you need to go from resume to offer, in one place.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => {
            const inner = (
              <>
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{
                    color: t.tint,
                    borderColor: `${t.tint}40`,
                    backgroundColor: `${t.tint}14`,
                  }}
                >
                  <t.icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-c-text)]">
                    {t.name}
                    {t.href ? (
                      <ArrowUpRight className="h-3 w-3 text-[var(--color-c-dim)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-c-text)]" />
                    ) : (
                      <span className="rounded-full border border-white/10 px-1.5 py-px font-mono text-[8px] uppercase tracking-wider text-[var(--color-c-dim)]">
                        Soon
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[12px] leading-relaxed text-[var(--color-c-muted)]">
                    {t.body}
                  </span>
                </span>
              </>
            );
            const cls =
              "group flex h-full items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-[#151814] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-[#191c18]";
            return (
              <Reveal key={t.name} delay={i * 70}>
                {t.href ? (
                  <Link href={t.href} className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function WhyItMatters() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <Reveal>
        <article className="mx-auto max-w-2xl">
          <h2 className="text-[clamp(1.5rem,3.2vw,2rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">
            Why a tailored cover letter still matters
          </h2>
          <div className="mt-5 space-y-4 text-[14px] leading-[1.8] text-[var(--color-c-muted)]">
            <p>
              Most cover letters get skimmed in under 15 seconds, if they get
              opened at all. A generic &ldquo;To whom it may concern&rdquo;
              letter that could be sent to any company for any role signals
              exactly one thing to a recruiter: this candidate didn&apos;t read
              the job description. For a fresher competing against candidates
              with more years on their resume, that&apos;s an unforced error.
            </p>
            <p>
              A letter that mirrors the actual language of the job description
              (the specific stack, the responsibilities, the problem the team is
              trying to solve) does the opposite. It shows you read the posting
              closely enough to connect your own projects and experience to what
              this particular team needs, which is a stronger signal of genuine
              interest than years of experience alone.
            </p>
            <p>
              Job Alert 24&apos;s cover letter generator makes that level of
              tailoring realistic for every application, not just the one or two
              companies you care about most. Upload your resume once, paste the
              job description, and get a letter written fresh from both.
              Applying to ten companies means ten different letters, each one
              specific, in the time it used to take to write one.
            </p>
          </div>
        </article>
      </Reveal>
    </section>
  );
}

export function FinalCta({
  title = "Ready to write a letter that actually gets read?",
  body = "Free to start. No credit card required, just your resume and a job description.",
  cta,
}: { title?: string; body?: string; cta?: string } = {}) {
  return (
    <section className="px-6 pb-24 pt-8 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#1b2019] to-[#0d0f0d] px-6 py-14 text-center">
          <div aria-hidden className="absolute inset-0" style={GRID_BG} />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-full h-64 w-[520px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.18) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-md text-[clamp(1.6rem,3.6vw,2.2rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-[var(--color-c-text)]">
              {title}
            </h2>
            <p className="mt-3 text-[13px] text-[var(--color-c-muted)]">{body}</p>
            <div className="mt-7 flex justify-center">
              <GenerateCta size="md" label={cta} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
