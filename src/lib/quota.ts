import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-emails";
import { QUOTAS, QUOTA_LABEL, fmtReset, isPremiumActive, type Quota, type QuotaFeature } from "@/lib/premium";

const IST_MS = 330 * 60_000; // India has no daylight saving, so a fixed offset is exact.

/** Start of this calendar month and of the next one, in India time, as UTC instants. */
export function monthWindow(now = Date.now()) {
  const ist = new Date(now + IST_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  return {
    start: new Date(Date.UTC(y, m, 1) - IST_MS).toISOString(),
    next: new Date(Date.UTC(y, m + 1, 1) - IST_MS).toISOString(),
  };
}

// What one "use" is: a new saved letter / report / interview this month.
const TABLE: Record<QuotaFeature, string> = {
  letter: "cover_letters",
  analysis: "resume_reports",
  interview: "mock_interviews",
};

/** How much of a feature this user has used this month, and how much is left. */
export async function getQuota(db: SupabaseClient, user: User, feature: QuotaFeature): Promise<Quota> {
  const { start, next } = monthWindow();
  const [{ count }, { data: prof }] = await Promise.all([
    db.from(TABLE[feature]).select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", start),
    db.from("profiles").select("premium_until").eq("id", user.id).maybeSingle(),
  ]);
  const used = count ?? 0;
  if (isAdminEmail(user.email)) return { plan: "admin", limit: null, used, remaining: null, resetsAt: next };
  const plan = isPremiumActive(prof?.premium_until as string | null) ? "pro" : "free";
  const limit = QUOTAS[plan][feature];
  return { plan, limit, used, remaining: Math.max(0, limit - used), resetsAt: next };
}

/** The 429 body sent when a monthly quota is used up; the UI shows an upgrade button for it. */
export function quotaExceeded(feature: QuotaFeature, q: Quota) {
  const label = QUOTA_LABEL[feature];
  const noun = q.limit === 1 ? label.one : label.many;
  const error =
    q.plan === "pro"
      ? `You've used all ${q.limit} ${noun} in PRO+ this month. More on ${fmtReset(q.resetsAt)}.`
      : `You've used your ${q.limit} free ${noun} this month. Upgrade to PRO+ for ${QUOTAS.pro[feature]} a month, or wait until ${fmtReset(q.resetsAt)}.`;
  return { error, code: "QUOTA_EXCEEDED", upgrade: q.plan === "free", quota: q };
}
