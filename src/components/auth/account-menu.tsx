"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, FileText, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";

/**
 * Profile control in the header.
 *
 * Signed out it is a link to /login; signed in it opens a small menu. The
 * signed-out state deliberately looks like an avatar rather than a "Sign in"
 * button, because that is where people look for an account.
 */
export function AccountMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape — a menu that traps you is worse
  // than no menu.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) {
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-c-border)]">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--color-c-dim)]" />
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname)}`}
        aria-label="Sign in"
        title="Sign in"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] text-[var(--color-c-muted)] transition-colors hover:border-[var(--color-c-lime)] hover:text-[var(--color-c-lime)]"
      >
        <User className="h-4 w-4" />
      </Link>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Account";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-c-lime)] text-[13px] font-bold text-black transition-transform hover:scale-105"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] shadow-xl"
        >
          <div className="border-b border-[var(--color-c-border)] px-3 py-2.5">
            <p className="truncate text-[13px] font-bold text-[var(--color-c-text)]">
              {name}
            </p>
            <p className="truncate text-[11px] text-[var(--color-c-dim)]">
              {user.email}
            </p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3 py-2.5 text-[12px] text-[var(--color-c-text-4)] transition-colors hover:bg-[var(--color-c-surface-2)] hover:text-[var(--color-c-text)]"
          >
            <FileText className="h-3.5 w-3.5" />
            Profile &amp; resume
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.refresh();
            }}
            className="flex w-full items-center gap-2.5 border-t border-[var(--color-c-border)] px-3 py-2.5 text-left text-[12px] text-[var(--color-c-text-4)] transition-colors hover:bg-[var(--color-c-surface-2)] hover:text-[var(--color-c-red)]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
