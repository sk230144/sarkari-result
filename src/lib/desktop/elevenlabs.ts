import "server-only";

/** The realtime model the token is for; the app passes it when it opens the socket. */
export const TRANSCRIPTION_MODEL = "scribe_v2_realtime";

/** ElevenLabs single-use tokens expire 15 minutes after they're created. */
const TOKEN_TTL_MS = 15 * 60_000;
const ELEVENLABS_TIMEOUT_MS = 10_000;

export class TokenError extends Error {
  constructor(
    public code: "ELEVENLABS_REQUEST_FAILED" | "ELEVENLABS_TIMEOUT" | "SERVICE_UNAVAILABLE",
    public status: number,
    message: string,
    public retryable: boolean,
  ) {
    super(message);
  }
}

const isTimeout = (e: unknown) => (e as Error)?.name === "TimeoutError" || (e as Error)?.name === "AbortError";

/**
 * A fresh single-use realtime_scribe token. The caller hands it straight to
 * the app: it must never be stored, cached or logged, and neither may the
 * API key (only HTTP statuses go to the logs).
 */
export async function createRealtimeToken(): Promise<{ token: string; expiresAt: string }> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new TokenError("SERVICE_UNAVAILABLE", 503, "Transcription isn't configured.", false);

  // Taken before the call, so the expiry we report is never later than the real one.
  const requestedAt = Date.now();
  let json: { token?: unknown };
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", {
      method: "POST",
      headers: { "xi-api-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(ELEVENLABS_TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("desktop transcription: elevenlabs http", res.status);
      if (res.status === 429) throw new TokenError("SERVICE_UNAVAILABLE", 503, "Transcription is busy. Please try again shortly.", true);
      // Bad key, quota used up or spending limit reached: our side to fix, not the user's.
      if (res.status === 401 || res.status === 402 || res.status === 403) {
        throw new TokenError("SERVICE_UNAVAILABLE", 503, "Transcription isn't available right now.", false);
      }
      throw new TokenError("ELEVENLABS_REQUEST_FAILED", 502, "Couldn't start transcription. Please try again.", res.status >= 500);
    }
    json = await res.json();
  } catch (e) {
    if (e instanceof TokenError) throw e;
    throw isTimeout(e)
      ? new TokenError("ELEVENLABS_TIMEOUT", 504, "Transcription took too long to start. Please try again.", true)
      : new TokenError("ELEVENLABS_REQUEST_FAILED", 502, "Couldn't reach the transcription service. Please try again.", true);
  }

  const token = json?.token;
  if (typeof token !== "string" || !token || token.length > 4096) {
    throw new TokenError("ELEVENLABS_REQUEST_FAILED", 502, "The transcription service sent an unreadable reply.", true);
  }
  return { token, expiresAt: new Date(requestedAt + TOKEN_TTL_MS).toISOString() };
}
