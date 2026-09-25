"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Star, Eye, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Notification } from "@/lib/notification-types";

const ICONS: Record<Notification["type"], { icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  message: { icon: MessageSquare, tint: "bg-blue-500/15 text-blue-400" },
  endorsement: { icon: Star, tint: "bg-amber-400/15 text-amber-300" },
  view: { icon: Eye, tint: "bg-emerald-500/15 text-emerald-400" },
  referral: { icon: UserPlus, tint: "bg-violet-500/15 text-violet-300" },
};

function ago(iso: string) {
  const mins = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const POLL_MS = 60_000;

/**
 * Header bell: messages, endorsements, profile views and invite sign-ups.
 * Polls once a minute (and when the tab regains focus); opening the panel
 * marks everything as seen.
 */
export function NotificationBell() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { items: Notification[]; unread: number };
      setItems(json.items);
      setUnread(json.unread);
    } catch {
      /* offline: keep what we have */
    }
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch; state is set after the request resolves
    load();
    const id = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [user, loading, load]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      if (!items) await load();
      if (unread > 0) {
        setUnread(0);
        // Keep the highlight visible while the panel is open; it clears next time.
        fetch("/api/notifications", { method: "POST" }).catch(() => {});
      }
    } else {
      setItems((prev) => prev?.map((n) => ({ ...n, unread: false })) ?? prev);
    }
  }

  if (loading || !user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-full p-2 text-[var(--color-c-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-c-text)]"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-c-lime)] px-1 text-[10px] font-bold text-black ring-2 ring-[var(--color-c-dash)]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="cl-fade absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#121510] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <p className="text-[13px] font-bold text-[var(--color-c-text)]">Notifications</p>
            <Link href="/profile" onClick={() => setOpen(false)} className="text-[11px] font-medium text-[var(--color-c-lime)] hover:underline">
              Open profile
            </Link>
          </div>
          <div className="max-h-[26rem] overflow-y-auto">
            {!items ? (
              <p className="flex items-center justify-center gap-2 py-10 text-[12px] text-[var(--color-c-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Bell className="mx-auto h-6 w-6 text-[var(--color-c-dim)]" />
                <p className="mt-2 text-[13px] font-semibold text-[var(--color-c-text)]">You&apos;re all caught up</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                  Messages, endorsements and profile views show up here. Make your profile public and share the link to
                  get some.
                </p>
              </div>
            ) : (
              <ul>
                {items.map((n) => {
                  const { icon: Icon, tint } = ICONS[n.type];
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className={`flex gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                          n.unread ? "bg-[var(--color-c-lime)]/[0.04]" : ""
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tint}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold leading-snug text-[var(--color-c-text)]">{n.title}</span>
                          {n.body && <span className="mt-0.5 block truncate text-[11px] text-[var(--color-c-muted)]">{n.body}</span>}
                          <span className="mt-0.5 block text-[10px] text-[var(--color-c-dim)]">{ago(n.at)}</span>
                        </span>
                        {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-c-lime)]" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
