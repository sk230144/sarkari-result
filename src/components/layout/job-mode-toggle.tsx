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
    <>
      <style>{`
        @keyframes border-spin {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .toggle-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 9999px;
          padding: 2px;
          flex-shrink: 0;
        }
        .toggle-wrapper::before {
          content: '';
          position: absolute;
          inset: -1.5px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #f97316, #eab308, #10b981, #06b6d4, #f97316);
          background-size: 300% 300%;
          animation: border-spin 3s linear infinite;
          z-index: 0;
        }
        .toggle-wrapper::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 9999px;
          background: #f1f5f9;
          z-index: 1;
        }
        .toggle-btn {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 900;
          transition: all 0.25s ease;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .toggle-btn:hover {
          color: #64748b;
        }
        .toggle-btn-govt-active {
          background: white;
          color: #2563eb !important;
          box-shadow: 0 1px 4px rgba(59,130,246,0.15);
        }
        .toggle-btn-corp-active {
          background: white;
          color: #7c3aed !important;
          box-shadow: 0 1px 4px rgba(139,92,246,0.15);
        }
        @media (min-width: 640px) {
          .toggle-btn { padding: 6px 14px; }
        }
      `}</style>
      <div className="toggle-wrapper">
        <button
          onClick={() => switchTo("govt")}
          className={`toggle-btn ${!isCorporate ? "toggle-btn-govt-active" : ""}`}
        >
          <Landmark style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span className="hidden sm:inline">Govt</span>
        </button>
        <button
          onClick={() => switchTo("corporate")}
          className={`toggle-btn ${isCorporate ? "toggle-btn-corp-active" : ""}`}
        >
          <Building2 style={{ width: 14, height: 14, flexShrink: 0 }} />
          <span className="hidden sm:inline">Corporate</span>
        </button>
      </div>
    </>
  );
}
