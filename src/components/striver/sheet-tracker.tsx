"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Search,
  X,
  Download,
  ExternalLink,
  StickyNote,
  RotateCcw,
  ListChecks,
  Trophy,
  BookOpen,
} from "lucide-react";
import type { Difficulty, SheetConfig } from "./sheet-types";

type Filter = "all" | "todo" | "done";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Basic: "bg-[var(--color-c-chip-info)] text-[var(--color-c-sky-2)]",
  Easy: "bg-[var(--color-c-chip-easy)] text-[var(--color-c-lime)]",
  Medium: "bg-[var(--color-c-chip-amber)] text-[var(--color-c-amber)]",
  Hard: "bg-[var(--color-c-chip-hard)] text-[var(--color-c-red)]",
};



/** localStorage can throw (private mode, blocked storage) — never let that break render. */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or blocked — progress just won't persist */
  }
}

export function DsaSheetTracker({ config }: { config: SheetConfig }) {
  const { sections: SECTIONS, groupLabel } = config;
  const TOTAL = SECTIONS.reduce((n, s) => n + s.problems.length, 0);
  const DONE_KEY = `${config.storageKey}-done`;
  const NOTES_KEY = `${config.storageKey}-notes`;
  const [done, setDone] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  /** Sections start closed; this holds the ones the reader has opened. */
  const [expanded, setExpanded] = useState<number[]>([]);
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  /**
   * Saved progress is read after mount, never during render: the server has no
   * localStorage, so seeding initial state from it would mismatch on hydration.
   */
  const [ready, setReady] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect -- restore must run post-mount */
  useEffect(() => {
    const savedDone = load<number[]>(DONE_KEY, []);
    const savedNotes = load<Record<number, string>>(NOTES_KEY, {});
    if (savedDone.length) setDone(savedDone);
    if (Object.keys(savedNotes).length) setNotes(savedNotes);
    setReady(true);
  }, [DONE_KEY, NOTES_KEY]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (ready) save(DONE_KEY, done);
  }, [done, ready, DONE_KEY]);

  useEffect(() => {
    if (ready) save(NOTES_KEY, notes);
  }, [notes, ready, NOTES_KEY]);

  const doneSet = useMemo(() => new Set(done), [done]);

  const visibleDays = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SECTIONS.map((d) => ({
      ...d,
      problems: d.problems.filter((p) => {
        if (q && !p.title.toLowerCase().includes(q)) return false;
        if (filter === "done") return doneSet.has(p.n);
        if (filter === "todo") return !doneSet.has(p.n);
        return true;
      }),
    })).filter((d) => d.problems.length > 0);
  }, [query, filter, doneSet, SECTIONS]);

  /** True while a search or filter is hiding problems. */
  const isNarrowed = query.trim() !== "" || filter !== "all";
  const allOpen = expanded.length === SECTIONS.length;

  const completed = done.length;
  const pct = Math.round((completed / TOTAL) * 100);

  function toggle(n: number) {
    setDone((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  }

  function toggleDay(day: number) {
    setExpanded((p) =>
      p.includes(day) ? p.filter((d) => d !== day) : [...p, day],
    );
  }

  function saveNote() {
    if (noteFor === null) return;
    const text = draft.trim();
    setNotes((p) => {
      const next = { ...p };
      if (text) next[noteFor] = text;
      else delete next[noteFor];
      return next;
    });
    setNoteFor(null);
  }

  function resetAll() {
    if (!confirm("Reset all progress and notes for this sheet?")) return;
    setDone([]);
    setNotes({});
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
          <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
          {config.kicker}
        </span>
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-[var(--color-c-text)]">
          {config.name}
        </h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--color-c-muted)]">
          {config.blurb}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {config.pdfUrl && (
            <a
              href={config.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)]"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </a>
          )}
          {config.trackerUrl && (
            <a
              href={config.trackerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
            >
              <ListChecks className="h-3.5 w-3.5" />
              Tracker with links
            </a>
          )}
          <a
            href={config.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Official sheet
          </a>
        </div>
      </header>

      {/* Progress */}
      <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-bold leading-none text-[var(--color-c-text)]">
              {pct}%
            </span>
            <div>
              <p className="text-[11px] font-semibold text-[var(--color-c-text-4)]">
                Overall Progress
              </p>
              <p className="text-[11px] text-[var(--color-c-dim)]">
                {completed} of {TOTAL} solved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completed === TOTAL && completed > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-c-lime)]">
                <Trophy className="h-3 w-3" />
                Sheet complete
              </span>
            )}
            <button
              type="button"
              onClick={resetAll}
              disabled={completed === 0 && Object.keys(notes).length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2.5 py-1 text-[10px] font-medium text-[var(--color-c-muted)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Sheet progress"
        >
          <div
            className="h-full rounded-full bg-[var(--color-c-lime)] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-dim)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            aria-label="Search problems"
            className="h-9 w-full rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] pl-9 pr-8 text-[12px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setExpanded(allOpen ? [] : SECTIONS.map((d) => d.day))}
            disabled={isNarrowed}
            aria-label={allOpen ? "Collapse all sections" : "Expand all sections"}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)] disabled:opacity-40 disabled:hover:text-[var(--color-c-muted)]"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {allOpen ? "Collapse all" : "Expand all"}
          </button>

          <div className="flex items-center gap-1 rounded-full border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-1">
          {(
            [
              ["all", "All", TOTAL],
              ["todo", "To do", TOTAL - completed],
              ["done", "Solved", completed],
            ] as [Filter, string, number][]
          ).map(([v, label, count]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              aria-pressed={filter === v}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                filter === v
                  ? "bg-[var(--color-c-lime)] text-black"
                  : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
              }`}
            >
              {label}
              <span className={filter === v ? "opacity-70" : "text-[var(--color-c-dim)]"}>
                {count}
              </span>
            </button>
          ))}
          </div>
        </div>
      </section>

      {/* Days */}
      {visibleDays.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-10 text-center text-[13px] text-[var(--color-c-muted)]">
          No problems match your filters.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleDays.map((d) => {
            const dayDone = d.problems.filter((p) => doneSet.has(p.n)).length;
            // A search or filter narrows the list, so open what survived —
            // otherwise the matches would sit hidden inside closed sections.
            const isOpen = isNarrowed || expanded.includes(d.day);
            const allDone = dayDone === d.problems.length;

            return (
              <section
                key={d.day}
                className="overflow-hidden rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]"
              >
                <button
                  type="button"
                  onClick={() => toggleDay(d.day)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      allDone
                        ? "bg-[var(--color-c-lime)] text-black"
                        : "bg-[var(--color-c-chip-lime)] text-[var(--color-c-lime)]"
                    }`}
                  >
                    {allDone ? <Check className="h-4 w-4" strokeWidth={3} /> : d.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-[var(--color-c-text)]">
                      {groupLabel === "day" ? `Day ${d.day}: ${d.title}` : d.title}
                    </span>
                    <span className="block text-[10px] text-[var(--color-c-dim)]">
                      {dayDone}/{d.problems.length} solved
                    </span>
                  </span>
                  <span className="hidden h-1 w-20 shrink-0 overflow-hidden rounded-full bg-[var(--color-c-track)] sm:block">
                    <span
                      className="block h-full rounded-full bg-[var(--color-c-lime)] transition-all"
                      style={{
                        width: `${(dayDone / d.problems.length) * 100}%`,
                      }}
                    />
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[var(--color-c-dim)] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul className="divide-y divide-[var(--color-c-divider-soft)] border-t border-[var(--color-c-border)]">
                    {d.problems.map((p) => {
                      const isDone = doneSet.has(p.n);
                      const note = notes[p.n];

                      return (
                        <li
                          key={p.n}
                          className="flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
                        >
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={isDone}
                            aria-label={`Mark "${p.title}" as solved`}
                            onClick={() => toggle(p.n)}
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isDone
                                ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black"
                                : "border-[var(--color-c-border-strong)] text-transparent hover:border-[var(--color-c-lime)]"
                            }`}
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          </button>

                          <span className="w-7 shrink-0 pt-px text-right font-mono text-[10px] text-[var(--color-c-dim-4)]">
                            {p.n}
                          </span>

                          <span className="min-w-0 flex-1">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-[var(--color-c-lime)] hover:underline ${
                                  isDone
                                    ? "text-[var(--color-c-dim)] line-through"
                                    : "text-[var(--color-c-text-2)]"
                                }`}
                              >
                                {p.title}
                                {p.search ? (
                                  <Search
                                    className="h-2.5 w-2.5 shrink-0 text-[var(--color-c-amber)]"
                                    aria-label="Search link — not on LeetCode"
                                  />
                                ) : (
                                  <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                                )}
                              </a>
                            ) : (
                              <span
                                className={`text-[12px] ${
                                  isDone
                                    ? "text-[var(--color-c-dim)] line-through"
                                    : "text-[var(--color-c-text-2)]"
                                }`}
                              >
                                {p.title}
                              </span>
                            )}
                            {p.difficulty && (
                              <span
                                className={`ml-2 inline-block rounded px-1.5 py-px align-middle text-[9px] font-semibold ${DIFFICULTY_STYLES[p.difficulty]}`}
                              >
                                {p.difficulty}
                              </span>
                            )}
                            {p.article && (
                              <a
                                href={p.article}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 inline-flex items-center gap-1 rounded border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-1.5 py-px align-middle text-[9px] font-medium text-[var(--color-c-muted)] transition-colors hover:border-[var(--color-c-olive)] hover:text-[var(--color-c-lime)]"
                              >
                                <BookOpen className="h-2.5 w-2.5" />
                                Article
                              </a>
                            )}
                            {note && (
                              <span className="mt-1 block rounded-md border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-2 py-1 text-[10px] italic leading-relaxed text-[var(--color-c-muted)]">
                                {note}
                              </span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setDraft(notes[p.n] ?? "");
                              setNoteFor(p.n);
                            }}
                            aria-label={`${note ? "Edit" : "Add"} note for ${p.title}`}
                            className={`mt-0.5 shrink-0 transition-colors ${
                              note
                                ? "text-[var(--color-c-lime)]"
                                : "text-[var(--color-c-border-strong)] hover:text-[var(--color-c-muted)]"
                            }`}
                          >
                            <StickyNote className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[10px] text-[var(--color-c-dim)]">
        <ListChecks className="h-3 w-3" />
        Progress and notes are saved in this browser.
        <Search className="ml-2 h-2.5 w-2.5 text-[var(--color-c-amber)]" />
        marks a search link where no direct problem page exists.
      </p>

      {/* Note modal */}
      {noteFor !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Problem note"
          onClick={() => setNoteFor(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5 shadow-2xl"
          >
            <h3 className="text-[14px] font-bold text-[var(--color-c-text)]">
              {SECTIONS.flatMap((d) => d.problems).find((p) => p.n === noteFor)
                ?.title}
            </h3>
            <textarea
              autoFocus
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Approach, edge cases, time complexity, what tripped you up…"
              className="w-full resize-none rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3 text-[12px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteFor(null)}
                className="rounded-lg px-3 py-2 text-[12px] text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="rounded-lg bg-[var(--color-c-lime)] px-4 py-2 text-[12px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)]"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
