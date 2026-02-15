"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift } from "lucide-react";

export function PromoBanner() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="bg-slate-800 text-slate-300 overflow-hidden">
      <Link
        href="/membership"
        className="block py-1.5 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="inline-flex items-center gap-3 shrink-0">
              <Gift className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="text-[11px] sm:text-xs font-semibold">
                अगर आप हमारे Premium मेंबर हैं और किसी भी परीक्षा में पास होते
                हैं, तो आपकी आवेदन फीस वापस की जाएगी
              </span>
              <span className="text-[11px] sm:text-xs font-semibold mx-6 text-slate-500">•</span>
              <span className="text-[11px] sm:text-xs font-semibold">
                ₹99/महीने से शुरू — अभी Premium Member बनें
              </span>
              <span className="text-[11px] sm:text-xs font-semibold mx-6 text-slate-500">•</span>
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}
