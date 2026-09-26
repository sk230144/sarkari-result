import "server-only";
import { createHash, createHmac } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Rotating access keys.
 *
 * Every user's timeline is cut into 12-hour windows counted from when their
 * account was created. The key for a window is an HMAC of (user, window
 * start) under a server secret, so it can be shown again at any time in that
 * window without being stored. The database keeps only its SHA-256 hash and
 * expiry, which is what verification looks up. No cron job: the next key is
 * written the first time it's asked for, and an old key dies at its expiry
 * whether or not anyone asked.
 */

export const KEY_TTL_MS = 12 * 60 * 60 * 1000;
export const ACCESS_KEY = /^ja24_[A-Za-z0-9_-]{24}$/;

function secret() {
  const s = process.env.ACCESS_KEY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) throw new Error("ACCESS_KEY_SECRET is not set");
  return s;
}

export const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

/** The current window for a user: [issuedAt, expiresAt). */
export function currentWindow(anchorIso: string, now = Date.now()) {
  const anchor = new Date(anchorIso).getTime() || 0;
  const n = Math.max(0, Math.floor((now - anchor) / KEY_TTL_MS));
  const issuedAt = new Date(anchor + n * KEY_TTL_MS);
  return { issuedAt, expiresAt: new Date(issuedAt.getTime() + KEY_TTL_MS) };
}

function deriveKey(userId: string, issuedAt: Date) {
  const mac = createHmac("sha256", secret()).update(`access-key:v1:${userId}:${issuedAt.toISOString()}`).digest();
  return `ja24_${mac.subarray(0, 18).toString("base64url")}`;
}

/**
 * The user's key for the current window, recording its hash so it verifies.
 * Idempotent: the same window always yields the same key and row, so two tabs
 * opening at once can't overwrite each other.
 */
export async function issueKey(db: SupabaseClient, userId: string, anchorIso: string) {
  const { issuedAt, expiresAt } = currentWindow(anchorIso);
  const key = deriveKey(userId, issuedAt);
  const { error } = await db.from("user_access_keys").upsert(
    {
      user_id: userId,
      key_hash: hashKey(key),
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  return { key, issuedAt: issuedAt.toISOString(), expiresAt: expiresAt.toISOString() };
}

/** The owner of a key, if the key is well-formed, current and unexpired. */
export async function verifyKey(db: SupabaseClient, key: string) {
  if (!ACCESS_KEY.test(key)) return null;
  const { data } = await db
    .from("user_access_keys")
    .select("user_id, expires_at")
    .eq("key_hash", hashKey(key))
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ? { userId: data.user_id as string, expiresAt: data.expires_at as string } : null;
}
