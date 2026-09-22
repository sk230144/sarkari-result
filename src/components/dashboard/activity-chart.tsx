"use client";

import { useMemo, useState } from "react";

const PERIODS = ["7D", "30D", "3M", "6M"] as const;
type Period = (typeof PERIODS)[number];

/** Placeholder series per range — swap for real activity counts later. */
const SERIES: Record<Period, number[]> = {
  "7D": [0, 0, 1, 0, 2, 0, 4],
  "30D": [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2,
    0, 1, 2, 3, 4,
  ],
  "3M": [0, 0, 0, 0, 0, 1, 0, 0, 2, 1, 3, 4],
  "6M": [0, 0, 0, 0, 1, 0, 2, 1, 0, 3, 2, 4],
};

const W = 700;
const H = 160;
const TOP = 18;
const BASE = 145;

function buildPath(values: number[]) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  return values
    .map((v, i) => {
      const x = Math.round(i * step);
      const y = Math.round(BASE - (v / max) * (BASE - TOP));
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function ActivityChart() {
  const [period, setPeriod] = useState<Period>("30D");

  const { line, area, total, peak, avg, lastY } = useMemo(() => {
    const values = SERIES[period];
    const line = buildPath(values);
    const total = values.reduce((a, b) => a + b, 0);
    const peak = Math.max(...values);
    const max = Math.max(peak, 1);
    const lastY = Math.round(
      BASE - (values[values.length - 1] / max) * (BASE - TOP),
    );
    return {
      line,
      area: `${line} L ${W} ${H} L 0 ${H} Z`,
      total,
      peak,
      avg: Math.round((total / values.length) * 10) / 10,
      lastY,
    };
  }, [period]);

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-8">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-muted)]">
            Activity
          </span>
          <div className="mt-1 text-[24px] font-bold leading-8 text-[var(--color-c-text)]">
            {total}
          </div>
          <div className="text-xs text-[var(--color-c-muted)]">
            total activity in this period
          </div>
        </div>

        <div
          role="group"
          aria-label="Select time range"
          className="flex items-center gap-1 rounded-full border border-[var(--color-c-border)] bg-[var(--color-c-surface-0)] p-1"
        >
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={p === period}
              className={
                p === period
                  ? "rounded-full bg-[var(--color-c-accent)] px-3 py-1 text-xs font-semibold text-[var(--color-c-green-dim)] shadow-sm"
                  : "rounded-full px-3 py-1 text-xs font-semibold text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-text)]"
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative my-4 flex h-44 w-full items-end">
        <svg
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Activity over ${period}: ${total} total, peak ${peak}`}
        >
          <defs>
            <linearGradient id="neonGreenGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
            <pattern
              id="gridDots"
              height="20"
              width="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#1c2b1e" />
            </pattern>
          </defs>

          <rect width="100%" height="100%" fill="url(#gridDots)" opacity="0.6" />

          <path d={area} fill="url(#neonGreenGradient)" />
          <path
            d={line}
            fill="none"
            stroke="#22c55e"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <circle
            className="animate-pulse"
            cx={W}
            cy={lastY}
            r="5"
            fill="#22c55e"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-c-surface-11)] pt-2 text-xs text-[var(--color-c-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--color-c-accent)]" />
          <span>
            <strong className="text-[var(--color-c-text)]">
              {SERIES[period][SERIES[period].length - 1]}
            </strong>{" "}
            today
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-[var(--color-c-text)]">{peak}</strong> peak
          </span>
          <span className="text-[var(--color-c-on-surface-variant)]">|</span>
          <span>
            <strong className="text-[var(--color-c-text)]">{Math.min(...SERIES[period])}</strong>{" "}
            low
          </span>
          <span className="text-[var(--color-c-on-surface-variant)]">|</span>
          <span>
            <strong className="text-[var(--color-c-text)]">{avg}</strong> avg
          </span>
        </div>
      </div>
    </div>
  );
}
