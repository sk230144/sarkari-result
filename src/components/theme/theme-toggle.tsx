"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

/**
 * Sun/moon switch. The icon shows the theme you'd get by clicking, which is
 * the convention readers expect from a control labelled "switch to …".
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={theme === "light"}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`relative flex h-8 w-14 shrink-0 items-center rounded-full border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] px-1 transition-colors hover:border-[var(--color-c-border-strong)] ${className}`}
    >
      {/* Sliding knob */}
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-c-lime)] text-black transition-transform duration-200 ${
          theme === "light" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
