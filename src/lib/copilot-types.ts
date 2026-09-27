import type { LetterResult } from "./cover-letter-config";
import type { AnalysisResult } from "./analyzer/config";
import type { InterviewListItem } from "./interview/types";

export type CopilotData = {
  letters: (LetterResult & { company: string | null; jd: string })[];
  analyses: AnalysisResult[];
  interviews: InterviewListItem[];
  /** This calendar month (IST). Each count is null when unlimited (admin). */
  usage: {
    plan: "free" | "pro" | "admin";
    resetsAt: string;
    letters: { used: number; limit: number } | null;
    analyses: { used: number; limit: number } | null;
    interviews: { used: number; limit: number } | null;
  };
  invite: { slug: string | null; referrals: number };
};
