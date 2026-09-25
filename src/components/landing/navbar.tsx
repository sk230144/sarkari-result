import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { AccountMenu } from "@/components/auth/account-menu";
import { HeaderNav } from "@/components/header/header-nav";
import { NotificationBell } from "@/components/header/notification-bell";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-c-surface-15)] bg-[var(--color-c-canvas-deep)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-5 sm:gap-10">
          <Link href="/" aria-label="jobalert24 home" className="shrink-0">
            {/* Phones get the mark alone so the links fit on the same row. */}
            <Logo markClassName="h-9 w-9" className="hidden sm:inline-flex" />
            <Logo markClassName="h-9 w-9" showWordmark={false} className="sm:hidden" />
          </Link>
          <HeaderNav />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <NotificationBell />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
