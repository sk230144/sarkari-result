"use client";


/**
 * Browser Supabase client, authenticated as the signed-in reader.
 *
 * Uses the public anon key — safe to ship to the browser because every
 * table this touches is protected by row-level security, so the database
 * itself enforces that a reader only ever sees their own rows.
 *
 * Distinct from `lib/jobs.ts`, which uses the service-role key and is
 * server-only.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  // One instance per tab: a second client would keep its own session copy
  // and the two could drift after a token refresh.
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.",
    );
  }

  client = createBrowserClient(url, anon);
  return client;
}
