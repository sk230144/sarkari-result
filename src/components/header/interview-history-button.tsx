"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MonitorPlay } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export const INTERVIEW_HISTORY_PATH = "/mock-interview/history";

/** Header shortcut to the mock interview history page, for signed-in users. */
export function InterviewHistoryButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (loading || !user) return null;
  const active = pathname === INTERVIEW_HISTORY_PATH;

  return (
    <Link
      href={INTERVIEW_HISTORY_PATH}
      aria-label="Mock interview history"
      aria-current={active ? "page" : undefined}
      className={`group relative rounded-full p-2 transition-colors hover:bg-white/5 ${
        active ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
      }`}
    >
      <MonitorPlay className="h-5 w-5" />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1d18] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-c-text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Interview history
      </span>
    </Link>
  );
}
