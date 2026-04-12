"use server";

import { createClient } from "@/lib/supabase/server";

export interface PremiumStatus {
  isPremium: boolean;
  plan: string | null;
  expiresAt: string | null;
  daysLeft: number | null; // null = lifetime, number = days remaining
}

/**
 * Single source of truth for premium status.
 * Checks is_premium + expiry. Auto-resets DB if expired.
 */
export async function getEffectivePremium(userId: string): Promise<boolean> {
  const status = await getPremiumStatus(userId);
  return status.isPremium;
}

export async function getPremiumStatus(userId: string): Promise<PremiumStatus> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at, premium_plan")
    .eq("id", userId)
    .maybeSingle();

  if (!data || !data.is_premium) {
    return { isPremium: false, plan: null, expiresAt: null, daysLeft: null };
  }

  // No expiry = lifetime
  if (!data.premium_expires_at) {
    return { isPremium: true, plan: data.premium_plan, expiresAt: null, daysLeft: null };
  }

  const now = new Date();
  const expires = new Date(data.premium_expires_at);
  const msLeft = expires.getTime() - now.getTime();

  if (msLeft > 0) {
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    return {
      isPremium: true,
      plan: data.premium_plan,
      expiresAt: data.premium_expires_at,
      daysLeft,
    };
  }

  // Expired — auto-reset in DB (fire and forget)
  supabase
    .from("profiles")
    .update({
      is_premium: false,
      premium_plan: null,
      premium_started_at: null,
      premium_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .then(() => {});

  return { isPremium: false, plan: null, expiresAt: null, daysLeft: null };
}
