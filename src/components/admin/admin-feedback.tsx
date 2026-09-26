"use client";

import { useMemo, useState } from "react";
import { Bug, Lightbulb, Heart, MessageCircle, Star, CheckCircle2, RotateCcw, Trash2, Mail, MessageSquarePlus } from "lucide-react";

export type FeedbackItem = {
  id: string;
  name: string | null;
  email: string;
  category: "bug" | "idea" | "praise" | "other";
  rating: number | null;
  message: string;
  page: string | null;
  resolved_at: string | null;
  created_at: string;
};

const CATS = {
  bug: { label: "Bug", icon: Bug, cls: "bg-red-500/15 text-red-300" },
  idea: { label: "Idea", icon: Lightbulb, cls: "bg-amber-400/15 text-amber-300" },
  praise: { label: "Praise", icon: Heart, cls: "bg-pink-500/15 text-pink-300" },
  other: { label: "Other", icon: MessageCircle, cls: "bg-sky-500/15 text-sky-300" },
};

function ago(iso: string) {
  const mins = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminFeedback({ initial, ready }: { initial: FeedbackItem[]; ready: boolean }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"open" | "resolved" | "all">("open");
  const [cat, setCat] = useState<"all" | FeedbackItem["category"]>("all");

  const shown = useMemo(
    () =>
      items.filter(
        (f) => (filter === "all" || (filter === "open" ? !f.resolved_at : !!f.resolved_at)) && (cat === "all" || f.category === cat),
      ),
    [items, filter, cat],
  );
  const openCount = items.filter((f) => !f.resolved_at).length;
  const rated = items.filter((f) => f.rating);
  const avg = rated.length ? rated.reduce((n, f) => n + (f.rating ?? 0), 0) / rated.length : null;

  async function resolve(f: FeedbackItem, resolved: boolean) {
    const before = items;
    setItems((prev) => prev.map((x) => (x.id === f.id ? { ...x, resolved_at: resolved ? new Date().toISOString() : null } : x)));
    const res = await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: f.id, resolved }),
    });
    if (!res.ok) setItems(before);
  }

  async function remove(f: FeedbackItem) {
    const before = items;
    setItems((prev) => prev.filter((x) => x.id !== f.id));
    const res = await fetch("/api/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: f.id }),
    });
    if (!res.ok) setItems(before);
  }

  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-c-text)]">
          <MessageSquarePlus className="h-4 w-4 text-[var(--color-c-lime)]" />
          Feedback
          <span className="text-[11px] font-normal text-[var(--color-c-dim)]">
            {openCount} open · {items.length} total
            {avg !== null && ` · avg rating ${avg.toFixed(1)}/5`}
          </span>
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {(["open", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${
                filter === f ? "bg-[var(--color-c-lime)] text-black" : "bg-white/[0.05] text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
              }`}
            >
              {f}
            </button>
          ))}
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as typeof cat)}
            className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] text-[var(--color-c-text-4)] focus:outline-none"
          >
            <option value="all">All types</option>
            {Object.entries(CATS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!ready ? (
        <p className="mt-3 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] px-3 py-2.5 text-[12px] text-[var(--color-c-muted)]">
          The feedback table doesn&apos;t exist yet. Run supabase/migrations/0015_feedback.sql in the Supabase SQL editor.
        </p>
      ) : shown.length === 0 ? (
        <p className="mt-3 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] px-3 py-2.5 text-[12px] text-[var(--color-c-muted)]">
          {items.length ? "Nothing matches this filter." : "No feedback yet. It appears here as soon as someone uses the Feedback button."}
        </p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {shown.map((f) => {
            const c = CATS[f.category];
            return (
              <article
                key={f.id}
                className={`rounded-xl border p-4 ${
                  f.resolved_at ? "border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] opacity-60" : "border-[var(--color-c-border)] bg-[var(--color-c-surface-2)]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-lime)] text-[13px] font-bold text-black">
                      {(f.name || f.email).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[var(--color-c-text)]">{f.name || f.email.split("@")[0]}</p>
                      <a href={`mailto:${f.email}`} className="inline-flex items-center gap-1 truncate text-[11px] text-[var(--color-c-lime)] hover:underline">
                        <Mail className="h-3 w-3" />
                        {f.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${c.cls}`}>
                      <c.icon className="h-3 w-3" />
                      {c.label}
                    </span>
                    {f.rating && (
                      <span className="inline-flex items-center gap-0.5 text-amber-300">
                        {Array.from({ length: f.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </span>
                    )}
                    <span className="text-[var(--color-c-dim)]">{ago(f.created_at)}</span>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{f.message}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-c-border)] pt-2.5">
                  <span className="font-mono text-[10px] text-[var(--color-c-dim)]">
                    {f.page ? `from ${f.page}` : ""}
                    {f.resolved_at && ` · resolved ${ago(f.resolved_at)}`}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => resolve(f, !f.resolved_at)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]"
                    >
                      {f.resolved_at ? <RotateCcw className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-[var(--color-c-lime)]" />}
                      {f.resolved_at ? "Reopen" : "Resolve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(f)}
                      aria-label="Delete feedback"
                      className="rounded-lg border border-white/10 p-1.5 text-[var(--color-c-dim)] hover:border-red-500/30 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
