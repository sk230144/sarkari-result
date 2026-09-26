"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, ChevronLeft, ChevronRight, Code2, Network, CheckSquare, FileText, ScanSearch, MonitorPlay } from "lucide-react";
import { ymd, type DayDetail } from "@/lib/progress/days";
import type { ActivityKind } from "@/lib/progress/types";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** How each kind of activity reads in the day card, in the order it's listed. */
const KINDS: { k: ActivityKind; icon: typeof Code2; one: string; many: string }[] = [
  { k: "interview", icon: MonitorPlay, one: "mock interview", many: "mock interviews" },
  { k: "problem", icon: Code2, one: "DSA problem solved", many: "DSA problems solved" },
  { k: "design", icon: Network, one: "system design question", many: "system design questions" },
  { k: "analysis", icon: ScanSearch, one: "resume analysis", many: "resume analyses" },
  { k: "letter", icon: FileText, one: "cover letter written", many: "cover letters written" },
  { k: "task", icon: CheckSquare, one: "task completed", many: "tasks completed" },
];

const CARD_W = 248;

export function StreakCalendar({
  byDay,
  details,
  currentStreak,
}: {
  byDay: Map<string, number>;
  details: Map<string, DayDetail>;
  currentStreak: number;
}) {
  // Resolved once per mount so every cell compares against the same "today".
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));
  const [tip, setTip] = useState<{ day: number; left: number; top: number; below: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const { year, month } = view;
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isFuture = new Date(year, month, 1) > today;
  const activeInMonth = Array.from({ length: daysInMonth }, (_, i) => byDay.get(ymd(new Date(year, month, i + 1))) ?? 0).filter(
    (n) => n > 0,
  ).length;
  const doneToday = (byDay.get(ymd(today)) ?? 0) > 0;

  function shift(delta: number) {
    setTip(null);
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function show(day: number, el: HTMLElement) {
    const b = box.current?.getBoundingClientRect();
    if (!b) return;
    const r = el.getBoundingClientRect();
    const center = r.left - b.left + r.width / 2;
    const left = Math.max(8, Math.min(center - CARD_W / 2, b.width - CARD_W - 8));
    // Flip below the day when there isn't room above it.
    const below = r.top - b.top < 190;
    setTip({ day, left, top: below ? r.bottom - b.top + 8 : r.top - b.top - 8, below });
  }

  const tipDate = tip ? new Date(year, month, tip.day) : null;
  const tipDetail = tipDate ? details.get(ymd(tipDate)) : undefined;
  const tipIsToday = tipDate ? ymd(tipDate) === ymd(today) : false;

  return (
    <div ref={box} className="relative flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--color-c-orange)]">
          <Flame className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-bold uppercase tracking-wider">Streak</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-c-text)]">
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Previous month"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] transition-colors hover:bg-[var(--color-c-surface-16)] hover:text-[var(--color-c-text)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[8.5rem] text-center">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] transition-colors hover:bg-[var(--color-c-surface-16)] hover:text-[var(--color-c-text)] disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2.5 text-center text-xs" onPointerLeave={() => setTip(null)}>
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 font-medium text-[var(--color-c-dim-2)]">
            {d}
          </span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(year, month, day);
          const isToday = isCurrentMonth && day === today.getDate();
          const future = date > today;
          const count = byDay.get(ymd(date)) ?? 0;
          const label = `${day} ${MONTHS[month]}: ${count} ${count === 1 ? "activity" : "activities"}`;
          const hoverProps = future
            ? {}
            : {
                tabIndex: 0,
                "aria-label": label,
                onPointerEnter: (e: React.PointerEvent<HTMLElement>) => show(day, e.currentTarget),
                onFocus: (e: React.FocusEvent<HTMLElement>) => show(day, e.currentTarget),
                onBlur: () => setTip(null),
              };
          const ring = tip?.day === day ? "ring-1 ring-[var(--color-c-orange)]/60" : "";

          if (isToday) {
            return (
              <div key={day} className="flex items-center justify-center">
                <span
                  aria-current="date"
                  {...hoverProps}
                  className={`flex h-6 w-6 cursor-default items-center justify-center rounded-full border-2 border-[var(--color-c-orange)] text-xs font-bold outline-none ${
                    count ? "bg-[var(--color-c-orange)] text-black" : "text-[var(--color-c-orange)]"
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          }
          if (count) {
            return (
              <span
                key={day}
                {...hoverProps}
                className={`cursor-default rounded-md py-1 font-semibold text-[var(--color-c-orange)] outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-[var(--color-c-orange)]/60 ${ring} ${
                  count >= 5 ? "bg-[var(--color-c-orange)]/35" : count >= 2 ? "bg-[var(--color-c-orange)]/25" : "bg-[var(--color-c-orange)]/15"
                }`}
              >
                {day}
              </span>
            );
          }
          return (
            <span
              key={day}
              {...hoverProps}
              className={`cursor-default rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${future ? "text-[var(--color-c-muted)]/50" : "text-[var(--color-c-muted)]"}`}
            >
              {day}
            </span>
          );
        })}
      </div>

      <AnimatePresence>
        {tip && tipDate && (
          // The wrapper places the card (above the day, or below near the top);
          // only the inner card animates, so its transform can't undo the placement.
          <div
            key={tip.day}
            className="pointer-events-none absolute z-30"
            style={{ left: tip.left, top: tip.top, width: CARD_W, transform: tip.below ? undefined : "translateY(-100%)" }}
          >
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: tip.below ? -4 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="rounded-xl border border-white/10 bg-[#1b1f19]/95 p-3.5 shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85)] backdrop-blur"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-bold text-[var(--color-c-text)]">
                {tipDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
              {tipIsToday && (
                <span className="rounded-full bg-[var(--color-c-orange)]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-orange)]">
                  Today
                </span>
              )}
            </div>

            {tipDetail ? (
              <>
                <p className="mt-1 text-[11px] text-[var(--color-c-muted)]">
                  <span className="text-[16px] font-extrabold text-[var(--color-c-text)]">{tipDetail.total}</span>{" "}
                  {tipDetail.total === 1 ? "activity" : "activities"}
                </p>
                <ul className="mt-2.5 space-y-2 border-t border-white/[0.07] pt-2.5">
                  {KINDS.filter((x) => tipDetail.kinds[x.k]).map(({ k, icon: Icon, one, many }) => {
                    const n = tipDetail.kinds[k]!;
                    const notes = tipDetail.notes.filter((x) => x.k === k);
                    return (
                      <li key={k} className="text-[11px]">
                        <span className="flex items-center gap-2 text-[var(--color-c-text-4)]">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-c-orange)]" />
                          <span>
                            <span className="font-bold text-[var(--color-c-text)]">{n}</span> {n === 1 ? one : many}
                          </span>
                        </span>
                        {notes.length > 0 && (
                          <ul className="ml-[22px] mt-1 space-y-0.5">
                            {notes.slice(0, 3).map((x, i) => (
                              <li key={i} className="truncate text-[10px] text-[var(--color-c-muted)]">
                                {x.d}
                              </li>
                            ))}
                            {notes.length > 3 && <li className="text-[10px] text-[var(--color-c-dim-2)]">+{notes.length - 3} more</li>}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <p className="mt-1.5 text-[11px] text-[var(--color-c-muted)]">
                {tipIsToday ? "Nothing yet today. One solved problem keeps your streak alive." : "No activity this day."}
              </p>
            )}
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-c-surface-11)] pt-3 text-xs text-[var(--color-c-muted)]">
        {isCurrentMonth ? (
          <>
            <span>
              🔥 Current run: {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </span>
            <span className="font-medium text-[var(--color-c-accent)]">
              {doneToday ? "Done for today!" : currentStreak ? "Keep it going today" : "Start a streak today"}
            </span>
          </>
        ) : (
          <>
            <span>{isFuture ? "" : `${activeInMonth} active ${activeInMonth === 1 ? "day" : "days"} this month`}</span>
            <button
              type="button"
              onClick={() => setView({ year: today.getFullYear(), month: today.getMonth() })}
              className="font-medium text-[var(--color-c-accent)] hover:underline"
            >
              Back to today
            </button>
          </>
        )}
      </div>
    </div>
  );
}
