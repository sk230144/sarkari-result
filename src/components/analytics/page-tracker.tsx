"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth/auth-provider";

/** Groups a tab's visits together. Per tab, so two tabs are two sessions. */
function sessionId(): string {
  const KEY = "ja24-session";
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    // Private mode or blocked storage — a per-mount id still groups the
    // visits made during this page's lifetime.
    return crypto.randomUUID();
  }
}

/** First path segment: "/faang-questions/meta" -> "faang-questions". */
function sectionOf(path: string): string {
  const seg = path.split("/").filter(Boolean)[0];
  return seg || "home";
}

/**
 * Records a page view on navigation, then writes how long the page was
 * actually open when the reader leaves.
 *
 * Time is counted only while the tab is visible: a page left open in a
 * background tab is not engagement, and counting it would make the admin
 * numbers meaningless.
 *
 * The duration write uses sendBeacon rather than a normal request. A fetch
 * started during unmount or unload is routinely cancelled before it leaves
 * the browser — which is why every duration was null on the first attempt.
 * sendBeacon exists for exactly this: the browser takes ownership of the
 * request and delivers it even as the page goes away.
 */
export function PageTracker() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const supabase = supabaseBrowser();

  // The row being timed, and the visible-time accounting for it.
  const rowId = useRef<string | null>(null);
  const visibleMs = useRef(0);
  const lastResume = useRef<number | null>(null);
  const flushed = useRef(false);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    rowId.current = null;
    visibleMs.current = 0;
    flushed.current = false;
    lastResume.current =
      document.visibilityState === "visible" ? Date.now() : null;

    async function record() {
      try {
        const { data, error } = await supabase
          .from("page_views")
          .insert({
            user_id: user?.id ?? null,
            session_id: sessionId(),
            path: pathname,
            section: sectionOf(pathname),
          })
          .select("id")
          .single();
        if (!cancelled && !error && data) rowId.current = data.id;
      } catch {
        /* analytics must never break the page */
      }
    }
    record();

    function pause() {
      if (lastResume.current !== null) {
        visibleMs.current += Date.now() - lastResume.current;
        lastResume.current = null;
      }
    }

    function resume() {
      if (lastResume.current === null) lastResume.current = Date.now();
    }

    /**
     * Writes the accumulated visible time. Safe to call more than once —
     * later calls carry a larger total and simply overwrite.
     */
    function flush(useBeacon: boolean) {
      const id = rowId.current;
      if (!id) return;

      // Count time up to this moment without ending the measurement, so a
      // reader who returns to the tab keeps accumulating.
      const pending =
        lastResume.current !== null ? Date.now() - lastResume.current : 0;
      const total = Math.round((visibleMs.current + pending) / 1000);

      // Sub-second views are navigation noise, not reading.
      if (total < 1) return;

      if (useBeacon && typeof navigator.sendBeacon === "function") {
        try {
          // Posts to our own route, which performs the update server-side.
          // sendBeacon cannot set headers or issue PATCH, so it cannot call
          // PostgREST directly.
          const blob = new Blob([JSON.stringify({ id, duration_s: total })], {
            type: "application/json",
          });
          if (navigator.sendBeacon("/api/track", blob)) {
            flushed.current = true;
            return;
          }
        } catch {
          /* fall through to the normal path below */
        }
      }

      // Normal in-page path: an ordinary update, which works fine when the
      // page is not being torn down.
      try {
        void supabase
          .from("page_views")
          .update({ duration_s: total })
          .eq("id", id);
        flushed.current = true;
      } catch {
        /* the view row still exists, just without a duration */
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        resume();
      } else {
        // A reader who switches away may never return, so save what we
        // have. visibilitychange is the one event that fires reliably on
        // mobile, where pagehide often does not.
        pause();
        flush(true);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", () => flush(true));

    return () => {
      cancelled = true;
      pause();
      // In-app navigation: the page is not unloading, so a normal request
      // completes reliably.
      flush(false);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [pathname, user, loading, supabase]);

  return null;
}
