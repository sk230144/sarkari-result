export type Difficulty = "Basic" | "Easy" | "Medium" | "Hard";

export type Problem = {
  /** 1-based position in the official sheet. */
  n: number;
  title: string;
  /** Primary link — the problem itself where one exists. */
  url?: string;
  /** True when `url` is a search fallback rather than a direct problem link. */
  search?: boolean;
  /** Write-up explaining the problem, shown alongside the practice link. */
  article?: string;
  /** Curator's difficulty rating, where the sheet provides one. */
  difficulty?: Difficulty;
};

export type Section = {
  /** Day number for day-based sheets; section index otherwise. */
  day: number;
  title: string;
  problems: Problem[];
};

export type SheetConfig = {
  name: string;
  kicker: string;
  blurb: string;
  sections: Section[];
  /** How a group is labelled in the UI — "Day 1: Arrays" vs "Arrays". */
  groupLabel: "day" | "topic";
  officialUrl: string;
  pdfUrl?: string;
  trackerUrl?: string;
  /** localStorage namespace — must differ per sheet. */
  storageKey: string;
};
