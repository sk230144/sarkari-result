import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { isAdminEmail } from "./admin";
import type { Usage } from "./gemini";

/** The verified signed-in user for this request, or null. */
export async function getSessionUser(): Promise<User | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const store = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  });
  // getUser() validates the JWT with Supabase instead of trusting the cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Service-role client. Only use after the caller has been authenticated. */
export function serviceDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service credentials missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Cover letter AI calls (generate, regenerate, edit) per user per rolling 24 h. */
export const DAILY_AI_LIMIT = Number(process.env.AI_DAILY_LIMIT_PER_USER) || 20;

/** New resume analyses per user per rolling 24 h (cached re-opens are free). */
export const DAILY_ANALYSIS_LIMIT = Number(process.env.AI_DAILY_ANALYSES_PER_USER) || 10;

const dayAgo = () => new Date(Date.now() - 24 * 3600 * 1000).toISOString();

/** Remaining cover letter calls for this user, or null when unlimited. */
export async function remainingAiCalls(db: SupabaseClient, user: User): Promise<number | null> {
  if (isAdminEmail(user.email)) return null;
  const { count } = await db
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .like("kind", "cover_letter%")
    .gte("created_at", dayAgo());
  return Math.max(0, DAILY_AI_LIMIT - (count ?? 0));
}

/** Remaining new analyses for this user, or null when unlimited. */
export async function remainingAnalyses(db: SupabaseClient, user: User): Promise<number | null> {
  if (isAdminEmail(user.email)) return null;
  const { count } = await db
    .from("resume_reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", dayAgo());
  return Math.max(0, DAILY_ANALYSIS_LIMIT - (count ?? 0));
}

export async function logAiUsage(
  db: SupabaseClient,
  userId: string,
  kind: string,
  model: string,
  usage: Usage,
) {
  const { error } = await db.from("ai_usage").insert({
    user_id: userId,
    kind,
    model,
    input_tokens: usage.input,
    output_tokens: usage.output,
    thinking_tokens: usage.thinking,
  });
  if (error) console.error("ai_usage insert failed", error.message);
}
