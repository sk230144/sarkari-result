"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDownWideNarrow, Check, ChevronDown, FileText, Filter, Plus, Search, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EASE } from "@/components/resume-analysis/motion";
import { BLOG_TAGS, FEATURED_TAGS, tagClass, type BlogCard } from "@/lib/blog/types";
import { BlogCardView } from "./blog-card";

const WORDS = ["engineer", "developer", "fresher", "job seeker"];
const SORTS = [
  { key: "latest", label: "Latest" },
  { key: "oldest", label: "Oldest" },
  { key: "views", label: "Most viewed" },
  { key: "longest", label: "Longest read" },
] as const;
type Sort = (typeof SORTS)[number]["key"];
const GLYPHS = "abcdefghijklmnopqrstuvwxyz";

/** The highlighted word in the heading: scrambles, then settles on the next word. */
function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(WORDS[0]);
  useEffect(() => {
    if (reduce) return;
    let frame = 0;
    let tick: ReturnType<typeof setInterval> | undefined;
    const hold = setTimeout(() => {
      const next = WORDS[(i + 1) % WORDS.length];
      tick = setInterval(() => {
        frame++;
        const settled = Math.floor(frame / 2);
        setShown(
          next
            .split("")
            .map((c, k) => (k < settled || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (settled >= next.length) {
          clearInterval(tick);
          setI((v) => (v + 1) % WORDS.length);
        }
      }, 45);
    }, 2600);
    return () => {
      clearTimeout(hold);
      clearInterval(tick);
    };
  }, [i, reduce]);
  return (
    <span className="relative inline-block min-w-[10ch] text-[var(--color-c-lime)]">
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{WORDS[i]}</span>
    </span>
  );
}

function Dropdown({ label, icon: Icon, children, active }: { label: string; icon: typeof Filter; children: React.ReactNode; active?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
          active ? "border-[var(--color-c-lime)]/50 text-[var(--color-c-lime)]" : "border-white/10 text-[var(--color-c-text)] hover:border-white/25"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute z-30 mt-2 min-w-[220px] rounded-2xl border border-white/10 bg-[#1a1d18] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.85)]"
            onClick={(e) => (e.target as HTMLElement).closest("[data-close]") && setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const noop = () => () => {};

export function BlogIndex({ posts }: { posts: BlogCard[] }) {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  // False while hydrating (matching the server HTML), true after. This part of
  // the page hydrates late, after sign-in may already be known in the browser.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [q, setQ] = useState("");
  const params = useSearchParams();
  // /blog?tag=System%20Design (from an article's tag chips) starts filtered.
  const [tags, setTags] = useState<string[]>(() => {
    const t = params.get("tag");
    return t && BLOG_TAGS.some((b) => b.name === t) ? [t] : [];
  });
  const [sort, setSort] = useState<Sort>("latest");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = posts.filter(
      (p) =>
        (!tags.length || tags.some((t) => p.tags.includes(t))) &&
        (!needle || p.title.toLowerCase().includes(needle) || p.tags.some((t) => t.toLowerCase().includes(needle)) || p.authorName.toLowerCase().includes(needle)),
    );
    const time = (p: BlogCard) => new Date(p.publishedAt ?? p.updatedAt).getTime();
    return list.sort((a, b) =>
      sort === "oldest" ? time(a) - time(b) : sort === "views" ? b.views - a.views : sort === "longest" ? b.wordCount - a.wordCount : time(b) - time(a),
    );
  }, [posts, q, tags, sort]);

  const toggle = (t: string) => setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      {/* hero */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#1a2016] via-[#141811] to-[#121411] px-6 py-9 sm:px-10 sm:py-11"
      >
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 h-72 w-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.10) 0%, transparent 70%)" }} />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-c-lime)]">[ Job Alert 24 Blog ]</p>
          <div className="flex gap-2">
            {hydrated && user && (
              <Link
                href="/blog/mine"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-[13px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
              >
                <FileText className="h-4 w-4" /> My posts
              </Link>
            )}
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[13px] font-semibold text-[var(--color-c-text)] transition-colors hover:border-[var(--color-c-lime)]/50 hover:text-[var(--color-c-lime)]"
            >
              <Plus className="h-4 w-4" /> Post a Blog
            </Link>
          </div>
        </div>
        <h1 className="relative mt-6 max-w-2xl text-[clamp(2rem,5vw,3.1rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-[var(--color-c-text)]">
          Everything a <RotatingWord /> should be reading
        </h1>
        <p className="relative mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-c-muted)]">
          Practical guides, career advice, and industry updates, curated for developers who take their growth seriously.
        </p>
        <div className="relative mt-6 flex flex-wrap gap-2.5">
          {FEATURED_TAGS.map((t) => {
            const on = tags.includes(t.name);
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => toggle(t.name)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all hover:-translate-y-0.5 ${t.cls} ${on ? "ring-2 ring-current/40 ring-offset-2 ring-offset-[#141811]" : ""}`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* search */}
      <div className="mt-8">
        <label className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-[#2a2e24]/60 px-4 py-2.5 transition-colors focus-within:border-[var(--color-c-lime)]/50">
          <Search className="h-4 w-4 text-[var(--color-c-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 100))}
            placeholder="Search blogs by title or tags..."
            className="w-full bg-transparent text-[13px] text-[var(--color-c-text)] outline-none placeholder:text-[var(--color-c-muted)]"
          />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {/* filters + sort */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown label={tags.length ? `Filters · ${tags.length}` : "Filters"} icon={Filter} active={tags.length > 0}>
            <p className="px-2 pb-1.5 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-dim)]">Topics</p>
            <div className="max-h-72 overflow-y-auto">
              {BLOG_TAGS.map((t) => {
                const on = tags.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggle(t.name)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-c-text)]"
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${on ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black" : "border-white/20"}`}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {t.name}
                  </button>
                );
              })}
            </div>
            {tags.length > 0 && (
              <button type="button" data-close onClick={() => setTags([])} className="mt-1 w-full rounded-lg px-2 py-2 text-left text-[12px] font-semibold text-[var(--color-c-lime)] hover:bg-white/[0.05]">
                Clear filters
              </button>
            )}
          </Dropdown>
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => toggle(t)} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${tagClass(t)}`}>
              {t} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[var(--color-c-muted)]">
            {shown.length} result{shown.length === 1 ? "" : "s"}
          </span>
          <Dropdown label={SORTS.find((s) => s.key === sort)!.label} icon={ArrowDownWideNarrow}>
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                data-close
                onClick={() => setSort(s.key)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-c-text)]"
              >
                {s.label}
                {sort === s.key && <Check className="h-4 w-4 text-[var(--color-c-lime)]" strokeWidth={3} />}
              </button>
            ))}
          </Dropdown>
        </div>
      </div>

      {/* grid */}
      {shown.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <p className="text-[16px] font-bold text-[var(--color-c-text)]">{posts.length ? "No posts match that" : "No posts yet"}</p>
          <p className="text-[13px] text-[var(--color-c-muted)]">{posts.length ? "Try another search or clear the filters." : "Be the first to write one."}</p>
          {!posts.length && (
            <Link href="/blog/new" className="mt-2 rounded-full bg-[var(--color-c-lime)] px-5 py-2 text-[13px] font-bold text-black">
              Post a Blog
            </Link>
          )}
        </div>
      ) : (
        <motion.div layout className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {shown.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
              >
                <BlogCardView post={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
