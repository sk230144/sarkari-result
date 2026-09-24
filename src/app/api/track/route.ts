import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Receives a page view's duration as the reader leaves.
 *
 * Exists because `navigator.sendBeacon` can only issue a POST and cannot
 * set headers, so it cannot talk to PostgREST's PATCH endpoint directly.
 * Beacon is still the right transport: an ordinary fetch started during
 * unload is routinely cancelled before it leaves the browser, which is why
 * every duration was null before this route existed.
 *
 * The write uses the service key, so it is deliberately narrow: it updates
 * exactly one column on one row, and only when that row has no duration
 * yet. There is nothing here an attacker could use beyond inflating their
 * own reading time.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : null;
    const seconds = Number(body?.duration_s);

    // A malformed beacon is ignored rather than errored: the sender is
    // already gone and cannot act on a response.
    if (!id || !Number.isFinite(seconds) || seconds < 1) {
      return NextResponse.json({ ok: false }, { status: 204 });
    }

    // Twelve hours. Anything longer is a tab left open across a day, not
    // time spent reading, and would distort the admin averages.
    const capped = Math.min(Math.round(seconds), 12 * 3600);

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return NextResponse.json({ ok: false }, { status: 204 });

    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await db.from("page_views").update({ duration_s: capped }).eq("id", id);

    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never surface an error to the reader.
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
