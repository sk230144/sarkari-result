"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Database,
  Rows3,
  MonitorPlay,
  RefreshCw,
  ArrowRight,
  BrainCircuit,
  GraduationCap,
  Timer,
  Medal,
  HelpCircle,
  Dumbbell,
  MessageSquareQuote,
  Repeat,
  Network,
  ChevronDown,
  BadgeCheck,
} from "lucide-react";

const SHEETS = [
  {
    slug: "striver-a2z",
    title: "Striver SDE Sheet",
    curator: "Striver (TakeUForward)",
    problems: 191,
    sections: 27,
    route: "/dsa-sheets/striver-a2z",
    blurb:
      "The most widely-used SDE roadmap, 191 interview problems organised across 27 focused days.",
    best: "Full roadmap, basics to advanced",
    dot: "bg-[#10b981]",
    image: "/sheets/striver-a2z.jpg",
    alt: "Striver A2Z DSA Sheet banner — The one stop point to learn DSA from A-Z",
  },
  {
    slug: "love-babbar",
    title: "Love Babbar DSA Sheet",
    curator: "Love Babbar",
    problems: 445,
    sections: 15,
    route: "/dsa-sheets/love-babbar",
    blurb:
      "A well-structured roadmap covering every major DSA concept needed for placements.",
    best: "Placement-focused, flat structure",
    dot: "bg-[#bff365]",
    image: "/sheets/love-babbar.jpg",
    alt: "Love Babbar DSA Sheet banner — Launching DSA Supreme 2.0",
  },
  {
    slug: "neetcode-150",
    title: "Neetcode 150 DSA Sheet",
    curator: "Navdeep Singh (NeetCode)",
    problems: 150,
    sections: 18,
    blurb:
      "A clean, beginner-friendly list of the most important interview problems for fast revision.",
    best: "Fast revision, FAANG-pattern focus",
    dot: "bg-[#dce2f7]",
    image: "/sheets/neetcode-150.jpg",
    alt: "NeetCode 150 banner — Pass coding interviews",
  },
  {
    slug: "rohit-negi",
    title: "Rohit Negi DSA Sheet",
    curator: "Rohit Negi (Coder Army)",
    problems: 725,
    sections: 17,
    route: "/dsa-sheets/rohit-negi",
    blurb:
      "An extensive problem set covering DSA topics in depth, from Coder Army.",
    best: "Deepest, most exhaustive coverage",
    dot: "bg-[#a4d64c]",
    image: "/sheets/rohit-negi.jpg",
    alt: "Rohit Negi DSA Sheet banner — DSA and Gen AI combo",
  },
];

const SUMMARY = [
  {
    icon: Database,
    tint: "bg-[#10b981]/10 text-[#10b981]",
    label: "Total Tracked",
    value: `${SHEETS.reduce((n, s) => n + s.problems, 0).toLocaleString()} Problems`,
    accent: false,
  },
  {
    icon: Rows3,
    tint: "bg-[#bff365]/10 text-[#bff365]",
    label: "Top Roadmaps",
    value: `${SHEETS.length} Curated Sets`,
    accent: false,
  },
  {
    icon: MonitorPlay,
    tint: "bg-[#10b981]/10 text-[#10b981]",
    label: "Solutions",
    value: "Video & Editorial",
    accent: false,
  },
  {
    icon: RefreshCw,
    tint: "bg-[#bff365]/10 text-[#bff365]",
    label: "Cloud Sync",
    value: "Auto Saved",
    accent: true,
  },
];

const PICKS = [
  {
    icon: GraduationCap,
    tint: "text-[#10b981]",
    kicker: "Foundation",
    title: "Starting from scratch or want full topic coverage",
    body: "Striver's A2Z Sheet or Love Babbar's DSA Sheet. Both are structured as a complete roadmap, not a problem dump.",
  },
  {
    icon: Timer,
    tint: "text-[#bff365]",
    kicker: "Speed Sprint",
    title: "Short on time before interviews",
    body: "NeetCode 150, the smallest sheet here by design, curated for maximum pattern coverage per problem solved.",
  },
  {
    icon: Medal,
    tint: "text-[#10b981]",
    kicker: "Mastery",
    title: "Already comfortable with the basics and want depth",
    body: "Rohit Negi's Sheet, the largest set here, for going deeper on each topic rather than moving faster through it.",
  },
  {
    icon: HelpCircle,
    tint: "text-[#dce2f7]",
    kicker: "Recommendation",
    title: "Not sure which DSA sheet to pick",
    body: "Most candidates get the most value from working through one primary sheet (A2Z or Love Babbar) in order, then using NeetCode 150 as a final revision pass close to interview day.",
  },
];

