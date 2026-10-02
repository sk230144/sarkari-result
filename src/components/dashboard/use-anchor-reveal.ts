"use client";

import { useEffect, useState } from "react";

/**
 * Handles shared question links (…#some-id): when the page opens with a hash,
 * or the hash changes later, `reveal(id)` lets the caller open whatever hides
 * the target (a collapsed section, a filter), then the target is scrolled
 * into view. Returns the id currently linked to, so the caller can highlight it.
 */
export function useAnchorReveal(reveal: (id: string) => void): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      setActive(id || null);
      if (!id) return;
      reveal(id);
      // The opened section renders on the next tick; wait before measuring.
      clearTimeout(timer);
      timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => {
      window.removeEventListener("hashchange", go);
      clearTimeout(timer);
    };
    // `reveal` only touches state setters, so the first one is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return active;
}
