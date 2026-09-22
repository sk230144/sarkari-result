"use client";

import { useMemo, useState } from "react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function isoKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Placeholder activity: the last few days before today, to be replaced by real data. */
function seedStreak(today: Date): Set<string> {
  const days = new Set<string>();
  for (const offset of [1, 3, 5]) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    days.add(isoKey(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

export function StreakCalendar() {
  // Resolved once per mount so every cell compares against the same "today".
  const today = useMemo(() => new Date(), []);
  const streak = useMemo(() => seedStreak(today), [today]);

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const { year, month } = view;
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  function shift(delta: number) {
    setView(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-dash-card)] p-6 shadow-sm lg:col-span-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--color-c-orange)]">
          <Flame className="h-[18px] w-[18px]" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            Streak
          </span>
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
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-c-muted)] transition-colors hover:bg-[var(--color-c-surface-16)] hover:text-[var(--color-c-text)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2.5 text-center text-xs">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 font-medium text-[var(--color-c-dim-2)]">
            {d}
          </span>
        ))}

        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`blank-${i}`} aria-hidden />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const isToday = isCurrentMonth && day === today.getDate();
          const active = streak.has(isoKey(year, month, day));

          if (isToday) {
            return (
              <div key={day} className="flex items-center justify-center">
                <span
                  aria-current="date"
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-c-orange)] text-xs font-bold text-[var(--color-c-orange)]"
                >
                  {day}
                </span>
              </div>
            );
          }
          if (active) {
            return (
              <span
                key={day}
                className="rounded-md bg-[var(--color-c-orange)]/15 py-1 font-semibold text-[var(--color-c-orange)]"
              >
                {day}
              </span>
            );
          }
          return (
            <span key={day} className="py-1 text-[var(--color-c-muted)]">
              {day}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-c-surface-11)] pt-3 text-xs text-[var(--color-c-muted)]">
        {isCurrentMonth ? (
          <>
            <span>🔥 Current run: 2 days</span>
            <span className="font-medium text-[var(--color-c-accent)]">Keep it going!</span>
          </>
        ) : (
          <>
            <span>
              {streak.size > 0 ? "Viewing another month" : "No activity logged"}
            </span>
            <button
              type="button"
              onClick={() =>
                setView({
                  year: today.getFullYear(),
                  month: today.getMonth(),
                })
              }
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
