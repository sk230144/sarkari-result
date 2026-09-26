import type { LetterResult } from "./cover-letter-config";
import type { AnalysisResult } from "./analyzer/config";
import type { InterviewListItem } from "./interview/types";

export type CopilotData = {
  letters: (LetterResult & { company: string | null; jd: string })[];
  analyses: AnalysisResult[];
  interviews: InterviewListItem[];
  /** null = unlimited (admin). Counted over the last 24 hours. */
  usage: {
    letters: { used: number; limit: number } | null;
    analyses: { used: number; limit: number } | null;
  };
  invite: { slug: string | null; referrals: number };
};
