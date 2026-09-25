import { UploadCloud, FileText, Sparkles, Mail } from "lucide-react";
import { GenerateCta, Kicker, Reveal, TypeLoop } from "./primitives";

function Frame({
  n,
  children,
}: {
  n: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-[22px] border border-[var(--color-c-lime)]/25 bg-gradient-to-br from-[#2a3b1c] via-[#1d2917] to-[#151b12] p-5 shadow-[0_30px_60px_-30px_rgba(163,230,53,0.35)] transition-transform duration-500 hover:-translate-y-1 sm:p-7">
      <div className="relative min-h-[170px] overflow-hidden rounded-2xl border border-white/[0.05] bg-[#171a15] p-5">
        {children}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-3 right-5 select-none text-[64px] font-extrabold leading-none tracking-tighter text-[var(--color-c-lime)]/[0.12] transition-colors duration-500 group-hover:text-[var(--color-c-lime)]/20"
      >
        {n}
      </span>
    </div>
  );
}

function UploadVisual() {
  return (
    <div className="flex flex-col items-center gap-4 pt-2">
      <span className="pulse-soft flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-[var(--color-c-lime)]/50 bg-[var(--color-c-lime)]/[0.06]">
        <UploadCloud className="h-5 w-5 text-[var(--color-c-lime)]" />
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-c-text-4)]">
        <FileText className="h-3 w-3" />
        resume.pdf
      </span>
      <div className="w-full max-w-[200px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div className="fill-bar h-full rounded-full bg-[var(--color-c-lime)]" />
        </div>
        <p className="mt-1.5 text-center font-mono text-[9px] text-[var(--color-c-dim)]">
          Reading skills, experience, projects…
        </p>
      </div>
    </div>
  );
}

function JdVisual() {
  return (
    <>
      <p className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-c-lime)]/10">
          <FileText className="h-3 w-3 text-[var(--color-c-lime)]" />
        </span>
        Job description
      </p>
      <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-3 text-[12px] font-semibold text-[var(--color-c-text)]">
        <span
          aria-hidden
          className="cl-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-c-lime)]/60 to-transparent"
        />
        <TypeLoop
          texts={[
            "Frontend Engineer · React, TypeScript",
            "Data Analyst · SQL, Power BI",
            "SDE-1 Backend · Node.js, AWS",
          ]}
          caretClassName="bg-[var(--color-c-text)]"
        />
        <span className="mt-2 block h-1 w-4/5 rounded-full bg-white/[0.05]" />
        <span className="mt-1.5 block h-1 w-3/5 rounded-full bg-white/[0.05]" />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-c-lime)]">
        <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
        Analyzing against your resume…
      </p>
    </>
  );
}

function LetterVisual() {
  return (
    <>
      <p className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-c-lime)]/10">
          <Mail className="h-3 w-3 text-[var(--color-c-lime)]" />
        </span>
        Cover letter
      </p>
      <div className="rounded-xl border border-white/[0.07] bg-[#11140f] px-3 py-3 text-[12px] font-semibold text-[var(--color-c-text)]">
        <TypeLoop
          texts={[
            "Dear Hiring Manager,",
            "I'm excited to apply for the Frontend Engineer role…",
          ]}
          speed={60}
          hold={1400}
          caretClassName="bg-[var(--color-c-text)]"
        />
        <span className="mt-2.5 block h-1 w-full rounded-full bg-white/[0.05]" />
        <span className="mt-1.5 block h-1 w-5/6 rounded-full bg-white/[0.05]" />
        <span className="mt-1.5 block h-1 w-2/3 rounded-full bg-white/[0.05]" />
      </div>
    </>
  );
}

const STEPS = [
  {
    n: "01",
    icon: UploadCloud,
    label: "Step 1",
    title: "Upload your resume",
    body: "Add your resume once, as a PDF. We read your skills, experience, and projects automatically.",
    cta: "Upload resume",
    visual: <UploadVisual />,
  },
  {
    n: "02",
    icon: FileText,
    label: "Step 2",
    title: "Paste the job description",
    body: "Drop in the JD from any company's careers page. No formatting or cleanup needed.",
    cta: "Add job description",
    visual: <JdVisual />,
  },
  {
    n: "03",
    icon: Sparkles,
    label: "Step 3",
    title: "Get your cover letter",
    body: "Our AI writes a personalised, ATS-friendly cover letter matched to the exact role in under 30 seconds.",
    cta: "Generate my cover letter",
    visual: <LetterVisual />,
  },
];

export function CoverLetterHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <Kicker solid>How it works</Kicker>
          <h2 className="mx-auto mt-5 max-w-lg text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--color-c-text)]">
            3 simple steps to your{" "}
            <span className="text-[var(--color-c-lime)]">perfect cover letter</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-[var(--color-c-muted)]">
            Generate a personalised, ATS-ready cover letter in minutes. No
            writing experience needed.
          </p>
        </Reveal>

        <div className="relative mt-16 flex flex-col gap-16 lg:gap-20">
          {/* Spine connecting the steps */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-10 left-1/2 top-10 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--color-c-lime)]/30 to-transparent lg:block"
          />

          {STEPS.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={s.n} className="relative grid items-center gap-8 lg:grid-cols-2 lg:gap-20">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-c-lime)] shadow-[0_0_0_6px_rgba(163,230,53,0.12),0_0_20px_rgba(163,230,53,0.6)] lg:block"
                />

                <Reveal className={flip ? "lg:order-2" : ""} delay={flip ? 120 : 0}>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.06] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-lime)]">
                    <s.icon className="h-3 w-3" />
                    {s.label}
                  </span>
                  <h3 className="mt-3 text-[26px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-[var(--color-c-muted)]">
                    {s.body}
                  </p>
                  <div className="mt-5">
                    <GenerateCta variant="outline" label={s.cta} />
                  </div>
                </Reveal>

                <Reveal className={flip ? "lg:order-1" : ""} delay={flip ? 0 : 120}>
                  <Frame n={s.n}>{s.visual}</Frame>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
