"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Library, Loader2, PenLine, Plus, Search, Trash2 } from "lucide-react";

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  author_name: string;
  status: "draft" | "pending" | "published" | "rejected";
  views: number;
  word_count: number;
  updated_at: string;
};

const BADGE: Record<AdminPost["status"], string> = {
  published: "bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]",
  pending: "bg-sky-400/15 text-sky-300",
  draft: "bg-white/10 text-[var(--color-c-muted)]",
  rejected: "bg-amber-400/15 text-amber-300",
};

/** Every post on the blog: view, edit or delete any of them. */
export function AdminBlogPosts({ initial, ready }: { initial: AdminPost[]; ready: boolean }) {
  const [items, setItems] = useState(initial);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | AdminPost["status"]>("all");
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(
      (p) => (status === "all" || p.status === status) && (!needle || p.title.toLowerCase().includes(needle) || p.author_name.toLowerCase().includes(needle)),
    );
  }, [items, q, status]);

  async function remove(id: string) {
    setBusy(id);
    setError(null);
    const r = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(null);
    setConfirm(null);
    if (r?.ok) setItems((cur) => cur.filter((p) => p.id !== id));
    else setError("Couldn't delete that post.");
  }

  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
          <Library className="h-4 w-4 text-[var(--color-c-lime)]" /> All blog posts
          <span className="text-[12px] font-medium text-[var(--color-c-dim)]">({items.length})</span>
        </h2>
        <Link href="/blog/new" className="ml-auto inline-flex items-center gap-1 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[12px] font-bold text-black">
          <Plus className="h-3.5 w-3.5" /> New post
        </Link>
      </div>
      {!ready ? (
        <p className="text-[12px] text-amber-300">Run migration 0021_blog.sql to enable the blog.</p>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-[var(--color-c-border)] px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-[var(--color-c-dim)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search title or author"
                className="w-full bg-transparent text-[12px] text-[var(--color-c-text)] outline-none placeholder:text-[var(--color-c-dim)]"
              />
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-3 py-1.5 text-[12px] text-[var(--color-c-text)] outline-none"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="pending">In review</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {shown.length === 0 ? (
            <p className="text-[12px] text-[var(--color-c-dim)]">No posts match.</p>
          ) : (
            <ul className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
              {shown.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-3 py-2.5">
                  <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${BADGE[p.status]}`}>{p.status === "pending" ? "review" : p.status}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[var(--color-c-text)]">{p.title}</p>
                    <p className="text-[10px] text-[var(--color-c-dim)]">
                      {p.author_name} · {p.word_count} words · {p.views} views · updated {new Date(p.updated_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  {confirm === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[var(--color-c-text-4)]">Delete for everyone?</span>
                      <button type="button" disabled={busy === p.id} onClick={() => remove(p.id)} className="inline-flex items-center gap-1 rounded-lg bg-red-500/85 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-60">
                        {busy === p.id && <Loader2 className="h-3 w-3 animate-spin" />} Delete
                      </button>
                      <button type="button" onClick={() => setConfirm(null)} className="px-1.5 py-1 text-[11px] text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" title="View" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] hover:bg-white/5 hover:text-[var(--color-c-text)]">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <Link href={`/blog/edit/${p.id}`} title="Edit" className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] hover:bg-white/5 hover:text-[var(--color-c-lime)]">
                        <PenLine className="h-3.5 w-3.5" />
                      </Link>
                      <button type="button" title="Delete" onClick={() => setConfirm(p.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] hover:bg-red-500/10 hover:text-red-300">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-[12px] text-red-300">{error}</p>}
        </>
      )}
    </section>
  );
}
