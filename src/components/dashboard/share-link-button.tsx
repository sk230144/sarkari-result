"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

const VARIANTS = {
  /** Bare icon, for a tight row of per-item icon buttons (DSA sheet rows). */
  bare: "shrink-0 text-[var(--color-c-border-strong)] hover:text-[var(--color-c-muted)]",
  /** Small square icon button on a tinted card (system design footer). */
  card: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/15 text-white/60 hover:border-white/40 hover:text-[var(--color-c-text)]",
} as const;

/**
 * Copies a direct, shareable link to one question (the page URL plus a #hash
 * anchor), so a single question can be posted on LinkedIn instead of the
 * whole page. Icon only; `label` is the accessible name and tooltip.
 */
export function ShareLinkButton({
  anchor,
  label = "Copy link",
  variant = "bare",
  className = "",
}: {
  anchor: string;
  label?: string;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy(e: React.MouseEvent) {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard blocked: put the link in the address bar so it can be copied by hand.
      window.history.replaceState(null, "", `#${anchor}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const size = variant === "bare" ? "h-3.5 w-3.5" : "h-3 w-3";
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Link copied" : label}
      title={copied ? "Link copied" : label}
      className={`transition-colors ${VARIANTS[variant]} ${copied ? "!text-[var(--color-c-lime)]" : ""} ${className}`}
    >
      {copied ? <Check className={size} /> : <Link2 className={size} />}
    </button>
  );
}
