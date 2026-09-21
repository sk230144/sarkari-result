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
    <footer className="w-full border-t border-[#182016] bg-[#0c0e0b] px-6 py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 md:flex-row">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2b5433] bg-[#182e1b]">
            <Flame className="h-5 w-5 text-[#4ade80]" />
          </div>
          <span className="text-xl font-bold lowercase tracking-tight text-white">
            jobalert24
          </span>
        </div>

        <div className="flex gap-16 text-xs">
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[#9ca3af]">
              {PLATFORM.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white">
              Company
            </h4>
            <ul className="space-y-2.5 text-[#9ca3af]">
              {COMPANY.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="transition-colors hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[#161d14] pt-8 text-xs text-[#6b7280] sm:flex-row">
        <span>© 2026 Job Alert 24. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Theme toggle"
            className="text-[#9ca3af] transition-colors hover:text-white"
          >
            <Moon className="h-4 w-4" />
          </button>
          <a
            href="#linkedin"
            aria-label="LinkedIn"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#182016] text-[#9ca3af] transition-colors hover:bg-[#233020] hover:text-white"
          >
            <span className="text-xs font-bold">in</span>
          </a>
          <a
            href="#x"
            aria-label="X"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#182016] text-[#9ca3af] transition-colors hover:bg-[#233020] hover:text-white"
          >
            <span className="text-xs font-bold">𝕏</span>
          </a>
          <a
            href="#whatsapp"
            aria-label="WhatsApp"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#182016] text-[#9ca3af] transition-colors hover:bg-[#233020] hover:text-white"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
