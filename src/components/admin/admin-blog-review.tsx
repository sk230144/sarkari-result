"use client";

import { useState } from "react";
import { BookOpen, Check, ExternalLink, Loader2, X } from "lucide-react";

export type PendingPost = {
  id: string;
  slug: string;
  title: string;
  author_name: string;
  word_count: number;
  tags: string[];
  submitted_at: string | null;
};

/** Posts waiting for review: preview, approve (publishes now) or send back with a note. */
export function AdminBlogReview({ initial, ready }: { initial: PendingPost[]; ready: boolean }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setError(null);
    const r = await fetch(`/api/admin/blog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    }).catch(() => null);
    setBusy(null);
    if (r?.ok || r?.status === 409) {
      setItems((cur) => cur.filter((p) => p.id !== id));
      setRejecting(null);
      setNote("");
    } else setError("Couldn't update that post. Try again.");
  }

  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <h2 className="mb-1 flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
        <BookOpen className="h-4 w-4 text-[var(--color-c-lime)]" /> Blog review
        {items.length > 0 && <span className="rounded-full bg-[var(--color-c-lime)] px-2 text-[11px] font-bold text-black">{items.length}</span>}
      </h2>
      <p className="mb-4 text-[12px] text-[var(--color-c-muted)]">Posts submitted by users. Approving publishes them on /blog immediately.</p>
      {!ready ? (
        <p className="text-[12px] text-amber-300">Run migration 0021_blog.sql to enable the blog.</p>
      ) : items.length === 0 ? (
        <p className="text-[12px] text-[var(--color-c-dim)]">Nothing waiting for review.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id} className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-[var(--color-c-text)]">{p.title}</p>
                  <p className="text-[11px] text-[var(--color-c-muted)]">
                    {p.author_name} · {p.word_count} words{p.tags.length ? ` · ${p.tags.join(", ")}` : ""}
                    {p.submitted_at && ` · submitted ${new Date(p.submitted_at).toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-border)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]">
                    Preview <ExternalLink className="h-3 w-3" />
                  </a>
                  <button type="button" disabled={busy === p.id} onClick={() => act(p.id, "approve")} className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-c-lime)] px-2.5 py-1.5 text-[11px] font-bold text-black disabled:opacity-60">
                    {busy === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Approve
                  </button>
                  <button type="button" onClick={() => setRejecting(rejecting === p.id ? null : p.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-red-300 hover:bg-red-500/10">
                    <X className="h-3 w-3" /> Reject
                  </button>
                </div>
              </div>
              {rejecting === p.id && (
                <div className="mt-2.5 flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 500))}
                    placeholder="What should the writer change? (shown to them)"
                    className="min-w-0 flex-1 rounded-lg border border-[var(--color-c-border)] bg-transparent px-3 py-1.5 text-[12px] text-[var(--color-c-text)] outline-none focus:border-red-400/50"
                  />
                  <button type="button" disabled={busy === p.id} onClick={() => act(p.id, "reject")} className="rounded-lg bg-red-500/80 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
                    Send back
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-2 text-[12px] text-red-300">{error}</p>}
    </section>
  );
}
