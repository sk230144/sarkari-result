import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";

/**
 * Server-side compiler for languages the browser can't run (Java, C++, C, Go),
 * via a Judge0 instance: RapidAPI's hosted Judge0 CE or a self-hosted one.
 *
 *   JUDGE0_URL = https://judge0-ce.p.rapidapi.com   (or your own host)
 *   JUDGE0_KEY = <RapidAPI key>                     (omit for self-hosted)
 */
const JUDGE0_URL = process.env.JUDGE0_URL?.replace(/\/$/, "");
const JUDGE0_KEY = process.env.JUDGE0_KEY;

// Judge0 CE language ids.
const LANGUAGE_IDS: Record<string, number> = { java: 62, cpp: 54, c: 50, go: 60, python: 71, javascript: 63 };

const RUNS_PER_MINUTE = 20;
const recent = new Map<string, number[]>();

export async function GET() {
  return NextResponse.json({ server: Boolean(JUDGE0_URL) });
}

/** Body: { language, code, stdin } */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!JUDGE0_URL) {
    return NextResponse.json(
      { error: "The server compiler isn't set up yet. Use JavaScript or Python, which run in your browser." },
      { status: 501 },
    );
  }

  // Simple per-user burst limit (per server instance).
  const now = Date.now();
  const hits = (recent.get(user.id) ?? []).filter((t) => now - t < 60_000);
  if (hits.length >= RUNS_PER_MINUTE) return NextResponse.json({ error: "Too many runs. Wait a few seconds." }, { status: 429 });
  hits.push(now);
  recent.set(user.id, hits);

  let b: { language?: unknown; code?: unknown; stdin?: unknown };
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const languageId = typeof b.language === "string" ? LANGUAGE_IDS[b.language] : undefined;
  const code = typeof b.code === "string" ? b.code : "";
  const stdin = typeof b.stdin === "string" ? b.stdin.slice(0, 10_000) : "";
  if (!languageId) return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  if (!code.trim() || code.length > 10_000) return NextResponse.json({ error: "Code is empty or too long." }, { status: 400 });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (JUDGE0_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_KEY;
    headers["X-RapidAPI-Host"] = new URL(JUDGE0_URL).host;
  }

  try {
    const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: Buffer.from(code).toString("base64"),
        stdin: Buffer.from(stdin).toString("base64"),
        cpu_time_limit: 5,
        memory_limit: 256000,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const j = await res.json();
    if (!res.ok) return NextResponse.json({ error: "The compiler couldn't run this. Try again." }, { status: 502 });
    const dec = (s: string | null) => (s ? Buffer.from(s, "base64").toString("utf8") : "");
    return NextResponse.json({
      stdout: dec(j.stdout),
      stderr: dec(j.stderr) || dec(j.compile_output) || (j.status?.id > 3 ? j.status?.description ?? "" : ""),
      timeMs: j.time ? Math.round(Number(j.time) * 1000) : null,
    });
  } catch {
    return NextResponse.json({ error: "The compiler timed out. Check for infinite loops." }, { status: 504 });
  }
}
