"use client";

import { useMemo, useState } from "react";
import { ymd } from "@/lib/progress/days";

const PERIODS = ["7D", "30D", "3M", "6M"] as const;
type Period = (typeof PERIODS)[number];

/** Daily points for short ranges, weekly for long ones so the line stays readable. */
const SHAPE: Record<Period, { points: number; step: 1 | 7; label: string }> = {
  "7D": { points: 7, step: 1, label: "day" },
  "30D": { points: 30, step: 1, label: "day" },
  "3M": { points: 13, step: 7, label: "week" },
  "6M": { points: 26, step: 7, label: "week" },
};

const W = 700;
const H = 160;
const TOP = 18;
const BASE = 145;

function buildPath(values: number[]) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${Math.round(i * step)} ${Math.round(BASE - (v / max) * (BASE - TOP))}`)
    .join(" ");
}

/** Buckets ending today: each bucket is `step` days, oldest first. */
function series(byDay: Map<string, number>, period: Period) {
  const { points, step } = SHAPE[period];
  const values: number[] = [];
  const starts: Date[] = [];
  const today = new Date();
  for (let b = points - 1; b >= 0; b--) {
    let sum = 0;
    let start = today;
    for (let d = 0; d < step; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() - (b * step + d));
      sum += byDay.get(ymd(day)) ?? 0;
      start = day;
    }
    values.push(sum);
    starts.push(start);
  }
  return { values, starts };
}

const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function ActivityChart({ byDay }: { byDay: Map<string, number> }) {
  const [period, setPeriod] = useState<Period>("30D");
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(() => {
    const { values, starts } = series(byDay, period);
    const line = buildPath(values);
    const total = values.reduce((a, b) => a + b, 0);
    const peak = Math.max(...values);
    const max = Math.max(peak, 1);
    const yOf = (v: number) => Math.round(BASE - (v / max) * (BASE - TOP));
    return {
      values,
      starts,
      line,
      area: `${line} L ${W} ${H} L 0 ${H} Z`,
      total,
      peak,
      low: Math.min(...values),
      avg: Math.round((total / values.length) * 10) / 10,
      yOf,
    };
  }, [byDay, period]);

  const step = data.values.length > 1 ? W / (data.values.length - 1) : W;
  const last = data.values.length - 1;
  const focus = hover ?? last;
  const unit = SHAPE[period].label;
  const today = byDay.get(ymd(new Date())) ?? 0;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-muted)]">Activity</span>
          <div className="mt-1 text-[24px] font-bold leading-8 text-[var(--color-c-text)]">{data.total}</div>
          <div className="text-xs text-[var(--color-c-muted)]">
            problems, tasks, letters &amp; analyses in this period
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
              onClick={() => {
                setPeriod(p);
                setHover(null);
              }}
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
        <span className="pointer-events-none absolute right-0 top-0 rounded-md bg-[var(--color-c-surface-0)] px-2 py-1 text-[11px] text-[var(--color-c-muted)]">
          {SHAPE[period].step === 1 ? fmt(data.starts[focus]) : `Week of ${fmt(data.starts[focus])}`}:{" "}
          <strong className="text-[var(--color-c-text)]">{data.values[focus]}</strong>
        </span>
        <svg
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Activity over ${period}: ${data.total} total, peak ${data.peak}`}
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.round(((e.clientX - r.left) / r.width) * last);
            setHover(Math.min(last, Math.max(0, i)));
          }}
        >
          <defs>
            <linearGradient id="neonGreenGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
            <pattern id="gridDots" height="20" width="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#1c2b1e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridDots)" opacity="0.6" />
          <path d={data.area} fill="url(#neonGreenGradient)" />
          <path d={data.line} fill="none" stroke="#22c55e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.2" />
          {hover !== null && (
            <line x1={hover * step} x2={hover * step} y1={TOP - 8} y2={H} stroke="#22c55e" strokeOpacity="0.35" strokeDasharray="3 3" />
          )}
          <circle className={hover === null ? "animate-pulse" : ""} cx={focus * step} cy={data.yOf(data.values[focus])} r="5" fill="#22c55e" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-c-surface-11)] pt-2 text-xs text-[var(--color-c-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--color-c-accent)]" />
          <span>
            <strong className="text-[var(--color-c-text)]">{today}</strong> today
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-[var(--color-c-text)]">{data.peak}</strong> peak / {unit}
          </span>
          <span className="text-[var(--color-c-on-surface-variant)]">|</span>
          <span>
            <strong className="text-[var(--color-c-text)]">{data.low}</strong> low
          </span>
          <span className="text-[var(--color-c-on-surface-variant)]">|</span>
          <span>
            <strong className="text-[var(--color-c-text)]">{data.avg}</strong> avg
          </span>
        </div>
      </div>
    </div>
  );
}
