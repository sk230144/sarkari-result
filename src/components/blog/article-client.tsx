"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Link2, ListTree, Loader2, PenLine, ShieldCheck, Trash2 } from "lucide-react";

/** Thin lime bar at the top of the window showing how far through the article you are. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[var(--color-c-lime)]" style={{ scaleX: x }} />;
}

/** Counts one view per visitor per day (the server dedupes). */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/blog/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }), keepalive: true }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [slug]);
  return null;
}

/** "On this page": highlights the section currently being read. */
export function TableOfContents({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    if (!els.length) return;
    // The current section is the last heading scrolled past, so a fast scroll
    // or a jump from the contents list still lands on the right one.
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 140) current = el.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items]);
  if (!items.length) return null;
  return (
    <nav aria-label="On this page" className="rounded-2xl border border-white/[0.07] bg-[#141713] p-4">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">
        <ListTree className="h-3.5 w-3.5" /> On this page
      </p>
      <ol className="space-y-0.5 border-l border-white/[0.07]">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-3 text-[12px] leading-snug transition-colors ${
                active === i.id
                  ? "border-[var(--color-c-lime)] font-semibold text-[var(--color-c-text)]"
                  : "border-transparent text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
              }`}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the page URL is only known in the browser
    setUrl(window.location.href.split("#")[0]);
  }, []);
  const links = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          } catch {
            /* ignore */
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-c-lime)]" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

/** Admin-only bar on an article: edit it, or delete it after a confirmation. */
export function AdminPostActions({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function remove() {
    setBusy(true);
    setError(null);
    const r = await fetch(`/api/blog/posts/${id}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (r?.ok) {
      router.push("/blog");
      router.refresh();
    } else setError("Couldn't delete the post.");
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#141713] px-4 py-2.5">
      <span className="mr-auto inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-lime)]">
        <ShieldCheck className="h-3.5 w-3.5" /> Admin
      </span>
      {error && <span className="text-[12px] text-red-300">{error}</span>}
      {confirm ? (
        <>
          <span className="text-[12px] text-[var(--color-c-text-4)]">Delete this post for everyone?</span>
          <button type="button" disabled={busy} onClick={remove} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/85 px-3 py-1.5 text-[12px] font-bold text-white disabled:opacity-60">
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Delete
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="px-2 py-1.5 text-[12px] font-semibold text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]">
            Cancel
          </button>
        </>
      ) : (
        <>
          <Link href={`/blog/edit/${id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[12px] font-bold text-black">
            <PenLine className="h-3.5 w-3.5" /> Edit
          </Link>
          <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] font-semibold text-red-300 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </>
      )}
    </div>
  );
}
