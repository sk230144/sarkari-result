import { MessageSquare, Bot } from "lucide-react";
import { CountUp, Reveal3D, ScoreRing, Sequence, Tilt } from "./motion-kit";

function StepBadge({ n }: { n: string }) {
  return (
    <span className="mb-5 inline-flex items-center justify-center rounded-full bg-[var(--color-c-forest-3)] px-3 py-1 text-xs font-bold text-[var(--color-c-green)]">
      {n}
    </span>
  );
}

function Panel({ i, children }: { i: number; children: React.ReactNode }) {
  return (
    <Reveal3D from={i % 2 === 0 ? "left" : "right"}>
      <div className="flex flex-col items-center justify-between gap-8 rounded-[32px] border border-[var(--color-c-forest-21)] bg-[var(--color-c-raised-2)] p-8 shadow-2xl sm:p-12 md:flex-row">
        {children}
      </div>
    </Reveal3D>
  );
}

/** The demo widget on the right of each panel, tilting toward the pointer. */
function Widget({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <Tilt className={`w-full shrink-0 rounded-2xl ${className}`} max={14}>
      {children}
    </Tilt>
  );
}

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <div className="mb-3 inline-block rounded-full bg-[var(--color-c-green-dim-5)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-c-green)]">
          How it works
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-[var(--color-c-text)] sm:text-5xl">
          Upload once.
          <br />
          Everything else is handled for you.
        </h2>
      </div>

      <div className="space-y-6">
        {/* 01 — Resume Analyser */}
        <Panel i={0}>
          <div className="max-w-xl">
            <StepBadge n="01" />
            <h3 className="mb-3 text-3xl font-bold text-[var(--color-c-text)] sm:text-4xl">
              AI Resume Analyser
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-c-green)] sm:text-base">
              Upload your resume and any job description. See exactly which
              skills you&apos;re missing and get your ATS match score in
              seconds.
            </p>
          </div>
          <Widget className="md:w-auto">
            <div className="flex w-full items-center gap-6 rounded-2xl border border-[var(--color-c-forest-16)] bg-[var(--color-c-green-dim-2)] p-6 shadow-inner">
              <ScoreRing pct={66} />
              <div>
                <span className="block text-base font-bold text-[var(--color-c-text)]">
                  Match score
                </span>
                <span className="mb-2 block text-xs text-[var(--color-c-text-dim)]">
                  Senior Frontend Engineer
                </span>
                <div className="flex gap-1.5">
                  <span className="rounded bg-[var(--color-c-surface-13c)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-c-green)]">
                    React
                  </span>
                  <span className="rounded bg-[var(--color-c-surface-13c)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-c-green)]">
                    TypeScript
                  </span>
                </div>
              </div>
            </div>
          </Widget>
        </Panel>

        {/* 02 — Autofill */}
        <Panel i={1}>
          <div className="max-w-xl">
            <StepBadge n="02" />
            <h3 className="mb-3 text-3xl font-bold text-[var(--color-c-text)] sm:text-4xl">
              AI Autofill Extension
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">
              Every application asks for the same details all over again. Our
              Chrome extension auto-fills any job application instantly from
              your resume and profile, so you spend your time applying, not
              retyping the same form fifty times.
            </p>
          </div>
          <Widget className="md:w-80">
            <div className="w-full rounded-2xl border border-[var(--color-c-forest-16)] bg-[var(--color-c-green-dim-2)] p-5 shadow-inner">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[var(--color-c-green)]">
                <MessageSquare className="h-4 w-4" />
                <span>Auto-filling application</span>
              </div>
              <Sequence className="space-y-2 text-xs" step={0.3}>
                {[
                  ["Full name", "Aarav Sharma", false],
                  ["Email", "aarav@engineer.dev", false],
                  ["Experience", "2.5 Years", false],
                  ["Resume", "aarav_resume.pdf", true],
                ].map(([label, value, accent], i, arr) => (
                  <div
                    key={label as string}
                    className={`flex justify-between py-1.5 text-[var(--color-c-text-dim)] ${
                      i < arr.length - 1 ? "border-b border-[var(--color-c-surface-13)]" : ""
                    }`}
                  >
                    <span>{label as string}</span>
                    <span
                      className={
                        accent
                          ? "font-medium text-[var(--color-c-green)]"
                          : "font-medium text-[var(--color-c-text)]"
                      }
                    >
                      {value as string}
                    </span>
                  </div>
                ))}
              </Sequence>
            </div>
          </Widget>
        </Panel>

        {/* 03 — Cover letters & interviews */}
        <Panel i={2}>
          <div className="max-w-xl">
            <StepBadge n="03" />
            <h3 className="mb-3 text-3xl font-bold text-[var(--color-c-text)] sm:text-4xl">
              Elite cover letters &amp; interviews
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">
              Generate tailored cover letters and run AI mock interviews with
              real-time feedback before your actual interview.
            </p>
          </div>
          <Widget className="md:w-80">
            <div className="w-full rounded-2xl border border-[var(--color-c-forest-16)] bg-[var(--color-c-green-dim-2)] p-5 shadow-inner">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-c-text)]">
                  <Bot className="h-4 w-4 text-[var(--color-c-green)]" />
                  System Design Mock
                </span>
                <span className="rounded bg-[var(--color-c-green)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--color-c-green)]">
                  <CountUp value="92 / 100" />
                </span>
              </div>
              <p className="rounded-lg border border-[var(--color-c-surface-12)] bg-[var(--color-c-surface-01)] p-2.5 text-[11px] italic text-[var(--color-c-text-dim)]">
                &ldquo;Strong explanation of distributed caching using Redis. CAP
                theorem section was spot on for Amazon.&rdquo;
              </p>
            </div>
          </Widget>
        </Panel>

        {/* 04 — Portfolio Builder */}
        <Panel i={3}>
          <div className="max-w-xl">
            <StepBadge n="04" />
            <h3 className="mb-3 text-3xl font-bold text-[var(--color-c-text)] sm:text-4xl">
              Portfolio Builder
            </h3>
            <p className="text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">
              Upload your resume. AI extracts your skills, experience, and
              projects, and deploys a live, shareable portfolio in seconds.
            </p>
          </div>
          <Widget className="md:w-80">
            <div className="w-full rounded-2xl border border-[var(--color-c-forest-16)] bg-[var(--color-c-green-dim-2)] p-5 text-center shadow-inner">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-forest-24)] bg-[var(--color-c-raised-2)] px-3 py-1 font-mono text-xs text-[var(--color-c-green)]">
                <span className="h-2 w-2 animate-ping rounded-full bg-[var(--color-c-green)]" />
                jobalert24.com/u/yourname
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[var(--color-c-green-dim-4)] p-2">
                  <span className="block text-base font-bold text-[var(--color-c-text)]"><CountUp value="4" /></span>
                  <span className="text-[10px] text-[var(--color-c-text-dim)]">Projects</span>
                </div>
                <div className="rounded-lg bg-[var(--color-c-green-dim-4)] p-2">
                  <span className="block text-base font-bold text-[var(--color-c-text)]"><CountUp value="14" /></span>
                  <span className="text-[10px] text-[var(--color-c-text-dim)]">Skills</span>
                </div>
                <div className="rounded-lg bg-[var(--color-c-green-dim-4)] p-2">
                  <span className="block text-base font-bold text-[var(--color-c-green)]">
                    <CountUp value="100%" />
                  </span>
                  <span className="text-[10px] text-[var(--color-c-text-dim)]">Indexed</span>
                </div>
              </div>
            </div>
          </Widget>
        </Panel>
      </div>
    </section>
  );
}
