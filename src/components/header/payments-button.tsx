"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

/** Header shortcut to payments & invoices, for signed-in users. */
export function PaymentsButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  if (loading || !user) return null;
  const active = pathname.startsWith("/payments");

  return (
    <Link
      href="/payments"
      aria-label="Payments and invoices"
      aria-current={active ? "page" : undefined}
      className={`group relative rounded-full p-2 transition-colors hover:bg-white/5 ${
        active ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
      }`}
    >
      <Receipt className="h-5 w-5" />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1a1d18] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-c-text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        Payments &amp; invoices
      </span>
    </Link>
  );
}