const TIPS = [
  {
    icon: Dumbbell,
    tint: "text-[#6ffbbe]",
    kicker: "Deliberate Practice",
    title: "Struggle before you look at the solution",
    body: "A real attempt, even a partial one, before checking the approach is what builds pattern recognition.",
  },
  {
    icon: MessageSquareQuote,
    tint: "text-[#bff365]",
    kicker: "Verbal Clarification",
    title: "Say your approach out loud before you code",
    body: "If you can't explain it in plain language, you don't understand it yet.",
  },
  {
    icon: Repeat,
    tint: "text-[#6ffbbe]",
    kicker: "Spaced Repetition",
    title: "Revisit topics, don't just move on",
    body: "Returning to a topic a week later is what makes it stick. Checking a problem off once and never returning is the most common reason a DSA sheet doesn't translate to a real interview.",
  },
  {
    icon: Network,
    tint: "text-[#bff365]",
    kicker: "Holistic System",
    title: "Pair it with the rest of your interview prep",
    body: null,
  },
];

const FAQS = [
  {
    q: "What is a DSA sheet?",
    a: "A DSA sheet is a curated, topic-ordered list of data structures and algorithms problems used to prepare for coding interviews, as opposed to solving problems in random order.",
  },
  {
    q: "Which DSA sheet is best for placement preparation?",
    a: "Striver's A2Z Sheet and Love Babbar's DSA Sheet are both built specifically for placement preparation, covering every major DSA topic in a structured order. NeetCode 150 works well as a second, faster revision pass once the basics are covered.",
  },
  {
    q: "Is NeetCode 150 enough for FAANG interviews?",
    a: "NeetCode 150 covers the 150 problems that appear most often in FAANG coding interviews, grouped by pattern. It's a strong focused list for revision, though candidates aiming specifically at FAANG-level interviews often pair it with a broader sheet like Striver's A2Z Sheet or Rohit Negi's Sheet for deeper topic coverage.",
  },
  {
    q: "Are these DSA sheets free to use?",
    a: "Yes. Every problem on every DSA sheet on this page is free to browse with no account required. A free Job Alert 24 account adds progress tracking, starred problems, and notes that sync across devices.",
  },
  {
    q: "How long does it take to complete a DSA sheet?",
    a: "There's no fixed timeline. It depends on prior experience and daily practice time. Most candidates don't complete every problem on a sheet before interviews, they focus on the topics most relevant to their target companies.",
  },
  {
    q: "What's the difference between NeetCode 150 and the other DSA sheets?",
    a: "NeetCode 150 is deliberately the smallest of the four sheets, 150 problems grouped into 18 algorithmic patterns, curated for the highest signal per problem solved. The other three sheets are broader, ranging from 191 to 725 problems, meant for full topic-by-topic coverage rather than a fast revision pass.",
  },
  {
    q: "Can I track my DSA sheet progress across devices?",
    a: "Yes, with a free Job Alert 24 account. Progress, starred problems, and notes are saved per problem and stay in sync on any device you log into.",
  },
  {
    q: "Do these DSA sheets include video solutions?",
    a: "Striver's A2Z Sheet includes video walkthroughs for problems where TakeUForward has published one, shown inline with a video icon next to the problem.",
  },
];

