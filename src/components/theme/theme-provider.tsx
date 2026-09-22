"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "ja24-theme";

type ThemeContext = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };

const Ctx = createContext<ThemeContext | null>(null);

/**
 * Runs before first paint, so a returning reader never sees the wrong theme
 * flash. Kept in sync with the provider below — same key, same attribute.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
document.documentElement.setAttribute("data-theme",t);
}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Server renders dark; the pre-paint script has already set the real value
  // on <html>, and the effect below reconciles React's copy after mount.
  const [theme, setThemeState] = useState<Theme>("dark");

  /* eslint-disable react-hooks/set-state-in-effect -- must read the DOM post-mount */
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") setThemeState(attr);
    // Enables the colour transition only after the initial theme is settled,
    // so the first paint doesn't animate from dark to light.
    document.documentElement.setAttribute("data-theme-ready", "");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* blocked storage — the choice just won't survive a reload */
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(theme === "dark" ? "light" : "dark"),
    [theme, setTheme],
  );

  return (
    <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
