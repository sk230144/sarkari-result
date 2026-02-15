"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  is_premium: boolean;
  premium_plan: string | null;
  premium_started_at: string | null;
  premium_expires_at: string | null;
  qualification: string | null;
  degree_stream: string | null;
  whatsapp_number: string | null;
  wants_notifications: boolean;
  created_at: string;
}

export async function getAdminUsers(page = 1, search = "") {
  const supabase = await createClient();
  const perPage = 20;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching users:", error);
    return { users: [] as UserProfile[], count: 0 };
  }

  return { users: (data || []) as UserProfile[], count: count || 0 };
}

export async function toggleUserPremium(
  userId: string,
  isPremium: boolean,
  plan?: string
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    is_premium: isPremium,
    updated_at: new Date().toISOString(),
  };

  if (isPremium) {
    updateData.premium_plan = plan || "lifetime";
    updateData.premium_started_at = new Date().toISOString();
    // Set expiry based on plan
    if (plan === "monthly") {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      updateData.premium_expires_at = d.toISOString();
    } else if (plan === "half-yearly") {
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      updateData.premium_expires_at = d.toISOString();
    } else if (plan === "yearly") {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      updateData.premium_expires_at = d.toISOString();
    } else {
      updateData.premium_expires_at = null; // lifetime
    }
  } else {
    updateData.premium_plan = null;
    updateData.premium_started_at = null;
    updateData.premium_expires_at = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (error) {
    console.error("Error toggling premium:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
}

export async function getJobsForUserQualification(qualification: string) {
  const supabase = await createClient();

  // Map user qualification to matching job qualification values
  const qualificationMap: Record<string, string[]> = {
    "10th Pass": ["8th Pass", "10th Pass"],
    "12th Pass": ["8th Pass", "10th Pass", "12th Pass"],
    Graduate: ["8th Pass", "10th Pass", "12th Pass", "Graduate", "B.Tech/B.E."],
    "Post Graduate": [
      "8th Pass", "10th Pass", "12th Pass", "Graduate",
      "B.Tech/B.E.", "Post Graduate", "M.Tech/M.E.",
    ],
    Diploma: ["8th Pass", "10th Pass", "Diploma", "ITI"],
  };

  const matchingQualifications = qualificationMap[qualification] || [qualification];

  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, organization, qualification, apply_url")
    .eq("is_published", true)
    .in("qualification", matchingQualifications)
    .order("post_date", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching jobs for qualification:", error);
    return [];
  }

  return data || [];
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Delete profile (cascade will handle related data)
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error("Error deleting user:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
}
