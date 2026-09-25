/** What /api/progress returns. Shared with the Progress page. */

export type ActivityKind = "problem" | "design" | "task" | "letter" | "analysis";

export type ProgressData = {
  sheets: { key: string; label: string; href: string; total: number; solved: number; kind: "dsa" | "faang" | "system-design" }[];
  counts: {
    problemsSolved: number;
    problemsTotal: number;
    designSolved: number;
    designTotal: number;
    coverLetters: number;
    analyses: number;
    tasksDone: number;
    jobsApplied: number;
  };
  /** Raw event timestamps; the browser buckets them into days in the reader's own time zone. */
  events: { t: string; k: ActivityKind }[];
  readiness: {
    ats: boolean;
    portfolio: boolean;
    portfolioHint: string | null;
    coverLetter: boolean;
    applied: boolean;
  };
};
