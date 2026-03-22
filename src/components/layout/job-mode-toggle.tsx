"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Landmark } from "lucide-react";

const LS_KEY = "job_mode";

export function JobModeToggle() {
  const pathname = usePathname();
  const router = useRouter();
  const isCorporate = pathname.startsWith("/corporate-jobs");
  const [mounted, setMounted] = useState(false);

  // On first mount: if no preference saved, save current. If preference saved and not on right page, redirect.
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) {
      // Save whatever mode we're currently on
      localStorage.setItem(LS_KEY, isCorporate ? "corporate" : "govt");
    } else if (saved === "corporate" && !isCorporate && pathname === "/") {
      // Only auto-redirect from homepage, not from job detail pages etc.
      router.replace("/corporate-jobs");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function switchTo(mode: "govt" | "corporate") {
    localStorage.setItem(LS_KEY, mode);
    if (mode === "corporate") {
      router.push("/corporate-jobs");
    } else {
      router.push("/");
    }
  }

  if (!mounted) {
    return <div className="h-8 w-16 sm:w-42 rounded-full bg-slate-100 shrink-0" />;
  }

  return (
    <div className="flex items-center bg-slate-100 rounded-full p-0.5 shrink-0 border border-slate-200">
      <button
        onClick={() => switchTo("govt")}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 ${
          !isCorporate
            ? "bg-white text-blue-700 shadow-sm shadow-slate-200"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <Landmark className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Govt</span>
      </button>
      <button
        onClick={() => switchTo("corporate")}
        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 ${
          isCorporate
            ? "bg-white text-violet-700 shadow-sm shadow-slate-200"
            : "text-slate-400 hover:text-slate-600"
        }`}
      >
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">Corporate</span>
      </button>
    </div>
  );
}
