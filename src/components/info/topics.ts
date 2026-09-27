export const TOPICS = [
  ["general", "General question"],
  ["support", "Help with my account"],
  ["billing", "Payments & PRO+"],
  ["hiring", "Hiring / post a job"],
  ["feedback", "Feedback or idea"],
] as const;

export type Topic = (typeof TOPICS)[number][0];
