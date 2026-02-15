"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift } from "lucide-react";

export function PromoBanner() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white overflow-hidden">
      <Link
        href="/membership"
        className="block py-2 hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
          {[0, 1].map((i) => (
            <span key={i} className="inline-flex items-center gap-3 shrink-0">
              <Gift className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                🎉 अगर आप हमारे प्लेटफ़ॉर्म के मेंबर हैं और किसी भी परीक्षा में
                पास होते हैं, तो आपकी आवेदन फीस वापस की जाएगी! 🎉
              </span>
              <span className="text-xs sm:text-sm font-bold mx-8">•</span>
              <span className="text-xs sm:text-sm font-bold">
                ₹99/महीने से शुरू — अभी Premium Member बनें!
              </span>
              <span className="text-xs sm:text-sm font-bold mx-8">•</span>
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
}
