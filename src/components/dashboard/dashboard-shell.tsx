"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BackButton } from "./back-button";

export function DashboardShell({
  children,
  canvas = "dash",
  sidebar = true,
  backTo = "/",
  fixedChrome = false,
}: {
  children: React.ReactNode;
  canvas?: "dash" | "obsidian";
  /** Set false for pages reached from the landing page rather than the rail. */
  sidebar?: boolean;
  /** Where Back goes on a cold load, when there is no history to pop. */
  backTo?: string;
  /**
   * Hand the page a fixed-height viewport instead of a scrolling document,
   * so it can pin its own header and footer and scroll only the middle.
   * The page then owns all vertical spacing.
   */
  fixedChrome?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {sidebar && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      )}
      <Topbar
        collapsed={collapsed}
        onMenuClick={() => setMobileOpen(true)}
        // Without a sidebar there is no rail to offset against, and no
        // hamburger to show.
        fullWidth={!sidebar}
      />
      <div
        className={
          sidebar
            ? `transition-[padding] duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`
            : ""
        }
      >
        <main
          className={`w-full pt-16 text-[var(--color-c-text-2)] ${
            canvas === "obsidian"
              ? "bg-[var(--color-c-obsidian)]"
              : "bg-[var(--color-c-dash)]"
          } ${
            // h-screen + overflow-hidden stops the document scrolling, which
            // is what lets the page pin its own header and footer.
            fixedChrome ? "h-screen overflow-hidden" : "min-h-screen"
          }`}
        >
          {fixedChrome ? (
            children
          ) : (
            <>
              {/* Sits above the page's own header so every page has a way back. */}
              <div className="mx-auto w-full max-w-7xl px-6 pt-5 lg:px-8">
                <BackButton fallback={backTo} />
              </div>
              {children}
            </>
          )}
        </main>
      </div>
    </>
  );
}
