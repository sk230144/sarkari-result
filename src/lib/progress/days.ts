import type { ProgressData } from "./types";

/** Local calendar day key, e.g. "2026-09-26". */
export function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Events per local day. */
export function countByDay(events: ProgressData["events"]): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of events) {
    const k = ymd(new Date(e.t));
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

/**
 * Current streak ends today (or yesterday, if nothing has happened yet
 * today, so the streak isn't shown as broken first thing in the morning).
 */
export function streaks(days: Map<string, number>) {
  const cursor = new Date();
  if (!days.has(ymd(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(ymd(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [...days.keys()].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of sorted) {
    const [y, m, d] = k.split("-").map(Number);
    const day = new Date(y, m - 1, d);
    run = prev && Math.round((day.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = day;
  }
  return { current, longest: Math.max(longest, current) };
}
