"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

/**
 * Back control shown on every dashboard page.
 *
 * Prefers real history so the reader returns wherever they actually came
 * from. On a cold load — a shared link, a new tab — there is no history to
 * pop, so it renders as a plain link to `fallback` instead of a button that
 * would do nothing.
 */
export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- history is DOM-only */
  useEffect(() => {
    // history.length > 1 means this tab has somewhere to go back to.
    setCanGoBack(window.history.length > 1);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const className =
    "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]";

  if (!canGoBack) {
    return (
      <Link href={fallback} className={className}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>
    );
  }

  return (
    <button type="button" onClick={() => router.back()} className={className}>
      <ArrowLeft className="h-3.5 w-3.5" />
      Back
    </button>
  );
}
