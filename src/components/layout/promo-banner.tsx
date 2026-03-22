"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Trophy, Zap } from "lucide-react";

const MARQUEE_ITEMS = [
  { icon: "🎯", text: "UP Board 10th Result 2025 — Get it 50% faster than any other platform!" },
  { icon: "⚡", text: "UP Board 12th Result 2025 — Check instantly on WhatsApp before others!" },
  { icon: "🏆", text: "Enter Roll Number + DOB → Get UP Board Result on WhatsApp instantly!" },
  { icon: "🚀", text: "UPMSP 10th & 12th Result — Fastest result checker in India!" },
];

export function PromoBanner() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || pathname === "/up-result") return null;

  return (
    <Link href="/up-result" className="block group">
      <div className="bg-linear-to-r from-orange-500 via-amber-500 to-yellow-500 overflow-hidden relative cursor-pointer hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 transition-colors duration-300">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

        <div className="flex items-center">
          {/* Left badge — fixed */}
          <div className="shrink-0 flex items-center gap-1.5 bg-white/25 px-3 h-8 border-r border-white/20 z-10">
            <Trophy className="h-3 w-3 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">UP Result</span>
          </div>

          {/* Scrolling marquee */}
          <div className="flex-1 overflow-hidden h-8 flex items-center">
            <div className="animate-marquee flex items-center whitespace-nowrap">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-6">
                  <span className="text-sm leading-none">{item.icon}</span>
                  <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">
                    {item.text}
                  </span>
                  <span className="text-white/30 mx-2">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Right CTA — fixed */}
          <div className="shrink-0 flex items-center gap-1 bg-white/25 px-3 h-8 border-l border-white/20 z-10 group-hover:bg-white/35 transition-colors">
            <Zap className="h-3 w-3 text-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap hidden sm:block">Check Now →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
