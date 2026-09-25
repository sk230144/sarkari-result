import { JD_CLEAN_MAX_CHARS } from "./cover-letter-config";

// Sections whose whole body is dropped: none of it helps write the letter.
const DROP_SECTION =
  /^(?:benefits|perks|what we offer|what you'?ll get|why (?:join|work)|compensation|salary|pay(?:\s*range)?|ctc|equal (?:employment )?opportunit|eeo|diversity|inclusion|how to apply|application process|to apply|apply now|disclaimer|note to (?:applicants|recruiters))/i;

const DROP_LINE =
  /₹|\$\s?\d|\bINR\b|\bLPA\b|\bCTC\b|per annum|stipend|salary|equal opportunity employer|regardless of (?:race|gender|religion|age)|(?:do not|don't) discriminate|apply (?:now|here|via|through|at)|send (?:your|us your) (?:resume|cv)|click (?:on )?apply|interested candidates|health insurance|paid (?:time off|leave)|flexible (?:hours|working)|free (?:lunch|meals|snacks)|wellness/i;

// Headings that clearly start useful content, so they end a dropped section
// even without a trailing colon.
const KEEP_SECTION =
  /^(?:about|overview|job description|the role|role|responsibilit|what you'?ll do|what you will do|requirements|qualifications|skills|who you are|you have|must have|nice to have|preferred|experience|tech stack)/i;

const BULLET = /^[\s•●▪◦■□➢►▶✓✔\-*–—·‣⁃]+\s*/;

function isHeading(line: string, hadBullet: boolean) {
  if (hadBullet || line.length > 60) return false;
  if (line.endsWith(":")) return true;
  return line.split(/\s+/).length <= 6 && !/[.!?,;]$/.test(line) && /^[A-Z]/.test(line);
}

/**
 * Keeps requirements, responsibilities and a line or two about the company
 * (the Believer style needs the mission), and drops perks, pay, EEO
 * boilerplate and application instructions.
 */
export function cleanJobDescription(raw: string): string {
  const out: string[] = [];
  let dropping = false;

  for (const original of raw.replace(/\r\n?/g, "\n").split("\n")) {
    const hadBullet = BULLET.test(original) && original.trim().length > 0;
    const line = original.replace(BULLET, "").replace(/[ \t]+/g, " ").trim();
    if (!line) continue;

    if (DROP_LINE.test(line)) continue;

    if (isHeading(line, hadBullet)) {
      if (DROP_SECTION.test(line)) {
        dropping = true;
        continue;
      }
      // Inside a dropped section, a short plain line is more likely a perk
      // than a new heading, so only a clear heading ends the drop.
      if (dropping && !line.endsWith(":") && !KEEP_SECTION.test(line)) continue;
      dropping = false;
      out.push(line);
      continue;
    }
    if (dropping) continue;
    out.push(line);
  }

  let text = out.join("\n");
  if (text.length > JD_CLEAN_MAX_CHARS) {
    const cut = text.lastIndexOf("\n", JD_CLEAN_MAX_CHARS);
    text = text.slice(0, cut > JD_CLEAN_MAX_CHARS * 0.8 ? cut : JD_CLEAN_MAX_CHARS);
  }
  return text;
}
