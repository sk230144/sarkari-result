"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Sparkles, Zap, Timer } from "lucide-react";
import { claimFreeTrial } from "@/lib/actions/users";
import { toast } from "sonner";

const MARQUEE_ITEMS = [
  { icon: "👑", text: "Get 7 Days FREE Premium — No Credit Card Required!" },
  { icon: "⚡", text: "Unlock all Premium features FREE for 7 days — Sign up now!" },
  { icon: "🎁", text: "New User? Claim your FREE 7-day Premium trial today!" },
  { icon: "🚀", text: "100+ Hiring Profiles • AI Resume Analyzer • All FREE for 7 days!" },
];

interface PromoBannerProps {
  isLoggedIn: boolean;
  isPremium: boolean;
  trialClaimed: boolean;
  daysLeft: number | null;
}

export function PromoBanner({ isLoggedIn, isPremium, trialClaimed, daysLeft }: PromoBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // If premium and has days left — show countdown banner
  if (isPremium && daysLeft !== null) {
    return (
      <div className="bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="flex items-center justify-center gap-2 h-8 px-4">
          <Timer className="h-3 w-3 text-yellow-300 shrink-0" />
          <span className="text-[11px] sm:text-xs font-black text-white">
            {daysLeft === 1
              ? "⚡ Your Premium trial expires tomorrow — Upgrade to keep access!"
              : `👑 Premium Active — ${daysLeft} day${daysLeft > 1 ? "s" : ""} remaining`}
          </span>
          {daysLeft <= 3 && (
            <a href="/membership" className="shrink-0 ml-2 bg-white/25 hover:bg-white/35 transition-colors rounded-full px-2.5 py-0.5 text-[10px] font-black text-white">
              Upgrade →
            </a>
          )}
        </div>
      </div>
    );
  }

  // If premium lifetime or admin — show nothing (no banner)
  if (isPremium && daysLeft === null) return null;

  // If already trial claimed and not premium anymore — show upgrade nudge
  if (trialClaimed && !isPremium) {
    return (
      <div className="bg-linear-to-r from-slate-700 via-slate-800 to-slate-700 overflow-hidden">
        <a href="/membership" className="flex items-center justify-center gap-2 h-8 px-4 hover:opacity-90 transition-opacity">
          <Crown className="h-3 w-3 text-yellow-400 shrink-0" />
          <span className="text-[11px] sm:text-xs font-black text-white">
            Your free trial ended — Upgrade to Premium to keep all features unlocked
          </span>
          <span className="shrink-0 ml-2 bg-yellow-400/20 rounded-full px-2.5 py-0.5 text-[10px] font-black text-yellow-300">
            View Plans →
          </span>
        </a>
      </div>
    );
  }

  // Default — show claim free trial banner
  async function handleClick() {
    if (!isLoggedIn) {
      router.push("/auth/signup?trial=1");
      return;
    }
    setLoading(true);
    const result = await claimFreeTrial();
    setLoading(false);
    if (result?.error === "Trial already claimed") {
      toast.info("You already used your free trial!");
    } else if (result?.error === "Already premium") {
      toast.info("You are already a Premium member!");
    } else if (result?.error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success("🎉 7-day FREE Premium activated!");
      router.push("/membership?trial=claimed");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full block group cursor-pointer disabled:opacity-80"
    >
      <div className="bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 overflow-hidden relative hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-colors duration-300">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
        <div className="flex items-center">
          <div className="shrink-0 flex items-center gap-1.5 bg-white/20 px-3 h-8 border-r border-white/20 z-10">
            <Crown className="h-3 w-3 text-yellow-300" />
            <span className="text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">Free Trial</span>
          </div>
          <div className="flex-1 overflow-hidden h-8 flex items-center">
            <div className="animate-marquee flex items-center whitespace-nowrap">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-6">
                  <span className="text-sm leading-none">{item.icon}</span>
                  <span className="text-[11px] sm:text-xs font-black text-white drop-shadow">{item.text}</span>
                  <span className="text-white/30 mx-2">•</span>
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-white/20 px-3 h-8 border-l border-white/20 z-10 group-hover:bg-white/30 transition-colors">
            {loading ? (
              <span className="text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap">Activating...</span>
            ) : (
              <>
                <Sparkles className="h-3 w-3 text-yellow-300" />
                <span className="text-[10px] font-black text-white uppercase tracking-wide whitespace-nowrap hidden sm:block">
                  {isLoggedIn ? "Claim Now →" : "Sign Up Free →"}
                </span>
                <Zap className="h-3 w-3 text-yellow-300 sm:hidden" />
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
