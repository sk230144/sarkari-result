import { Zap, Bell, Settings, User, Menu } from "lucide-react";

export function Topbar({
  collapsed,
  onMenuClick,
}: {
  collapsed: boolean;
  onMenuClick: () => void;
}) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-40 h-16 border-b border-[#1e2920] bg-[#0b100d]/80 backdrop-blur-xl transition-[left] duration-300 ${
        collapsed ? "lg:left-20" : "lg:left-72"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="text-[#8c9c90] transition-colors hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1 text-[13px] text-[#8c9c90]">
            <Zap className="h-[18px] w-[18px] text-[#22c55e]" />
            <span className="font-medium">Sprint 24 Daily Challenge</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="p-2 text-[#8c9c90] transition-colors hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Settings"
            className="p-2 text-[#8c9c90] transition-colors hover:text-white"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10b981]">
            <User className="h-[18px] w-[18px] text-[#00422b]" />
          </div>
        </div>
      </div>
    </header>
  );
}
