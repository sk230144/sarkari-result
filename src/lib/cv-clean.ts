import { CV_CLEAN_MAX_CHARS, type CvContact } from "./cover-letter-config";

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL =
  /\b(?:https?:\/\/|www\.)[^\s|,;()<>]+|\b(?:linkedin\.com|github\.com|gitlab\.com|leetcode\.com|codeforces\.com|codechef\.com|hackerrank\.com|kaggle\.com|medium\.com|behance\.net|dribbble\.com)\/[^\s|,;()<>]*/gi;
// Broad on purpose; matches are only treated as phones if they hold 10-13
// digits, which keeps date ranges like 2019-2023 out.
const PHONE_CANDIDATE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,5}\)[\s.-]?)?\d{3,5}[\s.-]?\d{3,5}(?:[\s.-]?\d{2,5})?/g;

const PERSONAL_LINE =
  /^(?:date of birth|d\.?\s?o\.?\s?b\.?|birth\s?date|age|father'?s?\s*name|mother'?s?\s*name|husband'?s?\s*name|guardian'?s?\s*name|marital\s*status|religion|caste|category|gender|sex|nationality|citizenship|blood\s*group|passport(?:\s*no\.?)?|permanent\s*address|present\s*address|address|pin\s?code)\b\s*[:\-–]/i;
const PERSONAL_HEADING = /^personal\s+(?:details|information|data|particulars)\s*:?$/i;
const DECLARATION = /^declaration\s*:?$|hereby\s+declare/i;
const REFERENCES = /references?\s*(?:are\s*)?(?:will be\s*)?(?:available|furnished|provided)\s*(?:up)?on\s*request/i;
const PAGE_NUMBER = /^(?:page\s*)?\d{1,2}(?:\s*(?:of|\/)\s*\d{1,2})?$/i;
const BULLET = /^[\s•●▪◦■□➢►▶✓✔\-*–—·‣⁃o](?=\s)\s*|^[•●▪◦■□➢►▶✓✔‣⁃]+\s*/;
const TITLE_WORDS = /^(?:resume|curriculum vitae|cv|bio[- ]?data)$/i;

function digitCount(s: string) {
  return (s.match(/\d/g) ?? []).length;
}

function guessName(raw: string): string | null {
  for (const line of raw.split("\n").slice(0, 6)) {
    const t = line.trim();
    if (!t || TITLE_WORDS.test(t)) continue;
    const words = t.split(/\s+/);
    if (t.length <= 40 && words.length >= 2 && words.length <= 4 && /^[A-Za-z .'-]+$/.test(t)) {
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    }
    return null;
  }
  return null;
}

/**
 * Turns raw resume text into what the model needs and nothing more.
 *
 * Contact details are pulled out and returned separately (the app adds them
 * back to the finished letter), and personal data a cover letter never uses
 * — DOB, parents' names, religion, caste and the like — is dropped so it is
 * never sent to a third-party API.
 */
export function cleanCv(raw: string): { text: string; contact: CvContact } {
  const normalized = raw.replace(/\r\n?/g, "\n");

  const email = normalized.match(EMAIL)?.[0] ?? null;
  const phone =
    (normalized.match(PHONE_CANDIDATE) ?? []).find((m) => {
      const d = digitCount(m);
      return d >= 10 && d <= 13;
    }) ?? null;
  const links = [...new Set((normalized.match(URL) ?? []).map((l) => l.replace(/[.)]+$/, "")))];

  let lines = normalized
    .replace(EMAIL, " ")
    .replace(URL, " ")
    .replace(PHONE_CANDIDATE, (m) => {
      const d = digitCount(m);
      return d >= 10 && d <= 13 ? " " : m;
    })
    .split("\n")
    .map((l) => l.replace(BULLET, "").replace(/\s*\|\s*/g, " · ").replace(/[ \t]+/g, " ").trim());

  // Declarations sit at the end and are followed by place/date/signature,
  // so when one appears in the back half everything after it goes too.
  const declIdx = lines.findIndex((l) => DECLARATION.test(l));
  if (declIdx !== -1 && declIdx > lines.length / 2) lines = lines.slice(0, declIdx);

  lines = lines.filter(
    (l) =>
      /[A-Za-z0-9]/.test(l) &&
      !PERSONAL_LINE.test(l) &&
      !PERSONAL_HEADING.test(l) &&
      !DECLARATION.test(l) &&
      !REFERENCES.test(l) &&
      !PAGE_NUMBER.test(l) &&
      !TITLE_WORDS.test(l),
  );

  let text = lines
    .map((l) => l.replace(/^[·,\s]+|[·,\s]+$/g, ""))
    .filter(Boolean)
    .join("\n");

  if (text.length > CV_CLEAN_MAX_CHARS) {
    const cut = text.lastIndexOf("\n", CV_CLEAN_MAX_CHARS);
    text = text.slice(0, cut > CV_CLEAN_MAX_CHARS * 0.8 ? cut : CV_CLEAN_MAX_CHARS);
  }

  return {
    text,
    contact: { name: guessName(normalized), email, phone: phone?.trim() ?? null, links },
  };
}
