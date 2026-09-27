"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Wand2, Crown, Laptop } from "lucide-react";
import { APP_ADDON_PER_MONTH, QUARTERLY_SAVING, QUOTAS, inr, orderTotal, perMonthPrice } from "@/lib/premium";
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
  const [withApp, setWithApp] = useState(false);
  const planKey = isQuarterly ? "quarterly" : "monthly";
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
                        key={`${planKey}-${withApp}`}
                        className="inline-block"
                        initial={reduce ? false : { rotateX: -90, opacity: 0 }}
                        animate={{ rotateX: 0, opacity: 1 }}
                        exit={reduce ? undefined : { rotateX: 90, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {inr(perMonthPrice(planKey, withApp))}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-xs text-[var(--color-c-text-muted-2)]">
                    {isQuarterly ? `/ month (${inr(orderTotal("quarterly", withApp))} billed quarterly)` : "/ month"}
                  </span>
                </div>
                <label
                  className={`mb-5 mt-4 flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-xs transition-colors ${
                    withApp ? "border-[var(--color-c-green)]/60 bg-[var(--color-c-green)]/10" : "border-dashed border-[var(--color-c-forest-27)] hover:border-[var(--color-c-green)]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={withApp}
                    onChange={(e) => setWithApp(e.target.checked)}
                    className="h-4 w-4 shrink-0 accent-[var(--color-c-green)]"
                  />
                  <Laptop className="h-4 w-4 shrink-0 text-[var(--color-c-green)]" />
                  <span className="flex-1 font-semibold text-[var(--color-c-text)]">Include AI Interview Assistant app</span>
                  <span className="font-bold text-[var(--color-c-green)]">+{inr(APP_ADDON_PER_MONTH)}/mo</span>
                </label>
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
                href={`/pricing?plan=${planKey}${withApp ? "&app=1" : ""}`}
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
