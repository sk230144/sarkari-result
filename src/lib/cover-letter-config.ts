/** Shared by the browser and the API routes. No secrets or server imports. */

export const LETTER_STYLES = ["operator", "believer", "short"] as const;
export type LetterStyle = (typeof LETTER_STYLES)[number];

export const STYLE_LABELS: Record<LetterStyle, string> = {
  operator: "The Operator",
  believer: "The Believer",
  short: "Quick Apply",
};

export const ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Software Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Android Developer",
  "iOS Developer",
  "QA / SDET",
  "Product Manager",
];

/**
 * Edits are presets rather than free text, so the edit endpoint never
 * forwards arbitrary user instructions to the model.
 */
export const EDIT_PRESETS = {
  shorter: { label: "Shorter", instruction: "Make it about 25% shorter." },
  formal: { label: "More formal", instruction: "Make the tone more formal." },
  confident: {
    label: "More confident",
    instruction: "Make the tone more confident and direct.",
  },
  warmer: { label: "Warmer", instruction: "Make the tone warmer and more personal." },
} as const;
export type EditPreset = keyof typeof EDIT_PRESETS;

/** What is actually sent to the model after cleaning (~2,000 CV tokens). */
export const CV_CLEAN_MAX_CHARS = 8_000;
export const JD_CLEAN_MAX_CHARS = 3_000;

export type CvContact = {
  name: string | null;
  email: string | null;
  phone: string | null;
  links: string[];
};

export type LetterResult = {
  id: string;
  cvId: string;
  role: string;
  letters: Record<LetterStyle, string>;
  contact: CvContact;
  cached: boolean;
  updatedAt: string;
  /** Paid generations left in the current 24 h window; null when unlimited. */
  remaining: number | null;
};

/** Greeting, sign-off and contact are added here, never by the model. */
export function wrapLetter(style: LetterStyle, body: string, contact: CvContact): string {
  const name = contact.name || "Your Name";
  if (style === "short") {
    return `Hi,\n\n${body.trim()}\n\nThanks,\n${name}${contact.email ? `\n${contact.email}` : ""}`;
  }
  const lines = [name, contact.email, contact.phone].filter(Boolean).join("\n");
  return `Dear Hiring Manager,\n\n${body.trim()}\n\nSincerely,\n${lines}`;
}
