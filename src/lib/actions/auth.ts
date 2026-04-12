"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { applyReferralCode } from "./referrals";
import { claimFreeTrial } from "./users";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const refCode = (formData.get("refCode") as string | null)?.trim() || "";
  const trialClaim = formData.get("trial") === "1";

  if (!email || !password || !fullName) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Apply referral code if provided (non-blocking)
  if (refCode && data.user) {
    await applyReferralCode(data.user.id, refCode);
  }

  // Auto-claim free trial if user signed up via trial banner
  if (trialClaim && data.user) {
    await claimFreeTrial();
  }

  redirect(trialClaim ? "/membership?trial=claimed" : "/tools/document-locker");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = formData.get("redirect") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo || "/tools/document-locker");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
