"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/resume-analysis/motion";
import { LEVELS, type InsightInterview, type Summary } from "@/lib/interview/types";
import { DIMENSIONS, dayKey, fmtDate, type kindAverages } from "./aggregate";

/* Chart roles. Emphasis form: one accent series (lime), context in gray. */
const ACCENT = "#a3e635";
const CONTEXT = "#9ca3af";
const SURFACE = "#131612"; // card surface: rings and gaps are drawn in it
const GRID = "rgba(255,255,255,0.07)";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/** Floating readout: value leads, context follows. */
function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: React.ReactNode }) {
  const left = Math.max(8, Math.min(x - 90, width - 188));
  return (
    <div
      role="status"
      className="pointer-events-none absolute z-10 w-[180px] rounded-xl border border-white/10 bg-[#1c201a]/95 px-3 py-2.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.8)] backdrop-blur"
      style={{ left, top: Math.max(0, y - 88) }}
    >
      {children}
    </div>
  );
}

/* ================================================================ score trend */

type TrendPoint = Pick<InsightInterview, "id" | "role" | "level" | "overallScore" | "createdAt" | "completedAt">;

export function ScoreTrend({ points }: { points: TrendPoint[] }) {
  const reduce = useReducedMotion();
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const H = 220;
  const AXIS = 28;
  const pad = { l: 34, r: 40, t: 14 };
  const plotW = Math.max(0, width - pad.l - pad.r);
  const n = points.length;
  const x = (i: number) => pad.l + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = (v: number) => pad.t + (1 - v / 100) * (H - pad.t);

  const { line, area } = useMemo(() => {
    if (!n || !width) return { line: "", area: "" };
    const pts = points.map((p, i) => [x(i), y(p.overallScore ?? 0)] as const);
    // Gentle monotone-ish curve: midpoint control points keep it from overshooting.
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const mx = (x0 + x1) / 2;
      d += ` C${mx},${y0} ${mx},${y1} ${x1},${y1}`;
    }
    return { line: d, area: `${d} L${pts[pts.length - 1][0]},${y(0)} L${pts[0][0]},${y(0)} Z` };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, width]);

  function nearest(clientX: number, rect: DOMRect) {
    if (!n) return null;
    const px = clientX - rect.left;
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    return best;
  }

  const tickEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 70))));
  const a = active !== null ? points[active] : null;
  const last = points[n - 1];

  return (
    <div ref={ref} className="relative" style={{ height: H + AXIS }}>
      {width > 0 && n > 0 && (
        <svg
          width={width}
          height={H + AXIS}
          role="img"
          aria-label={`Interview scores over time. Latest ${last.overallScore} out of 100.`}
          tabIndex={0}
          className="outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--color-c-lime)]/40"
          onPointerMove={(e) => setActive(nearest(e.clientX, e.currentTarget.getBoundingClientRect()))}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(n - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setActive((i) => Math.max(0, (i ?? n - 1) - 1));
            if (e.key === "ArrowRight") setActive((i) => Math.min(n - 1, (i ?? 0) + 1));
          }}
        >
          <defs>
            <linearGradient id="trend-wash" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity="0.16" />
              <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
              <text x={pad.l - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-[var(--color-c-dim)] font-mono text-[10px] tabular-nums">
                {v}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            // Regular ticks, plus the latest; a regular tick too close to the latest one is dropped.
            (i % tickEvery === 0 && (i === n - 1 || x(n - 1) - x(i) >= 64)) || i === n - 1 ? (
              <text key={p.id} x={x(i)} y={H + 18} textAnchor="middle" className="fill-[var(--color-c-dim)] font-mono text-[10px]">
                {fmtDate(p.completedAt ?? p.createdAt)}
              </text>
            ) : null,
          )}

          {n > 1 && (
            <>
              <motion.path
                d={area}
                fill="url(#trend-wash)"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
              <motion.path
                key={line}
                d={line}
                fill="none"
                stroke={ACCENT}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
              />
            </>
          )}

          {a && active !== null && <line x1={x(active)} x2={x(active)} y1={pad.t} y2={y(0)} stroke="rgba(255,255,255,0.22)" strokeWidth={1} />}

          {points.map((p, i) => (
            <motion.circle
              key={p.id}
              cx={x(i)}
              cy={y(p.overallScore ?? 0)}
              r={active === i ? 6 : 4}
              fill={ACCENT}
              stroke={SURFACE}
              strokeWidth={2}
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.3 + (i / Math.max(1, n)) * 1 }}
            />
          ))}

          {/* End label: the latest score */}
          <text x={x(n - 1) + 10} y={y(last.overallScore ?? 0)} dy="0.32em" className="fill-[var(--color-c-text)] text-[12px] font-bold">
            {last.overallScore}
          </text>
        </svg>
      )}

      {a && active !== null && (
        <Tip x={x(active)} y={y(a.overallScore ?? 0)} width={width}>
          <p className="text-[18px] font-extrabold leading-none text-[var(--color-c-text)]">
            {a.overallScore}
            <span className="text-[11px] font-semibold text-[var(--color-c-dim)]">/100</span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 truncate text-[11px] font-semibold text-[var(--color-c-text-4)]">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: ACCENT }} />
            <span className="truncate">{a.role}</span>
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--color-c-dim)]">
            {LEVELS.find((l) => l.key === a.level)?.label} · {fmtDate(a.completedAt ?? a.createdAt, true)}
          </p>
        </Tip>
      )}
    </div>
  );
}

