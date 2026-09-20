import { MessageSquare, Bot } from "lucide-react";

function StepBadge({ n }: { n: string }) {
  return (
    <span className="mb-5 inline-flex items-center justify-center rounded-full bg-[#203f25] px-3 py-1 text-xs font-bold text-[#4ade80]">
      {n}
    </span>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-between gap-8 rounded-[32px] border border-[#2b512f] bg-[#182e1b] p-8 shadow-2xl sm:p-12 md:flex-row">
      {children}
    </div>
  );
}

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <div className="mb-3 inline-block rounded-full bg-[#142617] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#4ade80]">
          How it works
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Upload once.
          <br />
          Everything else is handled for you.
        </h2>
      </div>

      <div className="space-y-6">
        {/* 01 — Resume Analyser */}
        <Panel>
          <div className="max-w-xl">
            <StepBadge n="01" />
            <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              AI Resume Analyser
            </h3>
            <p className="text-sm leading-relaxed text-[#4ade80] sm:text-base">
              Upload your resume and any job description. See exactly which
              skills you&apos;re missing and get your ATS match score in
              seconds.
            </p>
          </div>
          <div className="flex w-full shrink-0 items-center gap-6 rounded-2xl border border-[#27402a] bg-[#101b12] p-6 shadow-inner md:w-auto">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#1c2e1f]"
                  d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#4ade80]"
                  d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="66, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-base font-bold text-white">
                66%
              </span>
            </div>
            <div>
              <span className="block text-base font-bold text-white">
                Match score
              </span>
              <span className="mb-2 block text-xs text-[#9ca3af]">
                Senior Frontend Engineer
              </span>
              <div className="flex gap-1.5">
                <span className="rounded bg-[#1c2e1f] px-2 py-0.5 text-[10px] font-semibold text-[#4ade80]">
                  React
                </span>
                <span className="rounded bg-[#1c2e1f] px-2 py-0.5 text-[10px] font-semibold text-[#4ade80]">
                  TypeScript
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {/* 02 — Autofill */}
        <Panel>
          <div className="max-w-xl">
            <StepBadge n="02" />
            <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              AI Autofill Extension
            </h3>
            <p className="text-sm leading-relaxed text-[#9ca3af] sm:text-base">
              Every application asks for the same details all over again. Our
              Chrome extension auto-fills any job application instantly from
              your resume and profile, so you spend your time applying, not
              retyping the same form fifty times.
            </p>
          </div>
          <div className="w-full shrink-0 rounded-2xl border border-[#27402a] bg-[#101b12] p-5 shadow-inner md:w-80">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-[#4ade80]">
              <MessageSquare className="h-4 w-4" />
              <span>Auto-filling application</span>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["Full name", "Aarav Sharma", false],
                ["Email", "aarav@engineer.dev", false],
                ["Experience", "2.5 Years", false],
                ["Resume", "aarav_resume.pdf", true],
              ].map(([label, value, accent], i, arr) => (
                <div
                  key={label as string}
                  className={`flex justify-between py-1.5 text-[#9ca3af] ${
                    i < arr.length - 1 ? "border-b border-[#1c2a1e]" : ""
                  }`}
                >
                  <span>{label as string}</span>
                  <span
                    className={
                      accent
                        ? "font-medium text-[#4ade80]"
                        : "font-medium text-white"
                    }
                  >
                    {value as string}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {/* 03 — Cover letters & interviews */}
        <Panel>
          <div className="max-w-xl">
            <StepBadge n="03" />
            <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              Elite cover letters &amp; interviews
            </h3>
            <p className="text-sm leading-relaxed text-[#9ca3af] sm:text-base">
              Generate tailored cover letters and run AI mock interviews with
              real-time feedback before your actual interview.
            </p>
          </div>
          <div className="w-full shrink-0 rounded-2xl border border-[#27402a] bg-[#101b12] p-5 shadow-inner md:w-80">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Bot className="h-4 w-4 text-[#4ade80]" />
                System Design Mock
              </span>
              <span className="rounded bg-[#4ade80]/20 px-2 py-0.5 text-[10px] font-bold text-[#4ade80]">
                92 / 100
              </span>
            </div>
            <p className="rounded-lg border border-[#1b2b1d] bg-[#0c140e] p-2.5 text-[11px] italic text-[#9ca3af]">
              &ldquo;Strong explanation of distributed caching using Redis. CAP
              theorem section was spot on for Amazon.&rdquo;
            </p>
          </div>
        </Panel>

        {/* 04 — Portfolio Builder */}
        <Panel>
          <div className="max-w-xl">
            <StepBadge n="04" />
            <h3 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
              Portfolio Builder
            </h3>
            <p className="text-sm leading-relaxed text-[#9ca3af] sm:text-base">
              Upload your resume. AI extracts your skills, experience, and
              projects, and deploys a live, shareable portfolio in seconds.
            </p>
          </div>
          <div className="w-full shrink-0 rounded-2xl border border-[#27402a] bg-[#101b12] p-5 text-center shadow-inner md:w-80">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#2c4e31] bg-[#182e1b] px-3 py-1 font-mono text-xs text-[#4ade80]">
              <span className="h-2 w-2 animate-ping rounded-full bg-[#4ade80]" />
              jobalert24.com/u/yourname
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-[#142217] p-2">
                <span className="block text-base font-bold text-white">4</span>
                <span className="text-[10px] text-[#9ca3af]">Projects</span>
              </div>
              <div className="rounded-lg bg-[#142217] p-2">
                <span className="block text-base font-bold text-white">14</span>
                <span className="text-[10px] text-[#9ca3af]">Skills</span>
              </div>
              <div className="rounded-lg bg-[#142217] p-2">
                <span className="block text-base font-bold text-[#4ade80]">
                  100%
                </span>
                <span className="text-[10px] text-[#9ca3af]">Indexed</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
