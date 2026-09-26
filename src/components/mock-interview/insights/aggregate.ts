import type { InsightInterview, Kind, Level, Summary } from "@/lib/interview/types";

export type LevelFilter = Level | "all";
export type RangeFilter = "all" | "90" | "30" | "7";

export const RANGES: { key: RangeFilter; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "90", label: "90 days" },
  { key: "30", label: "30 days" },
  { key: "7", label: "7 days" },
];

export function applyFilters(items: InsightInterview[], level: LevelFilter, range: RangeFilter) {
  const since = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
  return items.filter((i) => (level === "all" || i.level === level) && new Date(i.createdAt).getTime() >= since);
}

/** Completed interviews, oldest first (the order a trend reads in). */
export function completedAsc(items: InsightInterview[]) {
  return items
    .filter((i) => i.status === "completed" && i.overallScore !== null)
    .sort((a, b) => new Date(a.completedAt ?? a.createdAt).getTime() - new Date(b.completedAt ?? b.createdAt).getTime());
}

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export const DIMENSIONS: { key: keyof Summary["dimensions"]; label: string }[] = [
  { key: "technical", label: "Technical depth" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "communication", label: "Communication" },
  { key: "cultureFit", label: "Culture fit" },
];

export function averageDimensions(done: InsightInterview[]): Summary["dimensions"] | null {
  const withDims = done.filter((d) => d.dimensions);
  if (!withDims.length) return null;
  const avg = (k: keyof Summary["dimensions"]) => Math.round(mean(withDims.map((d) => d.dimensions![k])));
  return { technical: avg("technical"), problemSolving: avg("problemSolving"), communication: avg("communication"), cultureFit: avg("cultureFit") };
}

export const KIND_ORDER: { key: Kind; label: string }[] = [
  { key: "intro", label: "Introduction" },
  { key: "technical", label: "Technical" },
  { key: "coding", label: "Coding" },
  { key: "behavioral", label: "Behavioural" },
  { key: "closing", label: "Closing" },
];

/** Average score /10 per question type across interviews, with how many interviews fed it. */
export function kindAverages(done: InsightInterview[]) {
  return KIND_ORDER.map((k) => {
    const vals = done.map((d) => d.byKind[k.key]).filter((v): v is number => typeof v === "number");
    return { ...k, value: vals.length ? Math.round(mean(vals) * 10) / 10 : null, n: vals.length };
  });
}

/* ---------------------------------------------------------- recurring points */

const STOP = new Set(
  "the a an and or of to in on for with your you is are be as at by it this that from more when into than their them use using about answers answer questions question interview".split(" "),
);
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));
const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0;
  a.forEach((w) => b.has(w) && inter++);
  return inter / (a.size + b.size - inter || 1);
};

export type Point = { text: string; count: number; interviews: number; lastAt: string };

/**
 * Groups similar feedback lines from different interviews, so "you keep
 * doing X" rises to the top. The most recent wording represents each group.
 */
export function recurringPoints(done: InsightInterview[], pick: (i: InsightInterview) => string[], limit = 5): Point[] {
  const groups: { text: string; set: Set<string>; ids: Set<string>; count: number; lastAt: string }[] = [];
  const newestFirst = [...done].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const iv of newestFirst) {
    for (const text of pick(iv)) {
      const set = words(text);
      if (!set.size) continue;
      const g = groups.find((x) => jaccard(x.set, set) >= 0.34);
      if (g) {
        g.count++;
        g.ids.add(iv.id);
        set.forEach((w) => g.set.add(w));
      } else groups.push({ text, set, ids: new Set([iv.id]), count: 1, lastAt: iv.createdAt });
    }
  }
  return groups
    .sort((a, b) => b.ids.size - a.ids.size || b.count - a.count || new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
    .slice(0, limit)
    .map((g) => ({ text: g.text, count: g.count, interviews: g.ids.size, lastAt: g.lastAt }));
}

export type GradedRef = InsightInterview["graded"][number] & { interviewId: string; role: string; createdAt: string };

export function bestAndWorst(done: InsightInterview[], n = 4) {
  const all: GradedRef[] = done.flatMap((d) => d.graded.map((g) => ({ ...g, interviewId: d.id, role: d.role, createdAt: d.createdAt })));
  const recentFirst = (a: GradedRef, b: GradedRef) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const best = all.filter((g) => g.score >= 6).sort((a, b) => b.score - a.score || recentFirst(a, b)).slice(0, n);
  const worst = all.filter((g) => g.score <= 4).sort((a, b) => a.score - b.score || recentFirst(a, b)).slice(0, n);
  return { best, worst };
}

/* ---------------------------------------------------------- calendar */

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

/** Interviews started per day, and the current run of consecutive practice days. */
export function practiceDays(items: InsightInterview[]) {
  const perDay = new Map<string, number>();
  for (const i of items) {
    const k = dayKey(new Date(i.createdAt));
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }
  let streak = 0;
  const d = new Date();
  // Today not practised yet doesn't break yesterday's streak.
  if (!perDay.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (perDay.has(dayKey(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { perDay, streak, activeDays: perDay.size };
}

/* ---------------------------------------------------------- formatting */

export const fmtDate = (iso: string, withYear = false) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });

export function fmtDuration(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function readiness(score: number) {
  return score >= 80
    ? { label: "Interview ready", tone: "good" as const }
    : score >= 60
      ? { label: "Almost there", tone: "good" as const }
      : score >= 40
        ? { label: "Building up", tone: "warn" as const }
        : { label: "Needs practice", tone: "bad" as const };
}
