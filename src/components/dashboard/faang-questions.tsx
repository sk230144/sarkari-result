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
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-[var(--color-c-text)]">
          FAANG Interview Questions
        </h1>
        <p className="max-w-xl text-[13px] leading-relaxed text-[var(--color-c-muted)]">
          Real, recently reported coding interview questions. Pick a company to
          see what it actually asks.
        </p>
      </header>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-outline)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or topic…"
            aria-label="Search companies"
            className="h-9 w-full rounded-lg border border-[var(--color-c-border-cool)] bg-[var(--color-c-surface-6b)] pl-9 pr-8 text-[12px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-outline)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-c-outline)] hover:text-[var(--color-c-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-outline)]">
          {visible.length} {visible.length === 1 ? "company" : "companies"} ·{" "}
          {totalQuestions} questions
        </p>
      </div>

      {/* Company grid */}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-c-border-cool)] bg-[var(--color-c-surface-6b)] p-10 text-center text-[13px] text-[var(--color-c-muted)]">
          No companies match “{query}”.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((c) => (
            <a
              key={c.slug}
              href={c.route ?? `#${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-c-border-cool)] bg-[var(--color-c-surface-6b)] p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--color-c-border-cool-2)]"
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

              <h2 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
                {c.name} Interview Questions
              </h2>

              <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                {describe(c)}
              </p>

              <div className="mt-auto flex items-center justify-between border-t border-[var(--color-c-border-cool)] pt-2.5">
                <span className="text-[11px] font-semibold text-[var(--color-c-text-4)]">
                  {c.questions} Questions
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--color-c-outline)] transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-c-accent)]" />
              </div>
            </a>
          ))}
        </section>
      )}
    </div>
  );
}
