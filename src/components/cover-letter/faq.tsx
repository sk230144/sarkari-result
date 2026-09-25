"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Kicker, Reveal } from "./primitives";

const FAQS = [
  {
    q: "How does the AI cover letter generator work?",
    a: "You upload your resume once and paste the job description. The AI reads both, picks out the projects, skills and experience that match what the role asks for, and writes a letter around them in under 30 seconds.",
  },
  {
    q: "Is the cover letter tailored, or a generic template?",
    a: "Tailored. Every letter is written fresh from your resume and the specific JD you paste. Nothing is copied from a fixed paragraph, so two different roles get two genuinely different letters.",
  },
  {
    q: "Is the cover letter generator free?",
    a: "Yes, it's free to start. You don't need a credit card, just an account, your resume and a job description.",
  },
  {
    q: "Can freshers with no experience use this?",
    a: "Yes. If your resume has projects, internships, coursework or open-source work, those become the backbone of the letter. It leads with what you've built rather than years of experience.",
  },
  {
    q: "What do I need to generate a cover letter?",
    a: "Two things: your resume as a PDF (you already added it at signup) and the job description for the role you're applying to.",
  },
];

export function CoverLetterFaq() {
  return <Faq items={FAQS} />;
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const FAQS = items;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Reveal className="text-center">
          <Kicker>FAQ</Kicker>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,2.6rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Frequently Asked
          </h2>
        </Reveal>

        <div className="mt-10 space-y-2.5">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div
                  className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                    isOpen
                      ? "border-[var(--color-c-lime)]/30 bg-[#161a14]"
                      : "border-white/[0.06] bg-[#131612] hover:border-white/15"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`cl-faq-${i}`}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-mono text-[10px] text-[var(--color-c-lime)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[14px] font-bold text-[var(--color-c-text)]">
                      {f.q}
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "rotate-45 border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black"
                          : "border-white/15 text-[var(--color-c-dim)]"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  {/* grid-rows 0fr→1fr animates to the content's real height */}
                  <div
                    id={`cl-faq-${i}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 pl-[52px] text-[13px] leading-relaxed text-[var(--color-c-muted)]">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
