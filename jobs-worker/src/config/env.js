import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");

/**
 * Minimal .env reader — the worker has no dotenv dependency, and on the
 * server PM2 may supply the variables directly, so a missing file is fine.
 */
function loadEnvFile(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return {};
  }
  const out = {};
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let value = t.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

// Real environment wins over the file, so PM2/systemd can override.
const fileEnv = {
  ...loadEnvFile(join(ROOT, "..", ".env.local")),
  ...loadEnvFile(join(ROOT, ".env")),
};
const env = { ...fileEnv, ...process.env };

function required(key) {
  const v = env[key];
  if (!v) {
    throw new Error(
      `Missing required env var ${key}. Set it in jobs-worker/.env (see .env.example).`,
    );
  }
  return v;
}

export const config = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
  // Server-side only. Never expose this to a browser (§16).
  supabaseServiceKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  adzuna: {
    appId: env.ADZUNA_APP_ID || null,
    appKey: env.ADZUNA_APP_KEY || null,
  },

  http: {
    timeoutMs: Number(env.HTTP_TIMEOUT_MS || 15_000),
    // A descriptive User-Agent is required by several providers (§16).
    userAgent:
      env.HTTP_USER_AGENT ||
      "Jobs24-Ingestion/1.0 (+https://jobalert24.com; contact: support@jobalert24.com)",
    maxAttempts: Number(env.HTTP_MAX_ATTEMPTS || 3),
    concurrency: Number(env.FETCH_CONCURRENCY || 4),
  },

  /** Jobs older than this with no sighting become stale (§11). */
  freshnessDays: Number(env.FRESHNESS_DAYS || 30),
  /** How many complete misses before a job is marked stale (§11.2). */
  missedRunsBeforeStale: Number(env.MISSED_RUNS_BEFORE_STALE || 2),

  dryRun: process.argv.includes("--dry-run"),
};

export default config;
