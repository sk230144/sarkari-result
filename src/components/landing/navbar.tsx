import { Flame, Crosshair, Smartphone, Moon, Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1f241d] bg-[#0c0e0b]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2b5433] bg-[#182e1b]">
              <Flame className="h-5 w-5 text-[#4ade80]" />
            </div>
            <span className="text-xl font-bold lowercase tracking-tight text-white">
              jobalert24
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-[#9ca3af] md:flex">
            <a href="#jobs" className="transition-colors hover:text-white">
              Jobs
            </a>
            <a href="/resources" className="transition-colors hover:text-white">
              Resources
            </a>
            <a
              href="#ai-copilot"
              className="flex items-center gap-1.5 text-white transition-colors hover:text-[#4ade80]"
            >
              <Sparkles className="h-4 w-4 text-[#4ade80]" />
              <span>AI Copilot</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#hire"
            className="hidden items-center gap-1.5 rounded-full border border-[#232a20] bg-[#141812] px-4 py-2 text-xs font-semibold text-[#d1d5db] transition-colors hover:bg-[#1a2017] sm:inline-flex"
          >
            <Crosshair className="h-4 w-4 text-[#9ca3af]" />
            <span>Hire with us</span>
          </a>
          <a
            href="#app"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#232a20] bg-[#141812] px-4 py-2 text-xs font-semibold text-[#d1d5db] transition-colors hover:bg-[#1a2017]"
          >
            <Smartphone className="h-4 w-4 text-[#9ca3af]" />
            <span>Download App</span>
          </a>
          <button
            type="button"
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#9ca3af] transition-colors hover:text-white"
          >
            <Moon className="h-5 w-5" />
          </button>
          <div className="ml-1 h-8 w-8 overflow-hidden rounded-full border border-[#2e3b2b] bg-[#182e1b]" />
        </div>
      </div>
    </header>
  );
}
