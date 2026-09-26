import type { ActivityKind, ProgressData } from "./types";

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

export type DayDetail = {
  total: number;
  kinds: Partial<Record<ActivityKind, number>>;
  /** Named items worth listing (interviews, letters, analyses, tasks). */
  notes: { k: ActivityKind; d: string }[];
};

/** What happened on each local day, for the calendar's hover card. */
export function detailsByDay(events: ProgressData["events"]): Map<string, DayDetail> {
  const m = new Map<string, DayDetail>();
  for (const e of events) {
    const key = ymd(new Date(e.t));
    const day = m.get(key) ?? { total: 0, kinds: {}, notes: [] };
    day.total++;
    day.kinds[e.k] = (day.kinds[e.k] ?? 0) + 1;
    if (e.d) day.notes.push({ k: e.k, d: e.d });
    m.set(key, day);
  }
  return m;
}
