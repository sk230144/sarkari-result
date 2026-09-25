"use client";

import { useEffect, useState } from "react";
import { Check, Clock, FileText, Sparkles } from "lucide-react";
import { GenerateCta, Kicker, Reveal, prefersReducedMotion } from "./primitives";

const DRAFTS = [
  {
    role: "Frontend Engineer",
    body: "Over the past two years I've shipped production React features end to end, from design review to release.",
    match: "Cutting our bundle size by 40% maps directly to your performance requirement.",
    score: 94,
  },
  {
    role: "Data Analyst",
    body: "I turn messy operational data into dashboards that product and finance teams actually open every week.",
    match: "My SQL reporting pipeline cut weekly reporting from 6 hours to 20 minutes.",
    score: 91,
  },
  {
    role: "Backend Developer",
    body: "I build and run Node.js services in production, with a focus on reliability and clean APIs.",
    match: "I scaled our order API to 50k requests a minute with zero downtime.",
    score: 96,
  },
];

function LetterMock() {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);

  const d = DRAFTS[i];
  const intro = `Dear Hiring Manager,\n\nI'm writing to apply for the ${d.role} role. ${d.body}\n\n`;
  const total = intro.length + d.match.length;
  const done = n >= total;

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let id: ReturnType<typeof setTimeout> | undefined;
    if (n < total) {
      // The opening types fast; the matched line slows down so it lands.
      const inIntro = n < intro.length;
      id = setTimeout(
        () => setN(reduce ? total : Math.min(total, n + (inIntro ? 2 : 1))),
        reduce ? 0 : inIntro ? 16 : 32,
      );
    } else if (!reduce) {
      id = setTimeout(() => {
        setN(0);
        setI((v) => (v + 1) % DRAFTS.length);
      }, 3400);
    }
    return () => clearTimeout(id);
  }, [n, total, intro.length]);

  return (
    <div className="relative">
      {/* Glow pooled under the window */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 rounded-[40px] opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 55%, rgba(163,230,53,0.16), transparent 70%)",
        }}
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0d0b]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
          </span>
          <span className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-[var(--color-c-text-4)]">
            <Sparkles className="h-3 w-3 text-[var(--color-c-lime)]" />
            Job Alert 24 Cover Letter Engine
          </span>
          <span className="w-[42px]" />
        </div>

        <div className="p-5 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-[var(--color-c-lime)]/25 bg-[#0e110d]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-c-lime)]/15 bg-[var(--color-c-lime)]/[0.05] px-4 py-2.5">
              <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--color-c-lime)]">
                <Sparkles className={`h-3.5 w-3.5 ${done ? "" : "animate-pulse"}`} />
                {done ? "Cover letter ready" : "Generating cover letter"}
              </span>
              <span
                key={i}
                className="line-in truncate rounded-md bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[var(--color-c-text-4)]"
              >
                {d.role}
              </span>
            </div>

            <p className="min-h-[232px] whitespace-pre-line px-4 py-4 text-[13px] leading-[1.75] text-[var(--color-c-text-4)] sm:min-h-[212px]">
              {intro.slice(0, Math.min(n, intro.length))}
              {n > intro.length && (
                <span
                  key={i}
                  className="cl-highlight rounded-md px-1.5 py-1 font-semibold text-[var(--color-c-lime)] [box-decoration-break:clone]"
                >
                  {d.match.slice(0, n - intro.length)}
                </span>
              )}
              {!done && (
                <span
                  aria-hidden
                  className="cl-caret ml-1 inline-block h-4 w-2 translate-y-[3px] rounded-[1px] bg-[var(--color-c-lime)]"
                />
              )}
            </p>

            {/* Match score fills once the letter lands */}
            <div className="flex items-center gap-3 border-t border-white/[0.05] px-4 py-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-c-dim)]">
                JD match
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-[var(--color-c-lime)] transition-[width] duration-1000 ease-out"
                  style={{ width: done ? `${d.score}%` : "0%" }}
                />
              </span>
              <span className="w-9 text-right font-mono text-[11px] font-bold text-[var(--color-c-lime)]">
                {done ? `${d.score}%` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating stat badges */}
      <div
        className="float-card absolute -right-3 -top-8 hidden sm:block"
        style={{ ["--tilt" as string]: "0deg" }}
      >
        <Badge icon={Clock} title="< 30 sec" sub="To a finished draft" />
      </div>
      <div
        className="float-card absolute -bottom-8 -left-6 hidden sm:block"
        style={{ ["--tilt" as string]: "0deg", animationDelay: "-3s" }}
      >
        <Badge icon={FileText} title="Zero templates" sub="Written fresh, every time" />
      </div>
    </div>
  );
}

function Badge({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0f0d]/95 py-3 pl-3 pr-5 shadow-2xl backdrop-blur">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/10">
        <Icon className="h-[18px] w-[18px] text-[var(--color-c-lime)]" />
      </span>
      <span className="flex flex-col">
        <span className="text-[15px] font-extrabold tracking-tight text-[var(--color-c-text)]">
          {title}
        </span>
        <span className="text-[11px] text-[var(--color-c-dim)]">{sub}</span>
      </span>
    </div>
  );
}

export function CoverLetterHero() {
  return (
    <section className="relative px-6 pb-24 pt-8 lg:px-8 lg:pb-32 lg:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-[20%] top-[35%] h-[520px] w-[720px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(163,230,53,0.09) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div>
          <Reveal>
            <Kicker>AI Cover Letter Generator</Kicker>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 text-[clamp(2.6rem,6.2vw,4.75rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-[var(--color-c-text)]">
              Write a cover letter that gets you{" "}
              <span className="relative inline-block whitespace-nowrap">
                noticed
                <span
                  aria-hidden
                  className="cl-underline absolute -bottom-1.5 left-0 h-[5px] w-full rounded-full bg-[var(--color-c-lime)] shadow-[0_0_18px_rgba(163,230,53,0.6)]"
                />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-[var(--color-c-muted)]">
              Upload your resume and paste a job description to generate a
              personalised, ATS-friendly cover letter in seconds. Then check
              your match score and practise the interview, all from one place.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9">
              <GenerateCta />
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[var(--color-c-dim)]">
              {[
                "Under 30 seconds",
                "Free to start",
                "Written fresh every time, never a template",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[var(--color-c-lime)]" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <LetterMock />
        </Reveal>
      </div>
    </section>
  );
}
