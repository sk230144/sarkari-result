"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  CATEGORY_LABELS,
  REMOTE_LABELS,
  EXPERIENCE_LABELS,
} from "@/lib/jobs-shared";

type Facet = { value: string; count: number };

/**
 * Filters drive the URL, so a filtered view is linkable and the server
 * component re-renders from the query string — no client-side data fetching.
 */
export function JobFilters(props: { cities: Facet[]; categories: Facet[] }) {
  const params = useSearchParams();
  // Re-keying on the URL's q resets the uncontrolled draft when the reader
  // navigates back or clears filters — no effect syncing state to a prop.
  return <FilterBar key={params.get("q") ?? ""} {...props} />;
}

function FilterBar({
  cities,
  categories,
}: {
  cities: Facet[];
  categories: Facet[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState(params.get("q") ?? "");

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // a changed filter always returns to page 1
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router],
  );

  const activeCount = ["category", "city", "remote", "experience"].filter((k) =>
    params.get(k),
  ).length;

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", term.trim() || null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={onSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-dim)]" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search role or company…"
            aria-label="Search jobs"
            className="h-10 w-full rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] pl-9 pr-9 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
          />
          {term && (
            <button
              type="button"
              onClick={() => {
                setTerm("");
                setParam("q", null);
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] px-3 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-[var(--color-c-lime)] px-1.5 text-[10px] font-bold text-black">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Category"
            value={params.get("category")}
            onChange={(v) => setParam("category", v)}
            options={categories.map((c) => ({
              value: c.value,
              label: `${CATEGORY_LABELS[c.value] ?? c.value} (${c.count})`,
            }))}
          />
          <Select
            label="City"
            value={params.get("city")}
            onChange={(v) => setParam("city", v)}
            options={cities.map((c) => ({
              value: c.value,
              label: `${c.value} (${c.count})`,
            }))}
          />
          <Select
            label="Work type"
            value={params.get("remote")}
            onChange={(v) => setParam("remote", v)}
            options={[
              { value: "remote", label: "Any remote" },
              ...Object.entries(REMOTE_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
          <Select
            label="Experience"
            value={params.get("experience")}
            onChange={(v) => setParam("experience", v)}
            options={Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />

          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => router.push(pathname, { scroll: false })}
              className="justify-self-start text-[11px] font-semibold text-[var(--color-c-lime)] hover:underline sm:col-span-2 lg:col-span-4"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-9 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] px-2 text-[12px] text-[var(--color-c-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
