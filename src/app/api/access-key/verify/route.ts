import { NextResponse } from "next/server";
import { serviceDb } from "@/lib/server-auth";
import { verifyKey } from "@/lib/access-key";
import { hasProAccessById } from "@/lib/payments/server";

export const dynamic = "force-dynamic";

/*
 * Public: checks a user's access key and returns their name.
 *
 *   POST /api/access-key/verify
 *   Body:   { "key": "ja24_..." }        or header  Authorization: Bearer ja24_...
 *   200     { "valid": true, "name": "Priya Sharma", "expiresAt": "..." }
 *   401     { "valid": false, "error": "Invalid or expired key." }
 *
 * Wrong, malformed and expired keys all get the same answer, so the response
 * never hints at which part was wrong. Callable from any site (CORS open):
 * knowing a valid key is the only thing that unlocks a name.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

// Best-effort burst limit. Vercel runs many instances, so this is per
// instance; keys are ~144 random bits, so guessing isn't the threat, abuse is.
const PER_MINUTE = 30;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > PER_MINUTE;
}

const json = (body: object, status: number) => NextResponse.json(body, { status, headers: CORS });

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return json({ valid: false, error: "Too many requests. Try again in a minute." }, 429);

  let key = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  if (!key) {
    try {
      const body = await request.json();
      key = typeof body?.key === "string" ? body.key.trim() : "";
    } catch {
      /* no JSON body */
    }
  }
  if (!key) return json({ valid: false, error: "Send the key as { \"key\": \"...\" } or an Authorization: Bearer header." }, 400);

  const db = serviceDb();
  let owner: Awaited<ReturnType<typeof verifyKey>>;
  try {
    owner = await verifyKey(db, key);
  } catch {
    return json({ valid: false, error: "Key service unavailable." }, 503);
  }
  if (!owner) return json({ valid: false, error: "Invalid or expired key." }, 401);
  // A key issued while PRO+ was active stops working as soon as PRO+ ends.
  if (!(await hasProAccessById(db, owner.userId))) {
    return json({ valid: false, error: "This account doesn't have PRO+. Upgrade at jobalerts24.com/pricing." }, 403);
  }

  const { data: profile } = await db.from("profiles").select("full_name").eq("id", owner.userId).maybeSingle();
  return json({ valid: true, name: (profile?.full_name as string | null)?.trim() || null, expiresAt: owner.expiresAt }, 200);
}
