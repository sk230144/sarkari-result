/** PRO+ plans and helpers, shared by the pricing page, profile and the payment API. */

export type PlanKey = "monthly" | "quarterly";

export const PLANS: Record<PlanKey, { key: PlanKey; label: string; months: number; total: number; perMonth: number; billed: string }> = {
  quarterly: { key: "quarterly", label: "Quarterly", months: 3, total: 1197, perMonth: 399, billed: "Billed ₹1,197 every 3 months" },
  monthly: { key: "monthly", label: "Monthly", months: 1, total: 499, perMonth: 499, billed: "Billed every month" },
};

/** How much cheaper quarterly is than paying monthly, in whole percent. */
export const QUARTERLY_SAVING = Math.round((1 - PLANS.quarterly.perMonth / PLANS.monthly.perMonth) * 100);

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