/* ================================================================ skill bars */

export function SkillBars({ latest, average }: { latest: Summary["dimensions"]; average: Summary["dimensions"] | null }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div>
      <div className="space-y-4">
        {DIMENSIONS.map((d, i) => {
          const v = latest[d.key];
          const avg = average?.[d.key];
          const delta = avg !== undefined ? v - avg : 0;
          return (
            <div
              key={d.key}
              tabIndex={0}
              onPointerEnter={() => setHover(d.key)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(d.key)}
              onBlur={() => setHover(null)}
              className="relative rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-c-lime)]/40"
            >
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-[12px] font-semibold text-[var(--color-c-text-4)]">{d.label}</span>
                <span className="ml-auto text-[13px] font-bold text-[var(--color-c-text)]">{v}</span>
                {avg !== undefined && <span className="font-mono text-[10px] text-[var(--color-c-dim)]">avg {avg}</span>}
              </div>
              <div className={`relative h-3 rounded-r-[4px] bg-white/[0.05] transition-opacity ${hover && hover !== d.key ? "opacity-50" : ""}`}>
                <motion.div
                  className="h-full rounded-r-[4px]"
                  style={{ background: ACCENT }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${v}%` }}
                  transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.08 }}
                />
                {avg !== undefined && (
                  <motion.span
                    className="absolute -top-1 h-5 w-[3px] rounded-full"
                    style={{ background: CONTEXT, boxShadow: `0 0 0 2px ${SURFACE}` }}
                    initial={reduce ? false : { left: 0, opacity: 0 }}
                    animate={{ left: `calc(${avg}% - 1.5px)`, opacity: 1 }}
                    transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.3 + i * 0.08 }}
                  />
                )}
              </div>
              {hover === d.key && avg !== undefined && (
                <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 rounded-lg border border-white/10 bg-[#1c201a] px-2.5 py-1.5 text-[11px] shadow-lg">
                  <span className="font-bold text-[var(--color-c-text)]">
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>{" "}
                  <span className="text-[var(--color-c-muted)]">vs your average</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {average && (
        <div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] text-[var(--color-c-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 rounded-r-[3px]" style={{ background: ACCENT }} /> Latest interview
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3.5 w-[3px] rounded-full" style={{ background: CONTEXT }} /> Your average
          </span>
        </div>
      )}
    </div>
  );
}

/* ================================================================ by question type */

export function KindBars({ rows }: { rows: ReturnType<typeof kindAverages> }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const shown = rows.filter((r) => r.value !== null);
  if (!shown.length) return <p className="py-6 text-center text-[12px] text-[var(--color-c-dim)]">No graded answers yet.</p>;
  const weakest = shown.reduce((a, b) => ((b.value ?? 0) < (a.value ?? 0) ? b : a));
  return (
    <div className="space-y-3">
      {shown.map((r, i) => (
        <div
          key={r.key}
          tabIndex={0}
          onPointerEnter={() => setHover(r.key)}
          onPointerLeave={() => setHover(null)}
          onFocus={() => setHover(r.key)}
          onBlur={() => setHover(null)}
          className="relative grid grid-cols-[92px_1fr_44px] items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-c-lime)]/40"
        >
          <span className="truncate text-[12px] font-semibold text-[var(--color-c-text-4)]">{r.label}</span>
          <div className={`h-3 rounded-r-[4px] bg-white/[0.05] transition-opacity ${hover && hover !== r.key ? "opacity-50" : ""}`}>
            <motion.div
              className="h-full rounded-r-[4px]"
              style={{ background: r.key === weakest.key && shown.length > 1 ? CONTEXT : ACCENT }}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${(r.value ?? 0) * 10}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.07 }}
            />
          </div>
          <span className="text-right text-[12px] font-bold text-[var(--color-c-text)]">
            {r.value}
            <span className="text-[10px] font-medium text-[var(--color-c-dim)]">/10</span>
          </span>
          {hover === r.key && (
            <div className="pointer-events-none absolute left-[104px] top-full z-10 mt-1 rounded-lg border border-white/10 bg-[#1c201a] px-2.5 py-1.5 text-[11px] shadow-lg">
              <span className="font-bold text-[var(--color-c-text)]">{r.value}/10</span>{" "}
              <span className="text-[var(--color-c-muted)]">
                average across {r.n} interview{r.n === 1 ? "" : "s"}
              </span>
            </div>
          )}
        </div>
      ))}
      {shown.length > 1 && (
        <p className="pt-1 text-[11px] text-[var(--color-c-muted)]">
          <span className="mr-1.5 inline-block h-2 w-3 rounded-r-[3px] align-middle" style={{ background: CONTEXT }} />
          Grey marks your weakest question type: <span className="font-semibold text-[var(--color-c-text-4)]">{weakest.label}</span>.
        </p>
      )}
    </div>
  );
}

/* ================================================================ practice calendar */

const WEEKS = 17;
// Sequential: one hue, more practice = more lime.
const STEPS = ["rgba(255,255,255,0.05)", "rgba(163,230,53,0.28)", "rgba(163,230,53,0.55)", "rgba(163,230,53,0.95)"];

export function PracticeCalendar({ perDay }: { perDay: Map<string, number> }) {
  const reduce = useReducedMotion();
  const [tip, setTip] = useState<{ x: number; y: number; text: string; n: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    // Start on a Monday, WEEKS weeks back.
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (WEEKS - 1) * 7);
    const out: { date: Date; n: number; future: boolean }[] = [];
    for (let i = 0; i < WEEKS * 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push({ date: d, n: perDay.get(dayKey(d)) ?? 0, future: d > today });
    }
    return out;
  }, [perDay]);

  const months = cells.filter((c, i) => i % 7 === 0 && c.date.getDate() <= 7);

  return (
    <div ref={boxRef} className="relative">
      <div className="overflow-x-auto pb-1">
        <div className="inline-block">
          <div className="relative mb-1.5 h-3.5" style={{ width: WEEKS * 17 }}>
            {months.map((c) => (
              <span
                key={c.date.toISOString()}
                className="absolute font-mono text-[10px] text-[var(--color-c-dim)]"
                style={{ left: Math.floor(cells.indexOf(c) / 7) * 17 }}
              >
                {c.date.toLocaleDateString("en-IN", { month: "short" })}
              </span>
            ))}
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-[3px]">
            {cells.map((c, i) => (
              <motion.span
                key={i}
                tabIndex={c.future ? -1 : 0}
                aria-label={`${c.n} interview${c.n === 1 ? "" : "s"} on ${fmtDate(c.date.toISOString(), true)}`}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: c.future ? 0.25 : 1, scale: 1 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : Math.floor(i / 7) * 0.025 }}
                onPointerEnter={(e) => {
                  if (c.future) return;
                  const r = (e.target as HTMLElement).getBoundingClientRect();
                  const b = boxRef.current!.getBoundingClientRect();
                  setTip({ x: r.left - b.left + r.width / 2, y: r.top - b.top, n: c.n, text: fmtDate(c.date.toISOString(), true) });
                }}
                onPointerLeave={() => setTip(null)}
                className="h-[14px] w-[14px] rounded-[3px] outline-none hover:ring-1 hover:ring-white/40 focus-visible:ring-2 focus-visible:ring-[var(--color-c-lime)]/60"
                style={{ background: STEPS[Math.min(3, c.n)] }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[10px] text-[var(--color-c-dim)]">
        Less
        {STEPS.map((s) => (
          <span key={s} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: s }} />
        ))}
        More
      </div>
      {tip && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-white/10 bg-[#1c201a] px-2.5 py-1.5 text-[11px] shadow-lg"
          style={{ left: tip.x, top: tip.y - 6 }}
        >
          <span className="font-bold text-[var(--color-c-text)]">
            {tip.n} interview{tip.n === 1 ? "" : "s"}
          </span>{" "}
          <span className="text-[var(--color-c-muted)]">· {tip.text}</span>
        </div>
      )}
    </div>
  );
}

/* ================================================================ readiness gauge */

export function ReadinessRing({ value, tone }: { value: number; tone: "good" | "warn" | "bad" }) {
  const reduce = useReducedMotion();
  const R = 62;
  const C = 2 * Math.PI * R;
  const color = tone === "good" ? ACCENT : tone === "warn" ? "#fbbf24" : "#f87171";
  return (
    <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90" aria-hidden>
      <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
      <motion.circle
        cx="75"
        cy="75"
        r={R}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={C}
        initial={reduce ? false : { strokeDashoffset: C }}
        animate={{ strokeDashoffset: C * (1 - value / 100) }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.2 }}
      />
    </svg>
  );
}
