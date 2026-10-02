"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

const VARIANTS = {
  /** Bordered pill with a label — matches the "Copy link" style on blog articles. */
  pill: "inline-flex items-center gap-1.5 rounded-md border border-[var(--color-c-border)] px-2 py-1 font-mono text-[10px] font-semibold text-[var(--color-c-muted)] hover:border-white/25 hover:text-[var(--color-c-text)]",
  /** Bare icon — for a tight row of per-item icon buttons (DSA sheet rows). */
  bare: "shrink-0 text-[var(--color-c-border-strong)] hover:text-[var(--color-c-muted)]",
  /** Bordered pill on a dark card tint — system design's footer action row. */
  card: "inline-flex items-center gap-1 rounded border border-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/60 hover:border-white/40 hover:text-[var(--color-c-text)]",
} as const;

/**
 * Copies a direct, shareable link to one question/pattern (the page URL plus
 * a #hash anchor). Used on DSA sheets, FAANG question lists and system
 * design, so a single question can be posted on LinkedIn instead of the
 * whole page.
 */
export function ShareLinkButton({
  anchor,
  label = "Copy link",
  variant = "pill",
  showLabel = true,
  className = "",
}: {
  anchor: string;
  variant?: keyof typeof VARIANTS;
  /** Pill/card variants: show the text label next to the icon (hidden once copied still reads "Copied"). */
  showLabel?: boolean;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API unavailable (very old browser, or blocked) — fall back
      // to moving the address bar there, which the reader can copy manually.
      window.history.replaceState(null, "", `#${anchor}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const iconCls = variant === "bare" ? "h-3.5 w-3.5" : "h-3 w-3";
  const limeWhenCopied = variant === "bare" ? (copied ? "text-[var(--color-c-lime)]" : "") : "";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={`transition-colors ${VARIANTS[variant]} ${limeWhenCopied} ${className}`}
    >
      {copied ? <Check className={`${iconCls} ${variant !== "bare" ? "text-[var(--color-c-lime)]" : ""}`} /> : <Link2 className={iconCls} />}
      {variant !== "bare" && showLabel && (copied ? "Copied" : label)}
    </button>
  );
}
