import { createHash } from "crypto";
import { after, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin";
import { serviceDb } from "@/lib/server-auth";
import { lookupKey } from "@/lib/access-key";
import { hasProAccess } from "@/lib/payments/server";
import { InputError, TOKEN_BODY_BYTES, parseTokenInput } from "@/lib/desktop/validate";
import { TRANSCRIPTION_MODEL, TokenError, createRealtimeToken } from "@/lib/desktop/elevenlabs";

/*
 * POST /api/desktop/transcription-token — a single-use ElevenLabs token for
 * realtime transcription (Scribe v2 Realtime) in the Job Alert 24 Electron app.
 *
 * Auth: Authorization: Bearer <access key> (the rotating key from /profile).
 * Every check (size, key, account, input, rate and daily limits) runs before
 * ElevenLabs is called. The token goes straight back to the app and is never
 * stored, cached or logged; neither is ELEVENLABS_API_KEY. Limits live in the
 * desktop_transcription_requests table because Vercel instances share no memory.
 *
 * A requestId is good for one token. The token isn't kept, so a repeated
 * requestId can't be answered again: after a failure, retry with a new UUID.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Tokens per user per rolling 24 h (admins are exempt). */
const DAILY_PER_USER = Number(process.env.DESKTOP_TRANSCRIPTION_DAILY_PER_USER) || 100;
/** Tokens across all users per rolling 24 h: a backstop under the ElevenLabs spending limit. */
const DAILY_GLOBAL = Number(process.env.DESKTOP_TRANSCRIPTION_DAILY_GLOBAL) || 2000;
/** At most one token per user in this window. */
const MIN_GAP_MS = 10_000;
/** Attempts per minute, failed ones included. */
const PER_MINUTE_USER = 10;
const PER_MINUTE_DEVICE = 10;
const PER_MINUTE_IP = 30;
/** A pending row older than this belongs to a run that died (the function limit is 30s). */
const STALE_MS = 40_000;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 3600_000;
const TABLE = "desktop_transcription_requests";

const HEADERS = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type Code =
  | "INVALID_REQUEST"
  | "ACCESS_KEY_INVALID"
  | "USER_DISABLED"
  | "PRO_REQUIRED"
  | "ACCESS_KEY_EXPIRED"
  | "RATE_LIMITED"
  | "DAILY_LIMIT_REACHED"
  | "SERVICE_LIMIT_REACHED"
  | TokenError["code"];

function fail(status: number, code: Code, message: string, retryable = false, retryAfterSec?: number) {
  const headers = retryAfterSec ? { ...HEADERS, "Retry-After": String(retryAfterSec) } : HEADERS;
  return NextResponse.json({ ok: false, error: { code, message, retryable } }, { status, headers });
}

const unavailable = () => fail(503, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", true);

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const pepper = () => process.env.ACCESS_KEY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Failed-auth throttle per IP. Keys are ~144 random bits, so this is about
// abuse, not guessing; per instance is enough for that.
const authFails = new Map<string, number[]>();
function tooManyAuthFailures(ip: string, record: boolean) {
  const now = Date.now();
  const list = (authFails.get(ip) ?? []).filter((t) => now - t < MINUTE_MS);
  if (record) list.push(now);
  authFails.set(ip, list);
  if (authFails.size > 5000) authFails.clear();
  return list.length > 20;
}

/** Records how a claimed request ended. Never the token: only that one was issued. */
async function settle(db: SupabaseClient, requestId: string, status: "issued" | "failed", errorCode: string | null = null) {
  const { error } = await db
    .from(TABLE)
    .update({ status, error_code: errorCode, finished_at: new Date().toISOString() })
    .eq("request_id", requestId);
  if (error) console.error("desktop transcription: settle failed", error.code);
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = sha(`${pepper()}:ip:${ip}`).slice(0, 32);

  /* ---- size, then JSON ---- */
  if (Number(request.headers.get("content-length") ?? 0) > TOKEN_BODY_BYTES) {
    return fail(400, "INVALID_REQUEST", "The request body is too large.");
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, "INVALID_REQUEST", "Couldn't read the request body.");
  }
  if (Buffer.byteLength(raw) > TOKEN_BODY_BYTES) return fail(400, "INVALID_REQUEST", "The request body is too large.");
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, "INVALID_REQUEST", "The body must be valid JSON.");
  }

  /* ---- access key ---- */
  if (tooManyAuthFailures(ip, false)) return fail(429, "RATE_LIMITED", "Too many attempts. Wait a minute and try again.", true, 60);
  const key = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? "";
  if (!key) {
    tooManyAuthFailures(ip, true);
    return fail(401, "ACCESS_KEY_INVALID", "Add your access key as: Authorization: Bearer <key>.");
  }
  const db = serviceDb();
  let access: Awaited<ReturnType<typeof lookupKey>>;
  try {
    access = await lookupKey(db, key);
  } catch {
    return unavailable();
  }
  if (!access) {
    tooManyAuthFailures(ip, true);
    return fail(401, "ACCESS_KEY_INVALID", "This access key isn't valid. Copy the current key from your Job Alert 24 profile.");
  }
  if (access.expired) {
    return fail(410, "ACCESS_KEY_EXPIRED", "This access key has expired. Open your Job Alert 24 profile to get the new one.");
  }

  /* ---- account ---- */
  const { data: acct, error: acctErr } = await db.auth.admin.getUserById(access.userId);
  if (acctErr) return unavailable();
  if (!acct?.user) return fail(401, "ACCESS_KEY_INVALID", "This access key isn't valid.");
  const bannedUntil = (acct.user as { banned_until?: string | null }).banned_until;
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
    return fail(403, "USER_DISABLED", "This account has been disabled. Contact Job Alert 24 support.");
  }
  if (!(await hasProAccess(db, acct.user))) {
    return fail(403, "PRO_REQUIRED", "This needs PRO+. Upgrade at jobalerts24.com/pricing.");
  }
  const userId = access.userId;

  /* ---- input ---- */
  let input: ReturnType<typeof parseTokenInput>;
  try {
    input = parseTokenInput(body);
  } catch (e) {
    return fail(400, "INVALID_REQUEST", e instanceof InputError ? e.message : "Invalid request.");
  }

  /* ---- rate and daily limits ---- */
  const now = Date.now();
  const since = (ms: number) => new Date(now - ms).toISOString();
  const [recent, userDay, byDevice, byIp, globalDay] = await Promise.all([
    db
      .from(TABLE)
      .select("request_id, status, created_at")
      .eq("user_id", userId)
      .gte("created_at", since(MINUTE_MS))
      .order("created_at", { ascending: false }),
    db.from(TABLE).select("request_id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "failed").gte("created_at", since(DAY_MS)),
    db.from(TABLE).select("request_id", { count: "exact", head: true }).eq("device_id", input.deviceId).gte("created_at", since(MINUTE_MS)),
    db.from(TABLE).select("request_id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since(MINUTE_MS)),
    db.from(TABLE).select("request_id", { count: "exact", head: true }).neq("status", "failed").gte("created_at", since(DAY_MS)),
  ]);
  if (recent.error || userDay.error || byDevice.error || byIp.error || globalDay.error) return unavailable();
  const rows = recent.data ?? [];
  const age = (r: { created_at: unknown }) => now - new Date(r.created_at as string).getTime();

  const prior = rows.find((r) => r.request_id === input.requestId);
  if (prior) {
    return prior.status === "pending" && age(prior) < STALE_MS
      ? fail(429, "RATE_LIMITED", "This request is still being processed. Try again in a few seconds.", true, 2)
      : fail(400, "INVALID_REQUEST", "This requestId has already been used. Send a new UUID.");
  }
  if (rows.length >= PER_MINUTE_USER || (byDevice.count ?? 0) >= PER_MINUTE_DEVICE || (byIp.count ?? 0) >= PER_MINUTE_IP) {
    return fail(429, "RATE_LIMITED", "Too many requests. Wait a minute and try again.", true, 60);
  }
  // Newest first, so the first live row is the latest token issued (or being issued).
  const latest = rows.find((r) => r.status !== "failed");
  if (latest && age(latest) < MIN_GAP_MS) {
    const wait = Math.min(MIN_GAP_MS / 1000, Math.max(1, Math.ceil((MIN_GAP_MS - age(latest)) / 1000)));
    return fail(429, "RATE_LIMITED", `Only one transcription token every 10 seconds. Try again in ${wait}s.`, true, wait);
  }
  if (!isAdminEmail(acct.user.email) && (userDay.count ?? 0) >= DAILY_PER_USER) {
    return fail(429, "DAILY_LIMIT_REACHED", `You've used today's ${DAILY_PER_USER} transcription sessions. The limit resets within 24 hours.`);
  }
  if ((globalDay.count ?? 0) >= DAILY_GLOBAL) {
    return fail(429, "SERVICE_LIMIT_REACHED", "Transcription has reached its daily capacity. Please try again later.");
  }

  /* ---- claim the requestId (the primary key stops it being used twice) ---- */
  const { error: insErr } = await db.from(TABLE).insert({
    request_id: input.requestId,
    user_id: userId,
    device_id: input.deviceId,
    ip_hash: ipHash,
    app_version: input.appVersion,
    created_at: new Date().toISOString(),
  });
  if (insErr) {
    if (insErr.code === "23505") return fail(400, "INVALID_REQUEST", "This requestId has already been used. Send a new UUID.");
    return unavailable();
  }

  // Now and then, after the response, drop rows past every limit window.
  if (Math.random() < 0.05) {
    after(async () => {
      await db.from(TABLE).delete().lt("created_at", new Date(Date.now() - 2 * DAY_MS).toISOString());
    });
  }

  // Two requests racing past the 10-second check both see each other here; both back off.
  const { count: racing, error: raceErr } = await db
    .from(TABLE)
    .select("request_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .neq("status", "failed")
    .neq("request_id", input.requestId)
    .gte("created_at", new Date(Date.now() - MIN_GAP_MS).toISOString());
  if (raceErr || (racing ?? 0) > 0) {
    await db.from(TABLE).delete().eq("request_id", input.requestId).eq("status", "pending");
    return raceErr
      ? unavailable()
      : fail(429, "RATE_LIMITED", "Another token request is already running. Try again in a few seconds.", true, MIN_GAP_MS / 1000);
  }

  /* ---- ElevenLabs ---- */
  let issued: Awaited<ReturnType<typeof createRealtimeToken>>;
  try {
    issued = await createRealtimeToken();
  } catch (e) {
    const err =
      e instanceof TokenError ? e : new TokenError("ELEVENLABS_REQUEST_FAILED", 502, "Something went wrong. Please try again.", true);
    if (!(e instanceof TokenError)) console.error("desktop transcription: unexpected", (e as Error)?.name);
    await settle(db, input.requestId, "failed", err.code);
    return fail(err.status, err.code, err.message, err.retryable);
  }
  await settle(db, input.requestId, "issued");
  return NextResponse.json(
    { ok: true, data: { token: issued.token, expiresAt: issued.expiresAt, model: TRANSCRIPTION_MODEL } },
    { status: 200, headers: HEADERS },
  );
}