export function DsaSheets() {
  // Accordion: one panel open at a time, matching the reference behaviour.
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 lg:px-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-[#264B2E]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6ffbbe]">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[#10b981]" />
          Interview Roadmap
        </div>
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-white">
          DSA Sheets
        </h1>
        <p className="max-w-4xl text-[13px] leading-relaxed text-[#bbcabf]">
          A DSA sheet is a curated, topic-ordered list of data structures and
          algorithms problems used to prepare for coding interviews and
          placement drives, as opposed to solving random LeetCode problems in no
          particular order. This page tracks four of the most widely used free
          DSA sheets for FAANG and product-based company interview preparation:
          Striver&apos;s A2Z Sheet, Love Babbar&apos;s DSA Sheet, NeetCode 150,
          and Rohit Negi&apos;s Sheet, each with per-problem progress tracking,
          direct LeetCode links, and (where available) video solutions.
        </p>
      </section>

      {/* Summary strip */}
      <section className="grid grid-cols-2 gap-4 rounded-xl bg-[#1E1E1E] p-4 md:grid-cols-4">
        {SUMMARY.map(({ icon: Icon, tint, label, value, accent }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-lg bg-[#121212]/70 p-2"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
                {label}
              </span>
              <span
                className={`text-[15px] font-semibold ${
                  accent ? "text-[#6ffbbe]" : "text-white"
                }`}
              >
                {value}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Sheet cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {SHEETS.map((s) => (
          <div
            key={s.slug}
            id={s.slug}
            className="group flex scroll-mt-24 flex-col overflow-hidden rounded-xl bg-[#1E1E1E] shadow-lg transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-[#121212]">
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-transparent" />
              <span className="absolute right-2.5 top-2.5 rounded-full bg-[#121212]/90 px-2.5 py-1 text-[11px] font-semibold text-[#6ffbbe] backdrop-blur-md">
                {s.problems} Problems
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-4 p-4">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-white transition-colors group-hover:text-[#10b981]">
                  {s.title}
                </h2>
                <p className="line-clamp-3 text-xs text-[#bbcabf]">{s.blurb}</p>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#6c7a71]">
                  <span>{s.curator}</span>
                  <span className="text-[#10b981]">{s.sections} Sections</span>
                </div>
                <a
                  href={s.route ?? `#${s.slug}`}
                  className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#264B2E] px-4 py-2.5 text-sm font-semibold text-[#6ffbbe] transition-all hover:bg-[#006c49] hover:text-white"
                >
                  <span>Open Sheet</span>
                  <ArrowRight className="h-[18px] w-[18px]" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Methodology */}
      <section className="space-y-4 rounded-xl bg-[#1E1E1E] p-6 shadow-md lg:p-8">
        <div className="flex items-center gap-1 text-[#10b981]">
          <BrainCircuit className="h-5 w-5" />
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Methodology &amp; Strategy
          </span>
        </div>
        <h2 className="text-[17px] font-semibold text-white">
          Why Use a DSA Sheet Instead of Random LeetCode Problems
        </h2>
        <div className="max-w-5xl space-y-4 text-sm leading-relaxed text-[#bbcabf]">
          <p>
            Solving problems in random order off a difficulty filter rarely
            builds real interview readiness. The value of a DSA practice sheet
            is the order itself: problems are grouped by topic and algorithmic
            pattern, so instead of memorizing one specific question, you learn
            to recognize the shape of a problem and the technique it needs, the
            skill that actually transfers to a new question in a live coding
            interview.
          </p>
          <p>
            The four sheets on this page take different approaches to that same
            idea. Striver&apos;s SDE Sheet builds a full DSA roadmap from
            programming basics through advanced trees and dynamic programming
            across 191 problems in 27 days. Love Babbar&apos;s DSA Sheet covers the same
            core ground in a flatter, placement-focused 445-problem list.
            NeetCode 150 trims that down to the 150 problems that appear most
            often in FAANG interviews, grouped by pattern, for fast revision
            closer to interview day. Rohit Negi&apos;s Sheet, from Coder Army,
            goes the other direction: 725 problems, the deepest coverage of any
            sheet here, for anyone with the runway to cover a topic
            exhaustively.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-semibold text-white">
            DSA Sheet Comparison
          </h2>
          <span className="text-[11px] font-semibold text-[#6c7a71]">
            Updated for 2025 Placements
          </span>
        </div>
        <div className="w-full overflow-x-auto rounded-xl bg-[#1E1E1E] shadow-md">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="bg-[#121212]/80 text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
                <th className="px-4 py-3.5">Sheet</th>
                <th className="px-4 py-3.5">Curator</th>
                <th className="px-4 py-3.5">Problems</th>
                <th className="px-4 py-3.5">Sections</th>
                <th className="px-4 py-3.5">Best for</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {SHEETS.map((s, i) => (
                <tr
                  key={s.slug}
                  className={`transition-colors hover:bg-[#121212]/40 ${
                    i % 2 === 1 ? "bg-[#121212]/20" : ""
                  }`}
                >
                  <td className="px-4 py-4 font-semibold text-white">
                    <span className="flex items-center gap-1">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${s.dot}`}
                      />
                      <span>{s.title}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#bbcabf]">{s.curator}</td>
                  <td className="px-4 py-4 font-mono text-[#6ffbbe]">
                    {s.problems}
                  </td>
                  <td className="px-4 py-4 text-[#bbcabf]">{s.sections}</td>
                  <td className="px-4 py-4 text-[#bbcabf]">{s.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Which sheet */}
      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold text-white">
          Which DSA Sheet Should You Use
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PICKS.map(({ icon: Icon, tint, kicker, title, body }) => (
            <div
              key={kicker}
              className="space-y-1 rounded-xl bg-[#1E1E1E] p-6 shadow-sm"
            >
              <div className={`mb-1 flex items-center gap-1 ${tint}`}>
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {kicker}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-[#bbcabf]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-4">
        <h2 className="text-[17px] font-semibold text-white">
          How to Get the Most Out of a DSA Sheet
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TIPS.map(({ icon: Icon, tint, kicker, title, body }) => (
            <div
              key={kicker}
              className="space-y-1 rounded-xl bg-[#1E1E1E] p-6 shadow-sm"
            >
              <div className={`mb-1 flex items-center gap-1 ${tint}`}>
                <Icon className="h-5 w-5" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  {kicker}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-[#bbcabf]">
                {body ?? (
                  <>
                    A DSA sheet builds problem-solving speed and pattern recall.
                    It doesn&apos;t cover system design, resume quality, or
                    interview communication on its own, pair it with Job Alert
                    24&apos;s{" "}
                    <a
                      href="/system-design"
                      className="font-medium text-[#10b981] underline-offset-4 hover:underline"
                    >
                      System Design Sheet
                    </a>{" "}
                    and{" "}
                    <a
                      href="#mock-interview"
                      className="font-medium text-[#10b981] underline-offset-4 hover:underline"
                    >
                      Mock Interview
                    </a>{" "}
                    for the rest.
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[17px] font-semibold text-white">
            Frequently asked questions
          </h2>
          <span className="text-[11px] font-semibold text-[#6c7a71]">
            {FAQS.length} Items
          </span>
        </div>

        <div className="space-y-1 rounded-xl bg-[#1E1E1E] p-4">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div
                key={faq.q}
                className="rounded-lg bg-[#121212]/40 transition-colors hover:bg-[#121212]/70"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left text-[13px] font-semibold text-white transition-colors hover:text-[#10b981]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#6c7a71] transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <div
                    id={`faq-panel-${i}`}
                    className="px-4 pb-4 text-sm leading-relaxed text-[#bbcabf]"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="flex flex-col items-center justify-between gap-6 rounded-xl bg-[#264B2E]/30 p-6 shadow-xl md:flex-row lg:p-8">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#6ffbbe]">
            <BadgeCheck className="h-[18px] w-[18px]" />
            Official Curations Synced
          </div>
          <h3 className="text-[17px] font-semibold text-white">
            Ready to start today&apos;s practice session?
          </h3>
          <p className="text-sm text-[#bbcabf]">
            Pick any sheet to initiate real-time LeetCode synchronization and
            daily streak tracking.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <a
            href="#striver-a2z"
            className="rounded-lg bg-[#10b981] px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:bg-[#006c49]"
          >
            Start Striver A2Z
          </a>
          <a
            href="#dsa-patterns"
            className="rounded-lg bg-[#1E1E1E] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#121212]"
          >
            View Patterns
          </a>
        </div>
      </section>
    </div>
  );
}
