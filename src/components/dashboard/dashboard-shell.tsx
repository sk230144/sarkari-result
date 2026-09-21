"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({
  children,
  canvas = "dash",
}: {
  children: React.ReactNode;
  canvas?: "dash" | "obsidian";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Topbar collapsed={collapsed} onMenuClick={() => setMobileOpen(true)} />
      <div
        className={`transition-[padding] duration-300 ${
          collapsed ? "lg:pl-20" : "lg:pl-72"
        }`}
      >
        <main
          className={`min-h-screen w-full pt-16 text-[#e5e7eb] ${
            canvas === "obsidian" ? "bg-[#121212]" : "bg-[#0b100d]"
          }`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
