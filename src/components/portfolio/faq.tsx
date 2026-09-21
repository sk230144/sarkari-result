"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How do I create a free developer portfolio?",
    a: "Upload your resume PDF. Our AI reads it, extracts your skills, experience and projects, and deploys a live portfolio at devsunite.com/u/yourname. No account setup wizard, no template picking, no hosting to configure.",
  },
  {
    q: "Can freshers create a portfolio without work experience?",
    a: "Yes. If your resume has projects, coursework, internships or open-source contributions, those become the backbone of your portfolio. A fresher portfolio leads with projects and skills instead of job history.",
  },
  {
    q: "What does a DevsUnite portfolio include?",
    a: "Your headline and location, a core skills grid, work experience timeline, projects with their tech stacks, and — if you connect GitHub — your contribution graph and repo stats. Everything is pulled from your resume automatically.",
  },
  {
    q: "Is my portfolio public or private?",
    a: "Public by default, because the point is sharing it with recruiters. You can switch it to private at any time from your profile settings, which takes the URL offline without deleting your data.",
  },
  {
    q: "How does AI parse my resume?",
    a: "A language model reads the full text of your PDF rather than matching rigid templates, so unusual layouts, two-column designs and custom section names all work. You can review and edit everything it extracted before publishing.",
  },
];

export function PortfolioFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2f4a25] bg-[#16210f] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#a3e635]">
            <span className="blink h-1 w-1 rounded-full bg-[#a3e635]" />
            FAQ
          </span>
          <h2 className="mt-4 text-[26px] font-bold tracking-tight text-white">
            Frequently Asked
          </h2>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-xl border border-[#242a22] bg-[#111411]"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`pf-faq-${i}`}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="font-mono text-[9px] text-[#a3e635]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[12px] font-bold text-white">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#6b7280] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <p
                    id={`pf-faq-${i}`}
                    className="border-t border-[#242a22] px-4 py-3.5 pl-12 text-[11px] leading-relaxed text-[#8c9c90]"
                  >
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
