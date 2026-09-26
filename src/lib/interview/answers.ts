import "server-only";
import { ANSWER_MAX_CHARS, CODE_LANGUAGES, CODE_MAX_CHARS, type Answer, type Question } from "./types";

/** Keeps only answers to real questions, with every field capped and typed. */
export function cleanAnswers(input: unknown, questions: Question[]): Record<string, Answer> {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Record<string, Answer> = {};
  for (const q of questions) {
    const a = src[q.id] as Record<string, unknown> | undefined;
    if (!a || typeof a !== "object") continue;
    const answer: Answer = {
      text: typeof a.text === "string" ? a.text.slice(0, ANSWER_MAX_CHARS) : "",
      seconds: Math.max(0, Math.min(6 * 3600, Math.round(Number(a.seconds) || 0))),
    };
    if (q.kind === "coding") {
      if (typeof a.code === "string") answer.code = a.code.slice(0, CODE_MAX_CHARS);
      if (CODE_LANGUAGES.some((l) => l.key === a.language)) answer.language = a.language as Answer["language"];
      const t = a.tests as Record<string, unknown> | undefined;
      if (t && Number.isInteger(t.passed) && Number.isInteger(t.total)) {
        const total = Math.max(0, Math.min(10, t.total as number));
        answer.tests = { passed: Math.max(0, Math.min(total, t.passed as number)), total };
      }
    }
    out[q.id] = answer;
  }
  return out;
}
