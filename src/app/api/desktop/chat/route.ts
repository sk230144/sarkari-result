import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { logAiUsage, serviceDb } from "@/lib/server-auth";
import { hashKey, lookupKey } from "@/lib/access-key";
import { hasProAccessById } from "@/lib/payments/server";
import { InputError, LIMITS, parseChatInput, peekRequestId } from "@/lib/desktop/validate";
import { ChatError, askGemini, type ChatResult } from "@/lib/desktop/gemini";

/*
 * POST /api/desktop/chat — chat for the Job Alert 24 Electron app.
 *
 * Auth: Authorization: Bearer <access key> (the rotating key from /profile).
 * Every check (size, key, account, rate limits, input, daily limits, one
 * active request) runs before Gemini is called. Limits live in the
 * desktop_chat_requests table because Vercel instances share no memory.
 * Nothing sensitive is logged: no keys, auth headers, images or prompts.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAILY_REQUESTS = Number(process.env.DESKTOP_DAILY_REQUESTS) || 100;
const DAILY_TOKENS = Number(process.env.DESKTOP_DAILY_TOKENS) || 50_000;
const PER_MINUTE_USER = 12;
const PER_MINUTE_KEY = 12;
const PER_MINUTE_IP = 30;
/** A pending row older than this belongs to a run that died (the function limit is 60s). */
const STALE_MS = 70_000;
const REPLAY_MS = 24 * 3600_000;

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
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "DAILY_TOKEN_LIMIT_REACHED"
  | "GEMINI_REQUEST_FAILED"
  | "SERVICE_UNAVAILABLE"
  | "GEMINI_TIMEOUT";

function fail(status: number, requestId: string | null, code: Code, message: string, retryable = false) {
  return NextResponse.json({ ok: false, requestId, error: { code, message, retryable } }, { status, headers: HEADERS });
}

