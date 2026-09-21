"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
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
  Basic: "bg-[#1b2b33] text-[#7dd3fc]",
  Easy: "bg-[#16210f] text-[#a3e635]",
  Medium: "bg-[#2a2109] text-[#fbbf24]",
  Hard: "bg-[#2d1416] text-[#f87171]",
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
  const [collapsed, setCollapsed] = useState<number[]>([]);
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

  const completed = done.length;
  const pct = Math.round((completed / TOTAL) * 100);

  function toggle(n: number) {
    setDone((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  }

  function toggleDay(day: number) {
    setCollapsed((p) =>
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
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#2f4a25] bg-[#16210f] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#a3e635]">
          <span className="blink h-1 w-1 rounded-full bg-[#a3e635]" />
          {config.kicker}
        </span>
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-white">
          {config.name}
        </h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[#8c9c90]">
          {config.blurb}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {config.pdfUrl && (
            <a
              href={config.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-3 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-[#84cc16]"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b332b] bg-[#141a14] px-3 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
            >
              <ListChecks className="h-3.5 w-3.5" />
              Tracker with links
            </a>
          )}
          <a
            href={config.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2b332b] bg-[#141a14] px-3 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Official sheet
          </a>
        </div>
      </header>

      {/* Progress */}
      <section className="rounded-2xl border border-[#1e2920] bg-[#0f1410] p-4">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[26px] font-bold leading-none text-white">
              {pct}%
            </span>
            <div>
              <p className="text-[11px] font-semibold text-[#d1d5db]">
                Overall Progress
              </p>
              <p className="text-[11px] text-[#6b7280]">
                {completed} of {TOTAL} solved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completed === TOTAL && completed > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#2f4a25] bg-[#16210f] px-2.5 py-1 text-[10px] font-bold text-[#a3e635]">
                <Trophy className="h-3 w-3" />
                Sheet complete
              </span>
            )}
            <button
              type="button"
              onClick={resetAll}
              disabled={completed === 0 && Object.keys(notes).length === 0}
              className="inline-flex items-center gap-1 rounded-lg border border-[#2b332b] bg-[#141a14] px-2.5 py-1 text-[10px] font-medium text-[#8c9c90] transition-colors hover:border-[#3f4740] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-[#1e241d]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Sheet progress"
        >
          <div
            className="h-full rounded-full bg-[#a3e635] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      {/* Controls */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search problems…"
            aria-label="Search problems"
            className="h-9 w-full rounded-lg border border-[#1e2920] bg-[#0f1410] pl-9 pr-8 text-[12px] text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#a3e635]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 self-start rounded-full border border-[#1e2920] bg-[#0f1410] p-1">
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
                  ? "bg-[#a3e635] text-black"
                  : "text-[#8c9c90] hover:text-white"
              }`}
            >
              {label}
              <span className={filter === v ? "opacity-70" : "text-[#6b7280]"}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Days */}
      {visibleDays.length === 0 ? (
        <p className="rounded-xl border border-[#1e2920] bg-[#0f1410] p-10 text-center text-[13px] text-[#8c9c90]">
          No problems match your filters.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleDays.map((d) => {
            const dayDone = d.problems.filter((p) => doneSet.has(p.n)).length;
            const isOpen = !collapsed.includes(d.day);
            const allDone = dayDone === d.problems.length;

            return (
              <section
                key={d.day}
                className="overflow-hidden rounded-xl border border-[#1e2920] bg-[#0f1410]"
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
                        ? "bg-[#a3e635] text-black"
                        : "bg-[#1a2417] text-[#a3e635]"
                    }`}
                  >
                    {allDone ? <Check className="h-4 w-4" strokeWidth={3} /> : d.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-white">
                      {groupLabel === "day" ? `Day ${d.day}: ${d.title}` : d.title}
                    </span>
                    <span className="block text-[10px] text-[#6b7280]">
                      {dayDone}/{d.problems.length} solved
                    </span>
                  </span>
                  <span className="hidden h-1 w-20 shrink-0 overflow-hidden rounded-full bg-[#1e241d] sm:block">
                    <span
                      className="block h-full rounded-full bg-[#a3e635] transition-all"
                      style={{
                        width: `${(dayDone / d.problems.length) * 100}%`,
                      }}
                    />
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#6b7280] transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <ul className="divide-y divide-[#161e17] border-t border-[#1e2920]">
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
                                ? "border-[#a3e635] bg-[#a3e635] text-black"
                                : "border-[#3f4740] text-transparent hover:border-[#a3e635]"
                            }`}
                          >
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          </button>

                          <span className="w-7 shrink-0 pt-px text-right font-mono text-[10px] text-[#4b5563]">
                            {p.n}
                          </span>

                          <span className="min-w-0 flex-1">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-[#a3e635] hover:underline ${
                                  isDone
                                    ? "text-[#6b7280] line-through"
                                    : "text-[#e5e7eb]"
                                }`}
                              >
                                {p.title}
                                {p.search ? (
                                  <Search
                                    className="h-2.5 w-2.5 shrink-0 text-[#fbbf24]"
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
                                    ? "text-[#6b7280] line-through"
                                    : "text-[#e5e7eb]"
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
                                className="ml-2 inline-flex items-center gap-1 rounded border border-[#1e2920] bg-[#0b0e0b] px-1.5 py-px align-middle text-[9px] font-medium text-[#8c9c90] transition-colors hover:border-[#2f4a25] hover:text-[#a3e635]"
                              >
                                <BookOpen className="h-2.5 w-2.5" />
                                Article
                              </a>
                            )}
                            {note && (
                              <span className="mt-1 block rounded-md border border-[#1e2920] bg-[#0b0e0b] px-2 py-1 text-[10px] italic leading-relaxed text-[#8c9c90]">
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
                                ? "text-[#a3e635]"
                                : "text-[#3f4740] hover:text-[#8c9c90]"
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

      <p className="flex items-center gap-1.5 text-[10px] text-[#6b7280]">
        <ListChecks className="h-3 w-3" />
        Progress and notes are saved in this browser.
        <Search className="ml-2 h-2.5 w-2.5 text-[#fbbf24]" />
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
            className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-[#1e2920] bg-[#0f1410] p-5 shadow-2xl"
          >
            <h3 className="text-[14px] font-bold text-white">
              {SECTIONS.flatMap((d) => d.problems).find((p) => p.n === noteFor)
                ?.title}
            </h3>
            <textarea
              autoFocus
              rows={5}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Approach, edge cases, time complexity, what tripped you up…"
              className="w-full resize-none rounded-lg border border-[#1e2920] bg-[#0b0e0b] p-3 text-[12px] text-white placeholder:text-[#6b7280] focus:outline-none focus:ring-1 focus:ring-[#a3e635]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteFor(null)}
                className="rounded-lg px-3 py-2 text-[12px] text-[#8c9c90] transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNote}
                className="rounded-lg bg-[#a3e635] px-4 py-2 text-[12px] font-bold text-black transition-colors hover:bg-[#84cc16]"
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
