"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ArrowRight,
  StickyNote,
  ListChecks,
} from "lucide-react";
import {
  QUESTIONS,
  THEMES,
  FAQS,
  type Level,
} from "./system-design-data";
import { CardWatermark } from "./card-watermark";

type Filter = "all" | Level;

const HLD_COUNT = QUESTIONS.filter((q) => q.level === "HLD").length;
const LLD_COUNT = QUESTIONS.filter((q) => q.level === "LLD").length;

/** YouTube play badge — red rounded rect with a white triangle. */
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#FF0000"
        d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.09 0 12 0 12s0 3.91.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.91 24 12 24 12s0-3.91-.5-5.8z"
      />
      <path fill="#fff" d="M9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

export function SystemDesign() {
  const [filter, setFilter] = useState<Filter>("all");
  const [done, setDone] = useState<string[]>([]);
  const [openPoints, setOpenPoints] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const visible = useMemo(
    () =>
      filter === "all"
        ? QUESTIONS
        : QUESTIONS.filter((q) => q.level === filter),
    [filter],
  );

  const total = QUESTIONS.length;
  const completed = done.length;
  const percent = Math.round((completed / total) * 100);

  function toggleDone(slug: string) {
    setDone((p) =>
      p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug],
    );
  }

  function togglePoints(slug: string) {
    setOpenPoints((p) =>
      p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug],
    );
  }

  function openNote(slug: string) {
    setDraftNote(notes[slug] ?? "");
    setNoteFor(slug);
  }

  function saveNote() {
    if (!noteFor) return;
    const text = draftNote.trim();
    setNotes((p) => {
      const next = { ...p };
      if (text) next[noteFor] = text;
      else delete next[noteFor];
      return next;
    });
    setNoteFor(null);
  }

  const FILTERS: { label: string; value: Filter; count: number }[] = [
    { label: "All", value: "all", count: total },
    { label: "HLD", value: "HLD", count: HLD_COUNT },
    { label: "LLD", value: "LLD", count: LLD_COUNT },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-1.5">
        <h1 className="text-[28px] font-bold leading-9 tracking-tight text-white">
          Top {total} System Design Interview Questions
        </h1>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[#8c9c90]">
          {total} hand-picked high-level and low-level system design questions,
          each with a real description, expected key points, and the concepts it
          teaches.
        </p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6c7a71]">
          By DevsUnite · {total} Questions
        </p>
      </header>

      {/* Progress + filters */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[28px] font-bold leading-none text-white">
            {percent}%
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-6">
              <span className="text-[11px] font-semibold text-[#d1d5db]">
                Overall Progress
              </span>
              <span className="text-[11px] text-[#6c7a71]">
                {completed}/{total}
              </span>
            </div>
            <div
              className="h-1 w-36 overflow-hidden rounded-full bg-[#2a2f35]"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall progress"
            >
              <div
                className="h-full rounded-full bg-[#22c55e] transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 self-start rounded-full border border-[#2a2f35] bg-[#15181c] p-1 sm:self-auto">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                  active
                    ? "bg-[#22c55e] text-[#06200f]"
                    : "text-[#8c9c90] hover:text-white"
                }`}
              >
                <span>{f.label}</span>
                <span className={active ? "opacity-70" : "text-[#6c7a71]"}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Question grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((q) => {
          const t = THEMES[q.theme];
          const isDone = done.includes(q.slug);
          const pointsOpen = openPoints.includes(q.slug);
          const shown = q.companies.slice(0, 4);
          const extra = q.companies.length - shown.length;

          return (
            <article
              key={q.slug}
              id={q.slug}
              className={`relative flex scroll-mt-24 flex-col overflow-hidden rounded-xl border p-4 transition-all ${t.card} ${t.border} ${
                isDone ? "opacity-70" : ""
              }`}
            >
              <CardWatermark motif={q.motif} />

              {/* Top row */}
              <div className="relative mb-3 flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold text-white/85">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#60a5fa]" />
                  {q.level}
                </span>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Mark "${q.title}" as done`}
                  onClick={() => toggleDone(q.slug)}
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isDone
                      ? "border-[#22c55e] bg-[#22c55e] text-[#06200f]"
                      : "border-white/25 text-transparent hover:border-white/60"
                  }`}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </button>
              </div>

              <h2
                className={`relative mb-1.5 text-[15px] font-bold leading-snug ${t.title} ${
                  isDone ? "line-through decoration-white/30" : ""
                }`}
              >
                {q.title}
              </h2>

              <p className={`relative mb-3 line-clamp-3 text-[11px] leading-relaxed ${t.body}`}>
                {q.description}
              </p>

              {/* Companies */}
              <div className="relative mb-2.5 flex flex-wrap gap-1">
                {shown.map((c) => (
                  <span
                    key={c}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.chip}`}
                  >
                    {c}
                  </span>
                ))}
                {extra > 0 && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${t.chip}`}
                    title={q.companies.slice(4).join(", ")}
                  >
                    +{extra}
                  </span>
                )}
              </div>

              {/* Key points */}
              <button
                type="button"
                onClick={() => togglePoints(q.slug)}
                aria-expanded={pointsOpen}
                className={`relative mb-2 flex items-center gap-1 text-[11px] font-medium transition-colors ${t.body} hover:text-white`}
              >
                <ListChecks className="h-3.5 w-3.5" />
                <span>Key points</span>
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${
                    pointsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {pointsOpen && (
                <ul className={`relative mb-3 space-y-1.5 text-[11px] leading-relaxed ${t.body}`}>
                  {q.keyPoints.map((p) => (
                    <li key={p} className="flex gap-1.5">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-current opacity-60" />
                      <span>{p}</span>
                    </li>
                  ))}
                  <li className="flex flex-wrap gap-1 pt-1">
                    {q.concepts.map((c) => (
                      <span
                        key={c}
                        className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-medium text-white/70"
                      >
                        {c}
                      </span>
                    ))}
                  </li>
                </ul>
              )}

              {notes[q.slug] && (
                <p className="relative mb-2 rounded-md bg-black/25 p-2 text-[10px] italic leading-relaxed text-white/70">
                  {notes[q.slug]}
                </p>
              )}

              {/* Footer actions */}
              <div className="relative mt-auto flex items-center justify-between gap-2 pt-1">
                <a
                  href={q.article}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${t.title} hover:underline`}
                >
                  Read article
                  <ArrowRight className="h-3 w-3" />
                </a>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                      q.title + " system design",
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Watch a video about ${q.title}`}
                    title="Watch on YouTube"
                    className="flex items-center transition-opacity hover:opacity-80"
                  >
                    <YouTubeIcon className="h-5 w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => openNote(q.slug)}
                    className="inline-flex items-center gap-1 rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/60 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <StickyNote className="h-3 w-3" />
                    {notes[q.slug] ? "Edit note" : "Add note"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* FAQ */}
      <section className="mt-2 flex flex-col gap-3">
        <h2 className="text-[17px] font-bold text-white">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-[#22272c] rounded-xl border border-[#22272c] bg-[#15181c]">
          {FAQS.map((f) => (
            <div key={f.q} className="p-5">
              <h3 className="mb-1.5 text-[13px] font-bold text-white">{f.q}</h3>
              <p className="text-[12px] leading-relaxed text-[#8c9c90]">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Note modal */}
      {noteFor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add a note"
          onClick={() => setNoteFor(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-md flex-col gap-3 rounded-xl border border-[#2a2f35] bg-[#15181c] p-5 shadow-2xl"
          >
            <h3 className="text-[15px] font-bold text-white">
              {QUESTIONS.find((q) => q.slug === noteFor)?.title}
            </h3>
            <textarea
              autoFocus
              rows={5}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Your approach, gotchas to remember, links…"
              className="w-full resize-none rounded-lg bg-[#0e1114] p-3 text-[13px] text-white placeholder:text-[#6c7a71] focus:outline-none focus:ring-1 focus:ring-[#22c55e]"
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
                className="rounded-lg bg-[#22c55e] px-4 py-2 text-[12px] font-bold text-[#06200f] transition-colors hover:bg-[#16a34a]"
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
