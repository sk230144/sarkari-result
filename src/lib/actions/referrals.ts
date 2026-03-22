"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calcReferralDays } from "@/lib/referral-config";

/** Get current user's referral stats */
export async function getReferralStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("referral_code, referral_count, referral_days_earned")
    .eq("id", user.id)
    .single();

  return data ?? null;
}

/** Apply a referral code during signup — call after profile is created */
export async function applyReferralCode(newUserId: string, code: string) {
  if (!code) return;

  const supabase = await createClient();

  // Find the referrer
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, referral_count, referral_days_earned, is_premium, premium_expires_at")
    .eq("referral_code", code.toUpperCase())
    .single();

  if (!referrer || referrer.id === newUserId) return;

  // Mark the new user as referred
  await supabase
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", newUserId);

  // Increment referrer's count
  const newCount = (referrer.referral_count ?? 0) + 1;
  const newDaysEarned = calcReferralDays(newCount);
  const prevDaysEarned = referrer.referral_days_earned ?? 0;
  const bonusDays = newDaysEarned - prevDaysEarned;

  const updateData: Record<string, unknown> = {
    referral_count: newCount,
    referral_days_earned: newDaysEarned,
  };

  // If a milestone was just crossed, extend premium
  if (bonusDays > 0) {
    const now = new Date();
    // Start from existing expiry or now
    const base =
      referrer.is_premium && referrer.premium_expires_at
        ? new Date(referrer.premium_expires_at)
        : now;
    const newExpiry = new Date(Math.max(base.getTime(), now.getTime()));
    newExpiry.setDate(newExpiry.getDate() + bonusDays);

    updateData.is_premium = true;
    updateData.premium_plan = referrer.is_premium ? referrer.premium_expires_at ? "referral_extended" : "referral" : "referral";
    updateData.premium_started_at = now.toISOString();
    updateData.premium_expires_at = newExpiry.toISOString();
  }

  await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", referrer.id);

  revalidatePath("/membership");
}
