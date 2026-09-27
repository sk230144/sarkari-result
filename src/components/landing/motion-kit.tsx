"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  animate,
  motion,
  MotionConfig,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

/*
 * Motion pieces for the home page. Everything is decorative: with reduced
 * motion the content renders in place, and the pointer tilt only runs on
 * devices with a real hover pointer.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const noop = () => () => {};

/**
 * The user's reduced-motion setting, but only after hydration: the server
 * can't know it, so the first client render must match the server's.
 */
export function useCalm() {
  const reduce = useReducedMotion();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return hydrated && !!reduce;
}

/** Rises into place with a 3D tilt the first time it scrolls into view. */
export function Reveal3D({
  children,
  from = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  from?: "up" | "left" | "right";
  delay?: number;
  className?: string;
}) {
  const start =
    from === "left" ? { opacity: 0, x: -60, rotateY: 22 } : from === "right" ? { opacity: 0, x: 60, rotateY: -22 } : { opacity: 0, y: 70, rotateX: 24 };
  return (
    <MotionConfig reducedMotion="user">
      <div className={className} style={{ perspective: 1400 }}>
        <motion.div
          className="h-full"
          style={{ transformOrigin: from === "up" ? "50% 100%" : from === "left" ? "0% 50%" : "100% 50%" }}
          initial={start}
          whileInView={{ opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: EASE, delay }}
        >
          {children}
        </motion.div>
      </div>
    </MotionConfig>
  );
}

/** Follows the pointer in 3D with a soft glare. */
export function Tilt({ children, max = 10, className = "", glare = true }: { children: React.ReactNode; max?: number; className?: string; glare?: boolean }) {
  const reduce = useCalm();
  const [enabled, setEnabled] = useState(false);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 180, damping: 18 });
  const gx = useTransform(px, [0, 1], [0, 100]);
  const gy = useTransform(py, [0, 1], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.18), transparent 55%)`;

  useEffect(() => {
    // Only on real hover pointers (not touch).
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const set = () => setEnabled(mq.matches && !reduce);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, [reduce]);

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        className="relative h-full"
        style={enabled ? { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" } : undefined}
        onPointerMove={(e) => {
          if (!enabled) return;
          const r = e.currentTarget.getBoundingClientRect();
          px.set((e.clientX - r.left) / r.width);
          py.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => {
          px.set(0.5);
          py.set(0.5);
        }}
      >
        {children}
        {enabled && glare && (
          <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light" style={{ background: glareBg }} />
        )}
      </motion.div>
    </div>
  );
}

/** Gentle up-and-down bob. */
export function Float({ children, distance = 8, duration = 4, delay = 0, className = "" }: { children: React.ReactNode; distance?: number; duration?: number; delay?: number; className?: string }) {
  const reduce = useCalm();
  return (
    <motion.div
      className={className}
      animate={reduce ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to a stat like "50,000+", "100K+", "60%" or "2x" when it scrolls into view. */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const reduce = useCalm();
  const ref = useRef<HTMLSpanElement>(null);
  // Starts as soon as any of it is on screen; the reveal around it is still fading in.
  const inView = useInView(ref, { once: true });
  const m = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  const target = m ? Number(m[2].replace(/,/g, "")) : 0;
  const grouped = m ? m[2].includes(",") : false;
  // The final value until counting starts, so the server HTML and no-JS readers get the real number.
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || reduce || !target) return;
    const c = animate(0, target, { duration: 1.6, ease: EASE, onUpdate: (v) => setN(v) });
    return () => c.stop();
  }, [inView, reduce, target]);

  if (!m) return <span className={className}>{value}</span>;
  const shown = n ?? target;
  const text = grouped ? Math.round(shown).toLocaleString("en-US") : String(Math.round(shown));
  return (
    <span ref={ref} className={className}>
      {m[1]}
      {text}
      {m[3]}
    </span>
  );
}

/** Children listed inside animate in one after another with a 3D flip. */
const flipParent: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const flipChild: Variants = {
  hidden: { opacity: 0, rotateX: -80, y: 20 },
  show: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function FlipGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        style={{ perspective: 800 }}
        variants={flipParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

export function FlipItem({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={flipChild} style={{ transformOrigin: "50% 0%" }}>
      {children}
    </motion.div>
  );
}

/** Equalizer bars that pulse like live activity. */
export function EqBars({ heights, className = "" }: { heights: number[]; className?: string }) {
  const reduce = useCalm();
  return (
    <div className={`flex h-16 items-end gap-1.5 ${className}`}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-2.5 rounded-full bg-[var(--color-c-green)]"
          style={{ height: h }}
          animate={reduce ? undefined : { height: [h, Math.max(12, h * 0.4), h * 1.1, h] }}
          transition={{ duration: 1.6 + (i % 3) * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

/** A globe-like ring that turns in 3D. */
export function Spin3D({ children, duration = 9, className = "" }: { children: React.ReactNode; duration?: number; className?: string }) {
  const reduce = useCalm();
  return (
    <div className={className} style={{ perspective: 400 }}>
      <motion.div animate={reduce ? undefined : { rotateY: 360 }} transition={{ duration, repeat: Infinity, ease: "linear" }} style={{ transformStyle: "preserve-3d" }}>
        {children}
      </motion.div>
    </div>
  );
}

/** The match-score ring from the "How it works" panel, filling up when seen. */
export function ScoreRing({ pct }: { pct: number }) {
  const reduce = useCalm();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <div ref={ref} className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-[var(--color-c-surface-13c)]"
          d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <motion.path
          className="text-[var(--color-c-green)]"
          d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView || reduce ? pct / 100 : 0 }}
          transition={reduce ? { duration: 0 } : { duration: 1.6, ease: EASE, delay: 0.2 }}
        />
      </svg>
      <span className="absolute text-base font-bold text-[var(--color-c-text)]">
        <CountUp value={`${pct}%`} />
      </span>
    </div>
  );
}

/** Rows that appear one by one, like a form being filled in. */
export function Sequence({ children, className = "", step = 0.25 }: { children: React.ReactNode[]; className?: string; step?: number }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.5 }} variants={{ hidden: {}, show: { transition: { staggerChildren: step, delayChildren: 0.2 } } }}>
        {children.map((c, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE } } }}>
            {c}
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  );
}

/**
 * Types its text out once it scrolls into view. The full text is rendered
 * first (server HTML, no-JS readers) and reserves the space, so nothing shifts.
 */
export function Typewriter({ text, speed = 45, className = "" }: { text: string; speed?: number; className?: string }) {
  const calm = useCalm();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    if (!inView || calm) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [inView, calm, text, speed]);

  const shown = n ?? text.length;
  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0" aria-label={text}>
        {text.slice(0, shown)}
        {n !== null && n < text.length && <span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-[var(--color-c-green)]" />}
      </span>
    </span>
  );
}

/** A soft light that sweeps across its content every few seconds. */
export function Sweep({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const calm = useCalm();
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {!calm && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[var(--color-c-green)]/15 to-transparent"
          animate={{ x: ["0%", "450%"] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
