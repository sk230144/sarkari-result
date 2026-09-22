import { Flame, Moon, Phone } from "lucide-react";

const PLATFORM = [
  ["Find Jobs", "#jobs"],
  ["Resources", "/resources"],
  ["AI Copilot", "#copilot"],
  ["Contact", "#contact"],
];

const COMPANY = [
  ["Privacy Policy", "#privacy"],
  ["Terms of Service", "#terms"],
  ["About Us", "#about"],
  ["Hire with us", "#hire"],
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[var(--color-c-raised)] bg-[var(--color-c-canvas-deep)] px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-c-forest-22)] bg-[var(--color-c-raised-2)]">
            <Flame className="h-5 w-5 text-[var(--color-c-green)]" />
          </div>
          <span className="text-xl font-bold lowercase tracking-tight text-[var(--color-c-text)]">
            jobalert24
          </span>
        </div>

        <div className="flex gap-16 text-xs">
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-c-text)]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[var(--color-c-text-dim)]">
              {PLATFORM.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-[var(--color-c-text)]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[var(--color-c-text)]">
              Company
            </h4>
            <ul className="space-y-2.5 text-[var(--color-c-text-dim)]">
              {COMPANY.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-[var(--color-c-text)]">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[var(--color-c-surface-7c)] pt-8 text-xs text-[var(--color-c-dim)] sm:flex-row">
        <span>© 2026 Job Alert 24. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Theme toggle"
            className="text-[var(--color-c-text-dim)] transition-colors hover:text-[var(--color-c-text)]"
          >
            <Moon className="h-4 w-4" />
          </button>
          <a
            href="#linkedin"
            aria-label="LinkedIn"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-c-raised)] text-[var(--color-c-text-dim)] transition-colors hover:bg-[var(--color-c-forest-6)] hover:text-[var(--color-c-text)]"
          >
            <span className="text-xs font-bold">in</span>
          </a>
          <a
            href="#x"
            aria-label="X"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-c-raised)] text-[var(--color-c-text-dim)] transition-colors hover:bg-[var(--color-c-forest-6)] hover:text-[var(--color-c-text)]"
          >
            <span className="text-xs font-bold">𝕏</span>
          </a>
          <a
            href="#whatsapp"
            aria-label="WhatsApp"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-c-raised)] text-[var(--color-c-text-dim)] transition-colors hover:bg-[var(--color-c-forest-6)] hover:text-[var(--color-c-text)]"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
