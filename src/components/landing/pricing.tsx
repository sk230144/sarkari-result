"use client";

import { useState } from "react";
import { Wand2, Crown } from "lucide-react";

const FEATURES = [
  { icon: "◎", color: "text-red-400", label: "Fresh job alerts" },
  { icon: "⚡", color: "text-amber-400", label: "AI Apply Extension" },
  { icon: "📊", color: "text-blue-400", label: "Resume match score" },
  { icon: "✉", color: "text-yellow-400", label: "AI cover letters" },
  { icon: "🎙", color: "text-purple-400", label: "Mock interviews" },
  { icon: "🌐", color: "text-teal-400", label: "Developer portfolio" },
];

const FREE_VALUES = [
  "Limited",
  "Limited",
  "Limited",
  "Limited",
  "Limited",
  "Basic",
];

const PRO_VALUES = [
  "25x more jobs",
  "One-click autofill",
  "Unlimited",
  "Unlimited",
  "Unlimited",
  "Fully customisable",
];

export function Pricing() {
  const [isQuarterly, setIsQuarterly] = useState(false);

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Turn applications into{" "}
          <span className="rounded-full border border-[#3b7e43] bg-[#183a1d] px-4 py-1 text-[#4ade80]">
            interviews
          </span>
        </h2>
        <p className="text-sm leading-relaxed text-[#9ca3af] sm:text-base">
          No more guessing which jobs fit, or sending resumes into silence.
          Every feature here exists to get you seen.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#283223] bg-[#151913] px-4 py-2">
          <span
            className={`text-xs font-semibold transition-colors ${
              isQuarterly ? "text-[#9ca3af]" : "text-[#4ade80]"
            }`}
          >
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isQuarterly}
            aria-label="Toggle billing interval"
            onClick={() => setIsQuarterly((v) => !v)}
            className="relative h-5 w-10 rounded-full bg-[#4ade80] p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              className={`block h-4 w-4 rounded-full bg-black transition-transform ${
                isQuarterly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-semibold transition-colors ${
              isQuarterly ? "text-[#4ade80]" : "text-[#9ca3af]"
            }`}
          >
            Quarterly
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        {/* Starter */}
        <div className="flex flex-col justify-between rounded-[28px] border border-[#232a1e] bg-[#131611] p-8 shadow-xl">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-[#9ca3af]" />
              <h3 className="text-2xl font-bold text-white">Starter</h3>
            </div>
            <div className="mb-2 text-4xl font-extrabold text-white">Free</div>
            <p className="mb-8 text-xs text-[#9ca3af]">
              Every tool included, with a few free uses each month. No card
              required.
            </p>
            <ul className="space-y-4 pb-8 text-xs">
              {FEATURES.map((f, i) => (
                <li key={f.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[#d1d5db]">
                    <span className={f.color}>{f.icon}</span> {f.label}
                  </span>
                  <span className="text-[#9ca3af]">{FREE_VALUES[i]}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[#1e251b] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#283223]"
          >
            Continue Free
          </button>
        </div>

        {/* PRO+ */}
        <div className="relative flex flex-col justify-between rounded-[28px] border border-[#306037] bg-[#142f1b] p-8 shadow-2xl">
          <div className="absolute -top-3 right-8">
            <span className="rounded-full bg-[#8cf058] px-3 py-1 text-[10px] font-extrabold uppercase text-black shadow">
              Most popular
            </span>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#4ade80]" />
              <h3 className="text-2xl font-bold text-white">PRO+</h3>
            </div>
            <div className="mb-2 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#4ade80]">
                {isQuarterly ? "$2.49" : "$3.29"}
              </span>
              <span className="text-xs text-[#a3b8a6]">
                {isQuarterly ? "/ month (billed quarterly)" : "/ month"}
              </span>
            </div>
            <p className="mb-8 text-xs text-[#a3b8a6]">
              The full AI toolkit, unlimited, so a monthly cap never stops you
              mid-search.
            </p>
            <ul className="space-y-4 pb-8 text-xs">
              {FEATURES.map((f, i) => (
                <li key={f.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-white">
                    <span className={f.color}>{f.icon}</span> {f.label}
                  </span>
                  <span className="font-semibold text-[#4ade80]">
                    {PRO_VALUES[i]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            className="w-full rounded-xl bg-[#4ade80] px-4 py-3.5 text-xs font-bold text-black shadow-lg transition-all hover:bg-[#38c86d]"
          >
            Upgrade to PRO+
          </button>
        </div>
      </div>
    </section>
  );
}
