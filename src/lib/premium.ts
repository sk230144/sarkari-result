/** PRO+ plans and helpers, shared by the pricing page, profile and the payment API. */

export type PlanKey = "monthly" | "quarterly";

/** PRO+ monthly price in rupees; the other monthly figures follow from it. */
const MONTHLY_PRICE = 699;

export const PLANS: Record<PlanKey, { key: PlanKey; label: string; months: number; total: number; perMonth: number; billed: string }> = {
  quarterly: { key: "quarterly", label: "Quarterly", months: 3, total: 1797, perMonth: 599, billed: "Billed ₹1,797 every 3 months" },
  monthly: { key: "monthly", label: "Monthly", months: 1, total: MONTHLY_PRICE, perMonth: MONTHLY_PRICE, billed: "Billed every month" },
};

/** How much cheaper quarterly is than paying monthly, in whole percent. */
export const QUARTERLY_SAVING = Math.max(0, Math.round((1 - PLANS.quarterly.perMonth / PLANS.monthly.perMonth) * 100));

export const isPlan = (v: unknown): v is PlanKey => v === "monthly" || v === "quarterly";

export function isPremiumActive(until: string | null | undefined, now = Date.now()) {
  return Boolean(until && new Date(until).getTime() > now);
}

export type PremiumStatus = {
  isPremium: boolean;
  premiumUntil: string | null;
  plan: PlanKey | null;
  since: string | null;
};

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function daysLeft(until: string | null, now = Date.now()) {
  if (!until) return 0;
  return Math.max(0, Math.ceil((new Date(until).getTime() - now) / 86_400_000));
}

/* ------------------------------------------------------------ monthly quotas */

export type QuotaFeature = "letter" | "analysis" | "interview";

/** New items per calendar month (India time). Cached re-opens don't count. */
export const QUOTAS: Record<"free" | "pro", Record<QuotaFeature, number>> = {
  free: { letter: 2, analysis: 2, interview: 1 },
  pro: { letter: 20, analysis: 20, interview: 17 },
};

export const QUOTA_LABEL: Record<QuotaFeature, { one: string; many: string }> = {
  letter: { one: "cover letter", many: "cover letters" },
  analysis: { one: "resume analysis", many: "resume analyses" },
  interview: { one: "mock interview", many: "mock interviews" },
};

/** A user's allowance for one feature this month. `limit`/`remaining` are null when unlimited (admin). */
export type Quota = {
  plan: "free" | "pro" | "admin";
  limit: number | null;
  used: number;
  remaining: number | null;
  /** When the count goes back to zero: the 1st of next month, midnight IST. */
  resetsAt: string;
};

export const fmtReset = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
