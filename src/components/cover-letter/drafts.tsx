"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  MessageSquareText,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Kicker, Reveal, TypeOnce, prefersReducedMotion } from "./primitives";

const STYLES = [
  {
    name: "The Operator",
    icon: ShieldCheck,
    sample:
      "I cut API latency by 35% and shipped three production services last year. That results-first approach is what I'd bring to your backend team.",
    traits: [
      "Results-first: leads with measurable achievements from your resume",
      "Confident, concrete tone",
      "Then shows how you'll deliver in this exact role",
    ],
  },
  {
    name: "The Believer",
    icon: MessageSquareText,
    sample:
      "Your mission to make hiring fairer is why I'm applying. I built my first project to help classmates find internships, and I'd love to do that at scale.",
    traits: [
      "Mission-driven: why this company and role matter to you",
      "Warm and genuine, never cheesy",
      "Fits startups and mission-driven teams",
    ],
  },
  {
    name: "Quick Apply",
    icon: Award,
    sample:
      "Backend developer with two years in Node.js and PostgreSQL, applying for your SDE-1 role. I've shipped REST APIs used by 50k users. Happy to talk.",
    traits: [
      "Under 80 words, 3-4 sentences",
      "Made for email, LinkedIn and quick-apply forms",
      "Straight to the point",
    ],
  },
];

export function ThreeDrafts() {
  const [active, setActive] = useState(0);
  // Auto-rotation stops for good once the reader picks a style themselves.
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || prefersReducedMotion()) return;
    const id = setTimeout(() => setActive((v) => (v + 1) % STYLES.length), 6500);
    return () => clearTimeout(id);
  }, [active, touched]);

  function pick(i: number) {
    setTouched(true);
    setActive((i + STYLES.length) % STYLES.length);
  }

  return (
    <section className="px-6 py-16 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-white/[0.05] bg-gradient-to-b from-[#1c2716] to-[#141811] px-5 py-16 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 65%)",
            }}
          />

          <div className="relative text-center">
            <Kicker solid>What you get</Kicker>
            <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3.1rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-[var(--color-c-text)]">
              One click, <span className="text-[var(--color-c-lime)]">three real drafts</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-[var(--color-c-muted)]">
              Every generation gives you three distinct styles. Pick the one
              that fits the role, not just one shot.
            </p>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {STYLES.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-500 ${
                    on
                      ? "-translate-y-1.5 border-[var(--color-c-lime)]/50 bg-[#1a1f17] shadow-[0_24px_60px_-24px_rgba(163,230,53,0.4)]"
                      : "border-white/[0.06] bg-[#171a15] hover:border-white/15"
                  }`}
                >
                  <span
                    className={`flex items-center gap-2.5 border-b px-5 py-4 transition-colors duration-500 ${
                      on
                        ? "border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/[0.08]"
                        : "border-white/[0.05] bg-white/[0.02]"
                    }`}
                  >
                    <s.icon
                      className={`h-4 w-4 transition-colors ${
                        on ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-lime)]/60"
                      }`}
                    />
                    <span className="text-[14px] font-bold text-[var(--color-c-text)]">
                      {s.name}
                    </span>
                    {on && (
                      <span className="ml-auto rounded-full bg-[var(--color-c-lime)] px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider text-black">
                        Preview
                      </span>
                    )}
                  </span>

                  <span className="flex flex-1 flex-col px-5 py-5">
                    {/* Placeholder lines become the real opening when selected */}
                    <span className="block min-h-[84px] text-[12.5px] italic leading-relaxed text-[var(--color-c-text-4)]">
                      {on ? (
                        <TypeOnce key={`${i}-${active}`} text={`“${s.sample}”`} />
                      ) : (
                        <span className="block space-y-2.5 pt-1">
                          <span className="block h-1.5 w-11/12 rounded-full bg-white/[0.08]" />
                          <span className="block h-1.5 w-full rounded-full bg-white/[0.08]" />
                          <span className="block h-1.5 w-3/4 rounded-full bg-white/[0.08]" />
                        </span>
                      )}
                    </span>

                    <span className="mt-5 flex flex-col gap-2.5 border-t border-white/[0.05] pt-4">
                      {s.traits.map((t) => (
                        <span
                          key={t}
                          className="text-[12px] font-medium leading-snug text-[var(--color-c-muted)]"
                        >
                          {t}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => pick(active - 1)}
              aria-label="Previous style"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 text-[var(--color-c-text)] transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="flex gap-1.5">
              {STYLES.map((s, i) => (
                <span
                  key={s.name}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === active ? "w-6 bg-[var(--color-c-lime)]" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </span>
            <button
              type="button"
              onClick={() => pick(active + 1)}
              aria-label="Next style"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-[var(--color-c-text)] transition-colors hover:bg-white/15"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
