import { Crosshair, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-c-surface-15)] bg-[var(--color-c-canvas-deep)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="jobalert24 home">
            <Logo markClassName="h-9 w-9" />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--color-c-text-dim)] md:flex">
            <a href="/jobs" className="transition-colors hover:text-[var(--color-c-text)]">
              Jobs
            </a>
            <a href="/resources" className="transition-colors hover:text-[var(--color-c-text)]">
              Resources
            </a>
            <a
              href="#ai-copilot"
              className="flex items-center gap-1.5 text-[var(--color-c-text)] transition-colors hover:text-[var(--color-c-green)]"
            >
              <Sparkles className="h-4 w-4 text-[var(--color-c-green)]" />
              <span>AI Copilot</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-c-green)]" />
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#hire"
            className="hidden items-center gap-1.5 rounded-full border border-[var(--color-c-forest-9)] bg-[var(--color-c-surface-5)] px-4 py-2 text-xs font-semibold text-[var(--color-c-text-4)] transition-colors hover:bg-[var(--color-c-surface-10b)] sm:inline-flex"
          >
            <Crosshair className="h-4 w-4 text-[var(--color-c-text-dim)]" />
            <span>Hire with us</span>
          </a>
          <a
            href="#app"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-forest-9)] bg-[var(--color-c-surface-5)] px-4 py-2 text-xs font-semibold text-[var(--color-c-text-4)] transition-colors hover:bg-[var(--color-c-surface-10b)]"
          >
            <Smartphone className="h-4 w-4 text-[var(--color-c-text-dim)]" />
            <span>Download App</span>
          </a>
          <ThemeToggle />
          <div className="ml-1 h-8 w-8 overflow-hidden rounded-full border border-[var(--color-c-forest-25)] bg-[var(--color-c-raised-2)]" />
        </div>
      </div>
    </header>
  );
}
