import "server-only";
import { RESUME_MAX_BYTES, RESUME_MAX_CHARS } from "./resume-text-limits";

export { RESUME_MAX_BYTES, RESUME_MAX_CHARS };

export class ResumeTextError extends Error {}

/**
 * Extracts plain text from an uploaded resume PDF, capped defensively at
 * every stage: byte size before parsing, character count after.
 *
 * Truncating rather than rejecting an over-length resume is deliberate — a
 * genuine resume that runs slightly long should still get a usable letter,
 * just from its first ~20k characters, rather than a hard failure.
 */
export async function extractResumeText(buffer: Buffer): Promise<string> {
  if (buffer.byteLength === 0) {
    throw new ResumeTextError("The resume file is empty.");
  }
  if (buffer.byteLength > RESUME_MAX_BYTES) {
    throw new ResumeTextError("The resume PDF is over 5 MB.");
  }

  // Import pdf-parse's inner module directly rather than its package entry
  // point. The published entry (index.js) checks `!module.parent` to decide
  // whether it's being "required directly" and, if so, runs a leftover debug
  // block that reads a fixture file from the package's own test/ directory —
  // that check is true whenever this is loaded via ESM dynamic import (as
  // Next.js does here), so going through the real entry throws an ENOENT for
  // a file that doesn't exist in this project at all.
  const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");

  let text: string;
  try {
    const result = await pdfParse(buffer);
    text = result.text ?? "";
  } catch {
    throw new ResumeTextError(
      "Could not read that PDF. It may be scanned, image-only, or corrupted.",
    );
  }

  text = normalizeExtractedText(text);

  if (text.length < 30) {
    throw new ResumeTextError(
      "Could not find readable text in that PDF. Scanned/image-only resumes are not supported yet.",
    );
  }

  return truncate(text, RESUME_MAX_CHARS);
}

function normalizeExtractedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncate(text: string, maxChars: number): string {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}
