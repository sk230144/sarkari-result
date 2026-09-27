"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Wand2, Crown } from "lucide-react";
import { PLANS, QUARTERLY_SAVING, QUOTAS, inr } from "@/lib/premium";
import { Reveal3D, Tilt } from "./motion-kit";

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
  `${QUOTAS.free.analysis} / month`,
  `${QUOTAS.free.letter} / month`,
  `${QUOTAS.free.interview} / month`,
  "Basic",
];

const PRO_VALUES = [
  "25x more jobs",
  "One-click autofill",
  `${QUOTAS.pro.analysis} / month`,
  `${QUOTAS.pro.letter} / month`,
  `${QUOTAS.pro.interview} / month`,
  "Fully customisable",
];

export function Pricing() {
  const [isQuarterly, setIsQuarterly] = useState(false);
  const reduce = useReducedMotion();

  return (
    <section id="pricing" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-[var(--color-c-text)] sm:text-5xl">
          Turn applications into{" "}
          <span className="rounded-full border border-[var(--color-c-green-4)] bg-[var(--color-c-raised-3)] px-4 py-1 text-[var(--color-c-green)]">
            interviews
          </span>
        </h2>
        <p className="text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">
          No more guessing which jobs fit, or sending resumes into silence.
          Every feature here exists to get you seen.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--color-c-forest-18)] bg-[var(--color-c-surface-6)] px-4 py-2">
          <span
            className={`text-xs font-semibold transition-colors ${
              isQuarterly ? "text-[var(--color-c-text-dim)]" : "text-[var(--color-c-green)]"
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
            className="relative h-5 w-10 rounded-full bg-[var(--color-c-green)] p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span
              className={`block h-4 w-4 rounded-full bg-black transition-transform ${
                isQuarterly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-semibold transition-colors ${
              isQuarterly ? "text-[var(--color-c-green)]" : "text-[var(--color-c-text-dim)]"
            }`}
          >
            Quarterly{QUARTERLY_SAVING > 0 ? ` · save ${QUARTERLY_SAVING}%` : ""}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2">
        {/* Starter */}
        <Reveal3D from="left" className="h-full">
          <div className="flex h-full flex-col justify-between rounded-[28px] border border-[var(--color-c-forest-8)] bg-[var(--color-c-surface-4)] p-8 shadow-xl">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-[var(--color-c-text-dim)]" />
                <h3 className="text-2xl font-bold text-[var(--color-c-text)]">Starter</h3>
              </div>
              <div className="mb-2 text-4xl font-extrabold text-[var(--color-c-text)]">Free</div>
              <p className="mb-8 text-xs text-[var(--color-c-text-dim)]">
                Every tool included, with a few free uses each month. No card
                required.
              </p>
              <ul className="space-y-4 pb-8 text-xs">
                {FEATURES.map((f, i) => (
                  <li key={f.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[var(--color-c-text-4)]">
                      <span className={f.color}>{f.icon}</span> {f.label}
                    </span>
                    <span className="text-[var(--color-c-text-dim)]">{FREE_VALUES[i]}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/resources"
              className="block w-full rounded-xl bg-[var(--color-c-surface-14)] px-4 py-3 text-center text-xs font-bold text-[var(--color-c-text)] transition-colors hover:bg-[var(--color-c-forest-18)]"
            >
              Continue Free
            </Link>
          </div>
        </Reveal3D>

        {/* PRO+ */}
        <Reveal3D from="right" className="h-full" delay={0.1}>
          <Tilt className="h-full rounded-[28px]" max={6}>
            <div className="relative flex h-full flex-col justify-between rounded-[28px] border border-[var(--color-c-forest-27)] bg-[var(--color-c-green-dim-8)] p-8 shadow-2xl">
              <div className="absolute -top-3 right-8">
                <span className="rounded-full bg-[var(--color-c-lime-2)] px-3 py-1 text-[10px] font-extrabold uppercase text-black shadow">
                  Most popular
                </span>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[var(--color-c-green)]" />
                  <h3 className="text-2xl font-bold text-[var(--color-c-text)]">PRO+</h3>
                </div>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="inline-block text-4xl font-extrabold text-[var(--color-c-green)]" style={{ perspective: 400 }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isQuarterly ? "q" : "m"}
                        className="inline-block"
                        initial={reduce ? false : { rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        exit={reduce ? undefined : { rotateX: 90, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {inr(isQuarterly ? PLANS.quarterly.perMonth : PLANS.monthly.perMonth)}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-xs text-[var(--color-c-text-muted-2)]">
                    {isQuarterly ? `/ month (${inr(PLANS.quarterly.total)} billed quarterly)` : "/ month"}
                  </span>
                </div>
                <p className="mb-8 text-xs text-[var(--color-c-text-muted-2)]">
                  10x the AI toolkit every month, so a free-plan cap never stops
                  you mid-search.
                </p>
                <ul className="space-y-4 pb-8 text-xs">
                  {FEATURES.map((f, i) => (
                    <li key={f.label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[var(--color-c-text)]">
                        <span className={f.color}>{f.icon}</span> {f.label}
                      </span>
                      <span className="font-semibold text-[var(--color-c-green)]">
                        {PRO_VALUES[i]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={`/pricing?plan=${isQuarterly ? "quarterly" : "monthly"}`}
                className="block w-full rounded-xl bg-[var(--color-c-green)] px-4 py-3.5 text-center text-xs font-bold text-black shadow-lg transition-all hover:bg-[var(--color-c-green-2)]"
              >
                Upgrade to PRO+
              </Link>
            </div>
          </Tilt>
        </Reveal3D>
      </div>
    </section>
  );
}
