/** Mock interview shapes and rules. Shared by the browser and the API. */

export const LEVELS = [
  { key: "easy", label: "Easy", sub: "Fresher / intern", blurb: "Fundamentals, simple coding, friendly HR questions." },
  { key: "medium", label: "Medium", sub: "1–3 years", blurb: "Applied problem solving, one real coding round, deeper follow-ups." },
  { key: "hard", label: "Hard", sub: "3+ years", blurb: "Design trade-offs, two coding rounds, senior-level scenarios." },
] as const;
export type Level = (typeof LEVELS)[number]["key"];

export type Kind = "intro" | "technical" | "coding" | "behavioral" | "closing";
export type Phase = "tech" | "hr";

export type CodingSpec = {
  title: string;
  prompt: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
};

export type Question = {
  id: string;
  phase: Phase;
  kind: Kind;
  text: string;
  /** Why the interviewer asks this. */
  context: string;
  /** What a strong answer covers. */
  guidance: string;
  /** Time budget for this question, in minutes. */
  minutes: number;
  coding?: CodingSpec;
};

export const CODE_LANGUAGES = [
  { key: "javascript", label: "JavaScript", runsIn: "browser" },
  { key: "python", label: "Python 3", runsIn: "browser" },
  { key: "java", label: "Java", runsIn: "server" },
  { key: "cpp", label: "C++", runsIn: "server" },
  { key: "c", label: "C", runsIn: "server" },
  { key: "go", label: "Go", runsIn: "server" },
] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]["key"];

export type Answer = {
  text: string;
  code?: string;
  language?: CodeLanguage;
  /** Result of the last run against the examples. */
  tests?: { passed: number; total: number };
  /** Seconds spent on this question. */
  seconds: number;
};

export type QuestionResult = {
  score: number;
  verdict: string;
  feedback: string;
  improvements: string[];
  idealAnswer: string;
};

export type Summary = {
  headline: string;
  strengths: string[];
  improvements: string[];
  dimensions: { communication: number; technical: number; problemSolving: number; cultureFit: number };
};

export type InterviewStatus = "in_progress" | "evaluating" | "completed";

export type Interview = {
  id: string;
  role: string;
  level: Level;
  status: InterviewStatus;
  questions: Question[];
  answers: Record<string, Answer>;
  results: Record<string, QuestionResult> | null;
  summary: Summary | null;
  overallScore: number | null;
  timeLimitS: number;
  startedAt: string;
  completedAt: string | null;
};

export type InterviewListItem = {
  id: string;
  role: string;
  level: Level;
  status: InterviewStatus;
  overallScore: number | null;
  createdAt: string;
  /** Progress, for interviews that aren't finished yet. */
  answered?: number;
  total?: number;
  timeLeftS?: number;
};

/** One interview, boiled down for the history & insights page. */
export type InsightInterview = {
  id: string;
  role: string;
  level: Level;
  status: InterviewStatus;
  createdAt: string;
  completedAt: string | null;
  overallScore: number | null;
  dimensions: Summary["dimensions"] | null;
  strengths: string[];
  improvements: string[];
  answered: number;
  total: number;
  secondsSpent: number;
  timeLeftS: number;
  /** Average score /10 per question type (graded interviews only). */
  byKind: Partial<Record<Kind, number>>;
  /** Answered, graded questions, for best / weakest answers. */
  graded: { id: string; kind: Kind; text: string; score: number; verdict: string }[];
};

export const ANSWER_MAX_CHARS = 2000;
export const CODE_MAX_CHARS = 10000;

/** Minutes per question by level. Coding rounds get real time; HR stays brisk. */
export const MINUTES: Record<Level, Record<Kind, number>> = {
  easy: { intro: 2, technical: 3, coding: 20, behavioral: 2, closing: 1 },
  medium: { intro: 2, technical: 4, coding: 25, behavioral: 2.5, closing: 1 },
  hard: { intro: 2, technical: 5, coding: 35, behavioral: 3, closing: 1 },
};

export const CODING_COUNT: Record<Level, number> = { easy: 1, medium: 1, hard: 2 };

/** 10 tech (incl. coding) + 10 HR (incl. the fixed opening and closing). */
export const TECH_COUNT = 10;
export const HR_COUNT = 10;

export function totalMinutes(questions: Pick<Question, "minutes">[]) {
  return questions.reduce((n, q) => n + q.minutes, 0);
}

/** Question order for navigation: opening, tech phase, HR phase, closing. */
export function ordered(questions: Question[]) {
  const intro = questions.filter((q) => q.kind === "intro");
  const tech = questions.filter((q) => q.phase === "tech");
  const hr = questions.filter((q) => q.phase === "hr" && q.kind !== "intro" && q.kind !== "closing");
  const closing = questions.filter((q) => q.kind === "closing");
  return [...intro, ...tech, ...hr, ...closing];
}

export function isAnswered(q: Question, a: Answer | undefined) {
  if (!a) return false;
  if (q.kind === "coding") return Boolean(a.code?.trim()) || a.text.trim().length > 0;
  return a.text.trim().length > 0;
}
