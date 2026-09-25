import {
  SKILL_IMPLIES,
  SKILL_SYNONYMS,
  SYSTEM_DESIGN_KEYS,
  VERDICT_BANDS,
  SCORE_WEIGHTS,
  TEMPLATES,
  RESOURCES,
  type GapType,
  type ResourceCard,
} from "./config";

/** Comparison key: lowercase with spaces, dots, dashes and underscores removed. */
export function skillKey(name: string): string {
  return name.toLowerCase().replace(/[\s._\-/]+/g, "");
}

/** Canonical display name for a skill, falling back to the trimmed input. */
export function canonicalSkill(name: string): string {
  const trimmed = name.trim();
  return SKILL_SYNONYMS[skillKey(trimmed)] ?? SKILL_SYNONYMS[trimmed.toLowerCase()] ?? trimmed;
}

function uniqueCanonical(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const c = canonicalSkill(s);
    const k = skillKey(c);
    if (c && !seen.has(k)) {
      seen.add(k);
      out.push(c);
    }
  }
  return out;
}

export type SkillMatch = {
  matched: string[];
  gaps: { skill: string; type: GapType }[];
  matchedRequired: number;
  matchedPreferred: number;
  totalRequired: number;
  totalPreferred: number;
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * JD skills found in the CV pool are matched; the rest are gaps.
 * cvText is a safety net for skills the extraction missed: a skill of 3+
 * characters also counts if it appears as a whole word in the resume text
 * ("Java" does not match inside "JavaScript").
 */
export function matchSkills(
  cvPool: string[],
  required: string[],
  preferred: string[],
  cvText: string,
): SkillMatch {
  const canonical = uniqueCanonical(cvPool);
  const pool = new Set(
    [...canonical, ...canonical.flatMap((s) => SKILL_IMPLIES[s] ?? [])].map(skillKey),
  );
  const text = cvText.toLowerCase();
  const has = (skill: string) => {
    if (pool.has(skillKey(skill))) return true;
    const name = skill.toLowerCase();
    if (name.length < 3) return false;
    return new RegExp(`(^|[^a-z0-9+#])${escapeRegex(name)}($|[^a-z0-9+#])`).test(text);
  };

  const req = uniqueCanonical(required);
  const reqKeys = new Set(req.map(skillKey));
  // A skill listed as both required and preferred counts once, as required.
  const pref = uniqueCanonical(preferred).filter((s) => !reqKeys.has(skillKey(s)));

  const matched: string[] = [];
  const gaps: { skill: string; type: GapType }[] = [];
  let matchedRequired = 0;
  let matchedPreferred = 0;

  for (const s of req) {
    if (has(s)) {
      matched.push(s);
      matchedRequired++;
    } else gaps.push({ skill: s, type: "Required" });
  }
  for (const s of pref) {
    if (has(s)) {
      matched.push(s);
      matchedPreferred++;
    } else gaps.push({ skill: s, type: "Preferred" });
  }

  return {
    matched,
    gaps,
    matchedRequired,
    matchedPreferred,
    totalRequired: req.length,
    totalPreferred: pref.length,
  };
}

/** Required skills weigh 2, preferred 1. No listed skills → neutral 50. */
export function skillsScore(m: SkillMatch): number {
  const denom = 2 * m.totalRequired + m.totalPreferred;
  if (!denom) return 50;
  return Math.round(((2 * m.matchedRequired + m.matchedPreferred) / denom) * 100);
}

export function overallScore(skills: number, experience: number, seniority: number): number {
  // Floored, so 40 / 60 / 70 gives 54 as in the scoring spec.
  return Math.floor(
    skills * SCORE_WEIGHTS.skills +
      experience * SCORE_WEIGHTS.experience +
      seniority * SCORE_WEIGHTS.seniority +
      1e-9, // keeps float error (79.9999…) from dropping a band
  );
}

export function verdictFor(score: number) {
  return VERDICT_BANDS.find((b) => score >= b.min) ?? VERDICT_BANDS[VERDICT_BANDS.length - 1];
}

const TITLE_NOISE = new Set(["senior", "sr", "junior", "jr", "lead", "i", "ii", "iii"]);

function titleWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9+#\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !TITLE_NOISE.has(w))
    .map((w) => (w === "developer" || w === "dev" ? "engineer" : w));
}

/** True when every JD title word appears in the CV headline or latest role. */
export function titleMatches(jdTitle: string, cvTitles: string[]): boolean {
  const need = titleWords(jdTitle);
  if (!need.length) return true;
  return cvTitles.some((t) => {
    const have = new Set(titleWords(t));
    return need.every((w) => have.has(w));
  });
}

export function resourcesFor(gaps: { skill: string }[]): ResourceCard[] {
  const cards: ResourceCard[] = [];
  if (gaps.some((g) => SYSTEM_DESIGN_KEYS.includes(skillKey(g.skill)))) {
    cards.push(RESOURCES.systemDesign);
  }
  cards.push(RESOURCES.interview);
  return cards;
}

export function closeTheGap(gaps: { skill: string; type: GapType }[]) {
  // gaps are already ordered required-first.
  return gaps.slice(0, 3).map((g) => ({
    title: TEMPLATES.closeGapTitle(g.skill),
    body: TEMPLATES.closeGapBody(g.skill, g.type),
  }));
}

export function topicsToLearn(gaps: { skill: string }[], extra: string[]): string[] {
  return uniqueCanonical([...gaps.map((g) => g.skill), ...extra]).slice(0, 4);
}

/** Normalized role key for the AI-risk lookup. */
export function roleKey(title: string): string {
  return titleWords(title).join(" ").trim() || "software engineer";
}
