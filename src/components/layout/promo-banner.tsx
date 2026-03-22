"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PromoBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || pathname !== "/") return null;

  return (
    <div className="overflow-hidden relative bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600">
      <Link href="/membership" className="block py-1.5 hover:opacity-90 transition-opacity relative">
        <div className="w-full overflow-hidden">
          <div className="animate-marquee">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="inline-flex items-center gap-3 shrink-0 px-8">
                <span className="text-base">🎁</span>
                <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
                  दोस्तों को Refer करें — Free Premium पाएं!
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                  <span className="text-[11px] sm:text-xs font-black text-yellow-200">2 friends = 3 days free</span>
                </span>
                <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
                  5 friends = 10 days • 10 friends = 18 days ✨
                </span>
                <span className="text-white/40 mx-4">•</span>
              </span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
