"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`cl-reveal ${shown ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Types each string in turn, holds, then moves to the next — forever. */
export function TypeLoop({
  texts,
  speed = 55,
  hold = 1800,
  className = "",
  caretClassName = "bg-[var(--color-c-lime)]",
}: {
  texts: string[];
  speed?: number;
  hold?: number;
  className?: string;
  caretClassName?: string;
}) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const text = texts[i];

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let id: ReturnType<typeof setTimeout> | undefined;
    if (n < text.length) {
      id = setTimeout(() => setN(reduce ? text.length : n + 1), reduce ? 0 : speed);
    } else if (!reduce) {
      id = setTimeout(() => {
        setN(0);
        setI((v) => (v + 1) % texts.length);
      }, hold);
    }
    return () => clearTimeout(id);
  }, [n, text, texts.length, speed, hold]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      <span
        aria-hidden
        className={`cl-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] ${caretClassName}`}
      />
    </span>
  );
}

/** Types a single string once. Remount with a new key to replay. */
export function TypeOnce({
  text,
  speed = 18,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= text.length) return;
    const reduce = prefersReducedMotion();
    const id = setTimeout(() => setN(reduce ? text.length : n + 1), reduce ? 0 : speed);
    return () => clearTimeout(id);
  }, [n, text, speed]);

  return (
    <span className={className}>
      {text.slice(0, n)}
      {n < text.length && (
        <span
          aria-hidden
          className="cl-caret ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-[var(--color-c-lime)]"
        />
      )}
    </span>
  );
}

/** Section eyebrow. `solid` is the tilted lime tag; default is the outlined chip. */
export function Kicker({
  children,
  solid = false,
}: {
  children: React.ReactNode;
  solid?: boolean;
}) {
  if (solid) {
    return (
      <span className="inline-block -rotate-2 rounded-md bg-[var(--color-c-lime)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_24px_rgba(163,230,53,0.35)]">
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-c-text-4)]">
      <span className="blink h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
      {children}
    </span>
  );
}

function scrollToGenerator() {
  document
    .getElementById("generate")
    ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
}

export function GenerateCta({
  variant = "solid",
  size = "lg",
  label = "Generate My Cover Letter",
}: {
  variant?: "solid" | "outline";
  size?: "lg" | "md";
  label?: string;
}) {
  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={scrollToGenerator}
        className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-lime)]/40 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-lime)] transition-all hover:border-[var(--color-c-lime)] hover:bg-[var(--color-c-lime)]/10"
      >
        {label}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={scrollToGenerator}
      className={`cl-glow group relative inline-flex items-center overflow-hidden rounded-xl bg-[var(--color-c-lime)] font-bold text-black transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
        size === "lg" ? "gap-3 px-8 py-4 text-[16px]" : "gap-2 px-6 py-3 text-[13px]"
      }`}
    >
      {/* Sheen that sweeps across on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-md transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
      />
      <span className="relative">{label}</span>
      {size === "lg" ? (
        <ChevronRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
      ) : (
        <ArrowRight className="relative h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      )}
    </button>
  );
}
