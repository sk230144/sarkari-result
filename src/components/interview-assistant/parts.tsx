"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Crown, Download, Loader2, Lock, Monitor, Play, Sparkles } from "lucide-react";
import { BUILDS, type Build } from "@/lib/desktop-app";
import { useCalm } from "@/components/landing/motion-kit";
import { useAuth } from "@/components/auth/auth-provider";

/** Where people without PRO+ go. */
const UNLOCK_HREF = "/pricing";

const noop = () => () => {};

/** The visitor's OS, known only after hydration (null on the server). */
function useOs(): "windows" | "mac" | null {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/i.test(navigator.userAgent) ? "mac" : /Windows/i.test(navigator.userAgent) ? "windows" : null),
    () => null,
  );
}

/** The Apple logo as a mask, so it takes the surrounding text colour like the other icons. */
function AppleLogo({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className}`}
      style={{
        WebkitMask: "url(/interview-assistant/apple.png) center / contain no-repeat",
        mask: "url(/interview-assistant/apple.png) center / contain no-repeat",
      }}
    />
  );
}

const Icon = ({ build, className }: { build: Build; className?: string }) =>
  build.os === "mac" ? <AppleLogo className={className} /> : <Monitor className={className} />;

type Access = "checking" | "locked" | "open";

/**
 * Whether this visitor may download the app: signed in with PRO+ (or admin).
 * Same rule the server applies to the access key and the app itself.
 */
function useAppAccess(): Access {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) return;
    let live = true;
    fetch("/api/payments/status", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => live && setOpen(Boolean(j?.proAccess)))
      .catch(() => live && setOpen(false));
    return () => {
      live = false;
    };
  }, [user]);
  if (loading) return "checking";
  if (!user) return "locked";
  return open === null ? "checking" : open ? "open" : "locked";
}

/** Shown instead of a download button until the visitor has PRO+. */
function UnlockButton({ size = "lg", className = "" }: { size?: "lg" | "md"; className?: string }) {
  const calm = useCalm();
  const lg = size === "lg";
  return (
    <Link href={UNLOCK_HREF} className={`ia-cta group relative inline-flex rounded-full p-[2px] transition-transform hover:-translate-y-0.5 ${className}`}>
      <span
        className={`relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-[var(--color-c-surface-7)] font-bold text-[var(--color-c-text)] ${
          lg ? "px-7 py-4 text-base" : "px-5 py-3 text-sm"
        }`}
      >
        <span aria-hidden className="ia-cta-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <motion.span
          className="flex"
          animate={calm ? undefined : { rotate: [0, -14, 12, -8, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 1.8 }}
        >
          <Lock className={lg ? "h-5 w-5 text-[var(--color-c-green)]" : "h-4 w-4 text-[var(--color-c-green)]"} />
        </motion.span>
        <span>Include premium access for this app</span>
        <motion.span
          className="flex"
          animate={calm ? undefined : { y: [0, -3, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Crown className={lg ? "h-5 w-5 text-[var(--color-c-lime-2)]" : "h-4 w-4 text-[var(--color-c-lime-2)]"} />
        </motion.span>
        <motion.span
          className="absolute right-3 top-1.5 flex"
          animate={calm ? undefined : { opacity: [0, 1, 0], scale: [0.6, 1, 0.6], rotate: [0, 90, 180] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 0.6 }}
          aria-hidden
        >
          <Sparkles className="h-3 w-3 text-[var(--color-c-green)]" />
        </motion.span>
      </span>
    </Link>
  );
}

function Checking({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-c-forest-20)] px-7 py-4 text-sm text-[var(--color-c-text-dim)] ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin" /> Checking your plan…
    </span>
  );
}

/** Hero buttons: the visitor's own OS first. */
export function HeroDownloads() {
  const os = useOs();
  const access = useAppAccess();
  const win = BUILDS[0];
  const mac = BUILDS[1];
  const [first, second] = os === "mac" ? [mac, win] : [win, mac];
  if (access === "checking") return <Checking className="w-full sm:w-auto" />;
  if (access === "locked") {
    return (
      <div className="flex flex-col items-center gap-2.5">
        <UnlockButton className="w-full sm:w-auto" />
        <span className="text-xs text-[var(--color-c-text-dim)]">Get PRO+ to download it for Windows or Mac.</span>
      </div>
    );
  }
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
      <a
        href={first.href}
        className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--color-c-green)] px-7 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(74,222,128,0.65)] sm:w-auto"
      >
        <Icon build={first} className="h-5 w-5" />
        Download for {first.os === "mac" ? "Mac" : "Windows"}
        <span className="rounded-full bg-black/15 px-2 py-0.5 text-[11px] font-semibold">{first.detail}</span>
      </a>
      <a
        href={second.os === "mac" ? "#download" : second.href}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[var(--color-c-forest-20)] bg-[var(--color-c-surface-7)]/95 px-7 py-4 text-base font-semibold text-[var(--color-c-text)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-c-surface-15b)] sm:w-auto"
      >
        <Icon build={second} className="h-5 w-5 text-[var(--color-c-green)]" />
        Download for {second.os === "mac" ? "Mac" : "Windows"}
      </a>
    </div>
  );
}

/** A download card per build; the one matching the visitor's OS gets the highlight. */
export function DownloadCards() {
  const os = useOs();
  const access = useAppAccess();
  return (
    <>
      <AnimatePresence>
        {access === "locked" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-8 flex flex-col items-center gap-2.5 text-center"
          >
            <UnlockButton />
            <span className="text-xs text-[var(--color-c-text-dim)]">Downloads unlock with PRO+.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {BUILDS.map((b, i) => {
          const mine = os ? b.os === os && (b.os !== "mac" || b.id === "mac-arm") : i === 0;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 40, rotateX: 18 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformPerspective: 1000 }}
              className={`relative flex flex-col justify-between overflow-hidden rounded-[28px] border p-7 ${
                mine
                  ? "border-[var(--color-c-green)]/60 bg-[var(--color-c-green-dim-8)] shadow-[0_0_40px_-10px_rgba(74,222,128,0.45)]"
                  : "border-[var(--color-c-forest-8)] bg-[var(--color-c-surface-4)]"
              }`}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--color-c-green)]/10 blur-3xl" aria-hidden />
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-c-surface-7)]">
                    <Icon build={b} className="h-6 w-6 text-[var(--color-c-green)]" />
                  </span>
                  {mine && (
                    <span className="rounded-full bg-[var(--color-c-lime-2)] px-3 py-1 text-[10px] font-extrabold uppercase text-black">
                      {os ? "Your computer" : "Most popular"}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-[var(--color-c-text)]">{b.label}</h3>
                <p className="mt-1 text-sm text-[var(--color-c-text-dim)]">{b.detail}</p>
                <dl className="mt-5 space-y-1.5 rounded-2xl bg-[var(--color-c-canvas-deep)] p-4 text-xs text-[var(--color-c-text-dim)]">
                  <div className="flex justify-between gap-3">
                    <dt>File</dt>
                    <dd className="truncate text-[var(--color-c-text)]">{b.file.endsWith(".exe") ? "Installer (.exe)" : "Disk image (.dmg)"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>Size</dt>
                    <dd className="text-[var(--color-c-text)]">{b.size}</dd>
                  </div>
                </dl>
              </div>
              {access === "open" ? (
                <a
                  href={b.href}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                    mine
                      ? "bg-[var(--color-c-green)] text-black shadow-[0_0_24px_rgba(74,222,128,0.35)]"
                      : "bg-[var(--color-c-surface-14)] text-[var(--color-c-text)] hover:bg-[var(--color-c-forest-18)]"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  Download {b.file.endsWith(".exe") ? ".exe" : ".dmg"}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-dashed border-[var(--color-c-forest-20)] px-5 py-3.5 text-sm font-semibold text-[var(--color-c-text-dim)]"
                >
                  {access === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Download {b.file.endsWith(".exe") ? ".exe" : ".dmg"}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

/** A proof clip: plays muted while on screen, pauses when scrolled away. Controls let people unmute. */
export function ProofVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const calm = useCalm();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || calm) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [calm]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-c-forest-16)] bg-black">
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        controls={playing}
        preload="metadata"
        aria-label={label}
        className="aspect-video w-full object-cover"
        onPlay={() => setPlaying(true)}
      />
      {!playing && (
        <button
          type="button"
          onClick={() => ref.current?.play()}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/20"
          aria-label={`Play: ${label}`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-c-green)] text-black shadow-[0_0_30px_rgba(74,222,128,0.5)]">
            <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="rounded-2xl border border-[var(--color-c-forest-8)] bg-[var(--color-c-surface-4)]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold text-[var(--color-c-text)] sm:p-6"
            >
              {it.q}
              <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--color-c-text-dim)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:px-6 sm:pb-6">{it.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