function success(requestId: string, data: ChatResult, expiresAt: string) {
  return NextResponse.json(
    { ok: true, requestId, data: { text: data.text, model: data.model, finishReason: data.finishReason, usage: data.usage }, access: { expiresAt: new Date(expiresAt).toISOString() } },
    { status: 200, headers: HEADERS },
  );
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const pepper = () => process.env.ACCESS_KEY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Failed-auth throttle per IP. Keys are ~144 random bits, so this is about
// abuse, not guessing; per instance is enough for that.
const authFails = new Map<string, number[]>();
function tooManyAuthFailures(ip: string, record: boolean) {
  const now = Date.now();
  const list = (authFails.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (record) list.push(now);
  authFails.set(ip, list);
  if (authFails.size > 5000) authFails.clear();
  return list.length > 20;
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: HEADERS });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = sha(`${pepper()}:ip:${ip}`).slice(0, 32);

  /* ---- size, then JSON ---- */
  if (Number(request.headers.get("content-length") ?? 0) > LIMITS.bodyBytes) {
    return fail(413, null, "PAYLOAD_TOO_LARGE", "The request is larger than 1.5 MB.");
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail(400, null, "INVALID_REQUEST", "Couldn't read the request body.");
  }
  if (Buffer.byteLength(raw) > LIMITS.bodyBytes) return fail(413, null, "PAYLOAD_TOO_LARGE", "The request is larger than 1.5 MB.");
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, null, "INVALID_REQUEST", "The body must be valid JSON.");
  }
  const rid = peekRequestId(body);

  /* ---- access key ---- */
  if (tooManyAuthFailures(ip, false)) return fail(429, rid, "RATE_LIMITED", "Too many attempts. Wait a minute and try again.", true);
  const key = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? "";
  if (!key) {
    tooManyAuthFailures(ip, true);
    return fail(401, rid, "ACCESS_KEY_INVALID", "Add your access key as: Authorization: Bearer <key>.");
  }
  const db = serviceDb();
  let access: Awaited<ReturnType<typeof lookupKey>>;
  try {
    access = await lookupKey(db, key);
  } catch {
    return fail(503, rid, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", true);
  }
  if (!access) {
    tooManyAuthFailures(ip, true);
    return fail(401, rid, "ACCESS_KEY_INVALID", "This access key isn't valid. Copy the current key from your Job Alert 24 profile.");
  }
  if (access.expired) {
    return fail(410, rid, "ACCESS_KEY_EXPIRED", "This access key has expired. Open your Job Alert 24 profile to get the new one.");
  }

  /* ---- account ---- */
  const { data: acct, error: acctErr } = await db.auth.admin.getUserById(access.userId);
  if (acctErr || !acct?.user) return fail(401, rid, "ACCESS_KEY_INVALID", "This access key isn't valid.");
  const bannedUntil = (acct.user as { banned_until?: string | null }).banned_until;
  if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) {
    return fail(403, rid, "USER_DISABLED", "This account has been disabled. Contact Job Alert 24 support.");
  }
  const userId = access.userId;
  if (!(await hasProAccessById(db, userId))) {
    return fail(403, rid, "PRO_REQUIRED", "This needs PRO+. Upgrade at jobalerts24.com/pricing.");
  }
  const keyFp = hashKey(key).slice(0, 16);

  /* ---- input ---- */
  let input: ReturnType<typeof parseChatInput>;
  try {
    input = parseChatInput(body);
  } catch (e) {
    if (e instanceof InputError) return fail(e.code === "PAYLOAD_TOO_LARGE" ? 413 : 400, rid, e.code, e.message);
    return fail(400, rid, "INVALID_REQUEST", "Invalid request.");
  }
  const requestId = input.requestId;

  /* ---- same requestId again: replay, wait, or retry ---- */
  const { data: prior, error: priorErr } = await db
    .from("desktop_chat_requests")
    .select("user_id, status, created_at, response")
    .eq("request_id", requestId)
    .maybeSingle();
  if (priorErr) return fail(503, requestId, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", true);
  let retrying = false;
  if (prior) {
    if (prior.user_id !== userId) return fail(400, requestId, "INVALID_REQUEST", "This requestId has already been used. Send a new UUID.");
    const age = Date.now() - new Date(prior.created_at as string).getTime();
    if (prior.status === "done" && prior.response && age < REPLAY_MS) {
      // The answer already exists: return it without calling Gemini again.
      return success(requestId, prior.response as ChatResult, access.expiresAt);
    }
    if (prior.status === "pending" && age < STALE_MS) {
      return fail(429, requestId, "RATE_LIMITED", "This request is still being processed. Try again in a few seconds.", true);
    }
    retrying = true;
  }

  /* ---- rate and daily limits ---- */
  const now = Date.now();
  const [recent, byIp] = await Promise.all([
    db
      .from("desktop_chat_requests")
      .select("request_id, status, created_at, total_tokens, key_fp")
      .eq("user_id", userId)
      .gte("created_at", new Date(now - 24 * 3600_000).toISOString())
      .limit(2000),
    db
      .from("desktop_chat_requests")
      .select("request_id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", new Date(now - 60_000).toISOString()),
  ]);
  if (recent.error || byIp.error) return fail(503, requestId, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", true);
  const rows = (recent.data ?? []).filter((r) => r.request_id !== requestId);
  const lastMinute = rows.filter((r) => now - new Date(r.created_at as string).getTime() < 60_000);
  if (lastMinute.length >= PER_MINUTE_USER || lastMinute.filter((r) => r.key_fp === keyFp).length >= PER_MINUTE_KEY || (byIp.count ?? 0) >= PER_MINUTE_IP) {
    return fail(429, requestId, "RATE_LIMITED", "Too many requests. Wait a minute and try again.", true);
  }
  if (!isAdminEmail(acct.user.email)) {
    if (rows.length >= DAILY_REQUESTS) {
      return fail(429, requestId, "DAILY_TOKEN_LIMIT_REACHED", `You've used today's ${DAILY_REQUESTS} requests. The limit resets within 24 hours.`);
    }
    const tokens = rows.reduce((n, r) => n + ((r.total_tokens as number) ?? 0), 0);
    if (tokens >= DAILY_TOKENS) {
      return fail(429, requestId, "DAILY_TOKEN_LIMIT_REACHED", "You've used today's AI allowance. It resets within 24 hours.");
    }
  }
  const othersActive = () =>
    rows.some((r) => r.status === "pending" && now - new Date(r.created_at as string).getTime() < STALE_MS);
  if (othersActive()) return fail(429, requestId, "RATE_LIMITED", "Another request is still running. Wait for it to finish.", true);

  /* ---- claim the requestId (the unique key stops duplicate Gemini calls) ---- */
  const claim = {
    status: "pending",
    error_code: null,
    key_fp: keyFp,
    ip_hash: ipHash,
    device_id: input.deviceId,
    app_version: input.appVersion,
    created_at: new Date().toISOString(),
  };
  if (retrying) {
    const { data: took } = await db
      .from("desktop_chat_requests")
      .update(claim)
      .eq("request_id", requestId)
      .eq("user_id", userId)
      .or(`status.eq.failed,created_at.lt.${new Date(Date.now() - STALE_MS).toISOString()}`)
      .select("request_id")
      .maybeSingle();
    if (!took) return fail(429, requestId, "RATE_LIMITED", "This request is still being processed. Try again in a few seconds.", true);
  } else {
    const { error: insErr } = await db.from("desktop_chat_requests").insert({ request_id: requestId, user_id: userId, ...claim });
    if (insErr) {
      if (insErr.code === "23505") return fail(429, requestId, "RATE_LIMITED", "This request is still being processed. Try again in a few seconds.", true);
      return fail(503, requestId, "SERVICE_UNAVAILABLE", "The service is temporarily unavailable.", true);
    }
  }

  // Two requests racing past the check above both see each other here; both back off.
  const { count: racing } = await db
    .from("desktop_chat_requests")
    .select("request_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "pending")
    .neq("request_id", requestId)
    .gte("created_at", new Date(Date.now() - STALE_MS).toISOString());
  if ((racing ?? 0) > 0) {
    await db.from("desktop_chat_requests").delete().eq("request_id", requestId).eq("status", "pending");
    return fail(429, requestId, "RATE_LIMITED", "Another request is still running. Wait for it to finish.", true);
  }

  /* ---- Gemini ---- */
  try {
    const result = await askGemini(input);
    await Promise.all([
      db
        .from("desktop_chat_requests")
        .update({
          status: "done",
          model: result.model,
          finish_reason: result.finishReason,
          input_tokens: result.usage.inputTokens,
          output_tokens: result.usage.outputTokens,
          thinking_tokens: result.usage.thinkingTokens,
          cached_tokens: result.usage.cachedTokens,
          total_tokens: result.usage.totalTokens,
          response: result,
          finished_at: new Date().toISOString(),
        })
        .eq("request_id", requestId),
      logAiUsage(db, userId, "desktop_chat", result.model, {
        input: result.usage.inputTokens,
        output: result.usage.outputTokens,
        thinking: result.usage.thinkingTokens,
      }),
    ]);
    return success(requestId, result, access.expiresAt);
  } catch (e) {
    const err =
      e instanceof ChatError ? e : new ChatError("GEMINI_REQUEST_FAILED", 502, "Something went wrong. Please try again.", true);
    if (!(e instanceof ChatError)) console.error("desktop chat: unexpected", (e as Error)?.name);
    await db
      .from("desktop_chat_requests")
      .update({
        status: "failed",
        error_code: err.code,
        input_tokens: err.usage?.inputTokens ?? 0,
        output_tokens: err.usage?.outputTokens ?? 0,
        thinking_tokens: err.usage?.thinkingTokens ?? 0,
        total_tokens: err.usage?.totalTokens ?? 0,
        finished_at: new Date().toISOString(),
      })
      .eq("request_id", requestId);
    return fail(err.status, requestId, err.code, err.message, err.retryable);
  } finally {
    // Now and then, drop rows past the replay and limit windows.
    if (Math.random() < 0.05) {
      await db.from("desktop_chat_requests").delete().lt("created_at", new Date(Date.now() - 48 * 3600_000).toISOString());
    }
  }
}
