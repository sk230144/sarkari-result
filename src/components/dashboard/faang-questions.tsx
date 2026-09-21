"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { COMPANIES, describe } from "./faang-data";

export function FaangQuestions() {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMPANIES;
    return COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.topics.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const totalQuestions = COMPANIES.reduce((sum, c) => sum + c.questions, 0);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-white">
          FAANG Interview Questions
        </h1>
        <p className="max-w-xl text-[13px] leading-relaxed text-[#8c9c90]">
          Real, recently reported coding interview questions. Pick a company to
          see what it actually asks.
        </p>
      </header>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7a71]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or topic…"
            aria-label="Search companies"
            className="h-9 w-full rounded-lg border border-[#22272c] bg-[#15181c] pl-9 pr-8 text-[12px] text-white placeholder:text-[#6c7a71] focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c7a71] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
          {visible.length} {visible.length === 1 ? "company" : "companies"} ·{" "}
          {totalQuestions} questions
        </p>
      </div>

      {/* Company grid */}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-[#22272c] bg-[#15181c] p-10 text-center text-[13px] text-[#8c9c90]">
          No companies match “{query}”.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((c) => (
            <a
              key={c.slug}
              href={c.route ?? `#${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#22272c] bg-[#15181c] p-3 transition-all hover:-translate-y-0.5 hover:border-[#2f363d]"
            >
              {/* Logo panel */}
              <div
                className={`relative mb-3 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg ${c.panel}`}
              >
                <Image
                  src={c.logo}
                  alt={`${c.name} logo`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h2 className="mb-1 text-[13px] font-bold text-white">
                {c.name} Interview Questions
              </h2>

              <p className="mb-3 text-[11px] leading-relaxed text-[#8c9c90]">
                {describe(c)}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-[#22272c] pt-2.5">
                <span className="text-[11px] font-semibold text-[#d1d5db]">
                  {c.questions} Questions
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[#6c7a71] transition-all group-hover:translate-x-0.5 group-hover:text-[#22c55e]" />
              </div>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
