"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, FileText, Loader2, LogIn, PenLine, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EASE } from "@/components/resume-analysis/motion";
import { fmtDate, type BlogCard, type BlogStatus } from "@/lib/blog/types";

type Mine = BlogCard & { reviewNote: string | null };

const BADGE: Record<BlogStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "border-white/15 bg-white/5 text-[var(--color-c-muted)]" },
  pending: { label: "In review", cls: "border-sky-400/30 bg-sky-400/10 text-sky-300" },
  published: { label: "Published", cls: "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]" },
  rejected: { label: "Needs changes", cls: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
};

export function MyPosts() {
  const { user, loading } = useAuth();
  const submitted = useSearchParams().get("submitted") === "1";
  const [items, setItems] = useState<Mine[] | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/blog/posts", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .catch(() => setItems([]));
  }, [user]);

  async function remove(id: string) {
    const r = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
    setConfirm(null);
    if (r.ok) setItems((cur) => cur?.filter((i) => i.id !== id) ?? null);
  }

  if (!loading && !user) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <LogIn className="h-7 w-7 text-[var(--color-c-lime)]" />
        <p className="text-[16px] font-bold text-[var(--color-c-text)]">Sign in to see your posts</p>
        <Link href="/login?next=/blog/mine" className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-4 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-mono text-[clamp(1.5rem,3vw,2rem)] font-bold text-[var(--color-c-text)]">My Posts</h1>
          <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">Drafts, posts in review and everything you&apos;ve published.</p>
        </div>
        <Link href="/blog/new" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-c-lime)] px-4 py-2 text-[13px] font-bold text-black">
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {submitted && (
        <p className="mt-5 flex items-center gap-2 rounded-xl border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-4 py-3 text-[13px] text-[var(--color-c-lime)]">
          <CheckCircle2 className="h-4 w-4" /> Submitted. The team will review it and it will appear on the blog once approved.
        </p>
      )}

      {items === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--color-c-lime)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
          <FileText className="h-7 w-7 text-[var(--color-c-dim)]" />
          <p className="text-[15px] font-bold text-[var(--color-c-text)]">No posts yet</p>
          <p className="text-[13px] text-[var(--color-c-muted)]">Share an interview experience or what you learned. Minimum 500 words.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2.5">
          <AnimatePresence initial={false}>
            {items.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 6) * 0.04 }}
                className="rounded-2xl border border-white/[0.07] bg-[#141713] p-4"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${BADGE[p.status].cls}`}>{BADGE[p.status].label}</span>
                      <span className="font-mono text-[10px] text-[var(--color-c-dim)]">
                        {p.wordCount} words · updated {fmtDate(p.updatedAt)}
                        {p.status === "published" && ` · ${p.views} views`}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-[15px] font-bold text-[var(--color-c-text)]">{p.title}</p>
                    {p.status === "rejected" && p.reviewNote && <p className="mt-1 text-[12px] text-amber-300">Reviewer: {p.reviewNote}</p>}
                  </div>
                  {confirm === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => remove(p.id)} className="rounded-lg bg-red-500/15 px-3 py-1.5 text-[12px] font-bold text-red-300 hover:bg-red-500/25">
                        Delete
                      </button>
                      <button type="button" onClick={() => setConfirm(null)} className="px-2 py-1.5 text-[12px] font-semibold text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
                        Keep
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Link href={`/blog/${p.slug}`} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]">
                        <Eye className="h-3.5 w-3.5" /> {p.status === "published" ? "View" : "Preview"}
                      </Link>
                      {p.status !== "published" && (
                        <>
                          <Link href={`/blog/edit/${p.id}`} className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[12px] font-bold text-black">
                            <PenLine className="h-3.5 w-3.5" /> Edit
                          </Link>
                          <button type="button" aria-label="Delete post" onClick={() => setConfirm(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-c-dim)] hover:bg-red-500/10 hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
