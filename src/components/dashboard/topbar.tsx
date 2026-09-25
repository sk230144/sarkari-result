import { Menu } from "lucide-react";
import { AccountMenu } from "@/components/auth/account-menu";
import { HeaderNav } from "@/components/header/header-nav";
import { NotificationBell } from "@/components/header/notification-bell";

export function Topbar({
  collapsed,
  onMenuClick,
  fullWidth = false,
}: {
  collapsed: boolean;
  onMenuClick: () => void;
  /** No sidebar on this page — span the full width and hide the menu. */
  fullWidth?: boolean;
}) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 h-16 border-b border-[var(--color-c-border)] bg-[var(--color-c-dash)]/80 backdrop-blur-xl transition-[left] duration-300 ${
        fullWidth ? "" : collapsed ? "lg:left-20" : "lg:left-72"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          {!fullWidth && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open menu"
              className="text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <HeaderNav />
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
