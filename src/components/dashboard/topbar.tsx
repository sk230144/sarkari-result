import { Zap, Bell, Settings, User, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function Topbar({
  collapsed,
  onMenuClick,
}: {
  collapsed: boolean;
  onMenuClick: () => void;
}) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 h-16 border-b border-[var(--color-c-border)] bg-[var(--color-c-dash)]/80 backdrop-blur-xl transition-[left] duration-300 ${
        collapsed ? "lg:left-20" : "lg:left-72"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)] lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1 text-[13px] text-[var(--color-c-muted)]">
            <Zap className="h-[18px] w-[18px] text-[var(--color-c-accent)]" />
            <span className="font-medium">Sprint 24 Daily Challenge</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)]"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="p-2 text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)]"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-c-emerald)]">
            <User className="h-[18px] w-[18px] text-[var(--color-c-on-primary-container)]" />
          </div>
        </div>
      </div>
    </header>
  );
}
