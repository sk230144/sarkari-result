"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

const LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/resources", label: "Resources" },
  { href: "/ai-copilot", label: "AI Copilot", highlight: true },
];

/** Top-level header links. The page you're on is left out; the other two always show. */
export function HeaderNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const links = LINKS.filter((l) => !(pathname === l.href || pathname.startsWith(`${l.href}/`)));

  return (
    <nav className={`flex items-center gap-5 text-[13px] font-medium text-[var(--color-c-text-dim)] sm:gap-7 sm:text-sm ${className}`}>
      {links.map((l) =>
        l.highlight ? (
          <Link
            key={l.href}
            href={l.href}
            className="flex items-center gap-1.5 text-[var(--color-c-text)] transition-colors hover:text-[var(--color-c-green)]"
          >
            <Sparkles className="h-4 w-4 text-[var(--color-c-green)]" />
            <span>{l.label}</span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-c-green)]" />
          </Link>
        ) : (
          <Link key={l.href} href={l.href} className="transition-colors hover:text-[var(--color-c-text)]">
            {l.label}
          </Link>
        ),
      )}
    </nav>
  );
}
