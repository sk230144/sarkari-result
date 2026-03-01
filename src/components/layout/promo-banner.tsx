"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function PromoBanner() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div
      className="overflow-hidden relative"
      style={{
        background: "linear-gradient(90deg, #e11d48 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #a855f7 100%)",
      }}
    >
      {/* Holi color blobs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-[10%] w-8 h-8 rounded-full bg-yellow-300 blur-sm" />
        <div className="absolute top-0 left-[30%] w-6 h-6 rounded-full bg-pink-300 blur-sm" />
        <div className="absolute top-0 left-[55%] w-10 h-10 rounded-full bg-green-300 blur-sm" />
        <div className="absolute top-0 left-[75%] w-7 h-7 rounded-full bg-purple-300 blur-sm" />
      </div>

      <Link href="/membership" className="block py-1.5 hover:opacity-90 transition-opacity relative">
        <div className="w-full overflow-hidden">
          <div className="animate-marquee">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="inline-flex items-center gap-3 shrink-0 px-8">
              <span className="text-lg">🎨</span>
              <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
                🎉 Happy Holi 2026 — सिर्फ आज! Premium पर 50% OFF
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <span className="text-[11px] sm:text-xs font-black text-white line-through opacity-70">₹99</span>
                <span className="text-[11px] sm:text-xs font-black text-yellow-200">₹49</span>
              </span>
              <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
                परीक्षा पास करो — आवेदन फीस वापस पाओ 🌈
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
