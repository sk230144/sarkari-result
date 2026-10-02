"use client";

import { useEffect } from "react";

/**
 * When the page loads with a #hash (someone followed a shared question
 * link), this opens the right group and scrolls the target into view.
 *
 * `reveal(id)` must synchronously return the set of group keys to expand so
 * the target becomes reachable (e.g. the section containing a problem, or
 * just [] if nothing needs opening) — the caller applies its own expand
 * state, this hook only triggers it and does the scrolling.
 */
export function useAnchorReveal(reveal: (id: string) => void) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    reveal(id);
    // Expand state renders on the next tick; wait a beat before measuring.
    const t = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ block: "center" });
    }, 80);
    return () => clearTimeout(t);
    // Only on first mount — the hash this page was opened with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
