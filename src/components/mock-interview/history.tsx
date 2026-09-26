"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, History, Loader2, PlayCircle, Timer, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EASE } from "@/components/resume-analysis/motion";
import { LEVELS, type InterviewListItem } from "@/lib/interview/types";

const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtLeft = (s: number) => {
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m left` : `${m} min left`;
};

export function scoreChip(score: number | null) {
  if (score === null) return "border-white/10 text-[var(--color-c-dim)]";
  return score >= 75
    ? "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
    : score >= 50
      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
      : "border-red-400/30 bg-red-400/10 text-red-300";
}

// Both sections mount together; share one request between them.
let cache: { uid: string; at: number; p: Promise<InterviewListItem[]> } | null = null;
function loadList(uid: string) {
  if (!cache || cache.uid !== uid || Date.now() - cache.at > 3000) {
    cache = {
      uid,
      at: Date.now(),
      p: fetch("/api/mock-interview", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((j) => (j.items ?? []) as InterviewListItem[])
        .catch(() => []),
    };
  }
  return cache.p;
}

function useInterviewList(filter: (i: InterviewListItem) => boolean) {
  const { user } = useAuth();
  const [items, setItems] = useState<InterviewListItem[] | null>(null);
  useEffect(() => {
    if (!user) return;
    let live = true;
    loadList(user.id).then((all) => live && setItems(all.filter(filter)));
    return () => {
      live = false;
    };
    // `filter` is a module-level function; it never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  async function remove(id: string) {
    const res = await fetch(`/api/mock-interview/${id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      cache = null;
      setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
    }
  }
  return { signedIn: Boolean(user), items, remove };
}

const isOpen = (i: InterviewListItem) => i.status !== "completed";
const isDone = (i: InterviewListItem) => i.status === "completed";

/** Interviews the user left midway, shown above the setup panel. */
export function OngoingInterviews() {
  const { items, remove } = useInterviewList(isOpen);
  if (!items?.length) return null;
  return (
    <section className="px-6 pb-12 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Heading icon={PlayCircle} title="Continue where you left off" sub="Your answers are saved. The clock paused when you left." />
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {items.map((it, i) => {
              const level = LEVELS.find((l) => l.key === it.level);
              const pct = it.total ? Math.round(((it.answered ?? 0) / it.total) * 100) : 0;
              const evaluating = it.status === "evaluating";
              return (
                <Row key={it.id} index={i} onDelete={() => remove(it.id)}>
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                    <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="var(--color-c-lime)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 15}
                        strokeDashoffset={2 * Math.PI * 15 * (1 - pct / 100)}
                      />
                    </svg>
                    <span className="font-mono text-[10px] font-bold text-[var(--color-c-text)]">{pct}%</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold tracking-tight text-[var(--color-c-text)]">{it.role}</p>
                    <p className="flex flex-wrap items-center gap-x-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-dim)]">
                      <span>{level?.label}</span>
                      <span>·</span>
                      <span>
                        {it.answered ?? 0}/{it.total ?? 20} answered
                      </span>
                      {it.timeLeftS !== undefined && !evaluating && (
                        <span className="inline-flex items-center gap-1 text-[var(--color-c-lime)]">
                          <Timer className="h-3 w-3" />
                          {fmtLeft(it.timeLeftS)}
                        </span>
                      )}
                      {evaluating && <span className="text-amber-300">Evaluating…</span>}
                    </p>
                  </div>
                  <Link
                    href={`/mock-interview/${it.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3.5 py-2 text-[12px] font-bold text-black transition-transform hover:-translate-y-0.5"
                  >
                    {evaluating ? "View" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Row>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** Every finished interview, with its score and a link to the report. */
export function InterviewHistory() {
  const { signedIn, items, remove } = useInterviewList(isDone);
  if (!signedIn || items === null) return null;
  return (
    <section className="px-6 pb-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Heading icon={History} title="Interview history" sub="Every finished mock interview, with its score and full report." />
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-muted)]">No finished interviews yet</p>
            <p className="text-[12px] text-[var(--color-c-dim)]">Complete a mock interview and its report will be saved here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <Row key={it.id} index={i} onDelete={() => remove(it.id)}>
                  <span className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border font-mono text-[15px] font-bold ${scoreChip(it.overallScore)}`}>
                    {it.overallScore ?? "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold tracking-tight text-[var(--color-c-text)]">{it.role}</p>
                    <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-dim)]">
                      {LEVELS.find((l) => l.key === it.level)?.label} · {fmtDay(it.createdAt)}
                    </p>
                  </div>
                  <Link
                    href={`/mock-interview/${it.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-lime)]/40 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-[var(--color-c-lime)] transition-colors hover:bg-[var(--color-c-lime)]/10"
                  >
                    Report <ArrowRight className="h-3 w-3" />
                  </Link>
                </Row>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}

function Heading({ icon: Icon, title, sub }: { icon: typeof History; title: string; sub: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-c-lime)]/10">
        <Icon className="h-4 w-4 text-[var(--color-c-lime)]" />
      </span>
      <div>
        <p className="text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">{title}</p>
        <p className="text-[12px] text-[var(--color-c-muted)]">{sub}</p>
      </div>
    </div>
  );
}

/** One list row with an inline "delete?" confirmation. */
function Row({ index, onDelete, children }: { index: number; onDelete: () => Promise<void>; children: React.ReactNode }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index, 6) * 0.04 }}
      className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#141713] px-4 py-3.5 transition-colors hover:border-white/15"
    >
      {confirm ? (
        <>
          <p className="flex-1 text-[13px] font-semibold text-[var(--color-c-text)]">Delete this interview and its answers?</p>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onDelete();
              setBusy(false);
              setConfirm(false);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 px-3 py-1.5 text-[12px] font-bold text-red-300 hover:bg-red-500/25"
          >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            Delete
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="rounded-lg px-2 py-1.5 text-[12px] font-bold text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
            Keep
          </button>
        </>
      ) : (
        <>
          {children}
          <button
            type="button"
            aria-label="Delete interview"
            onClick={() => setConfirm(true)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-c-dim)] transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </motion.div>
  );
}
