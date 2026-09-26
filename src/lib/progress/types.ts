/** What /api/progress returns. Shared with the Progress page. */

export type ActivityKind = "problem" | "design" | "task" | "letter" | "analysis" | "interview";

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
    /** Completed mock interviews. */
    interviews: number;
    /** Average score of the last 3 completed interviews, or null before the first. */
    interviewAvg: number | null;
  };
  /** Raw event timestamps; the browser buckets them into days in the reader's own time zone. */
  /** `d` is a short human detail for the day tooltip, e.g. "Frontend Developer · 71/100". */
  events: { t: string; k: ActivityKind; d?: string }[];
  readiness: {
    ats: boolean;
    portfolio: boolean;
    portfolioHint: string | null;
    coverLetter: boolean;
    applied: boolean;
    mockInterview: boolean;
  };
};
