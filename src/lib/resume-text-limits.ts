/**
 * Input caps shared by the browser (word counters, maxLength) and the server
 * (hard rejection in resume-text.ts / the AI generation routes). Kept in a
 * plain module with no server-only imports so client components can use the
 * same numbers the server enforces, instead of a second guess at them.
 */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const RESUME_MAX_CHARS = 20_000;
export const JOB_DESCRIPTION_MAX_CHARS = 6_000;
