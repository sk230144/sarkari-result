"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HiringProfile } from "@/types";

export async function getHiringProfiles() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hiring_profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching hiring profiles:", error);
    return [];
  }

  return (data || []) as HiringProfile[];
}

export async function getAdminHiringProfiles(page = 1, search = "") {
  const supabase = await createClient();
  const perPage = 50;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("hiring_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `profile_name.ilike.%${search}%,role_hiring.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin hiring profiles:", error);
    return { profiles: [] as HiringProfile[], count: 0 };
  }

  return { profiles: (data || []) as HiringProfile[], count: count || 0 };
}

export async function createHiringProfile(formData: FormData) {
  const supabase = await createClient();

  const profileData = {
    profile_name: formData.get("profile_name") as string,
    role_hiring: formData.get("role_hiring") as string,
    work_mode: formData.get("work_mode") as string || "onsite",
    profile_link: formData.get("profile_link") as string,
    is_active: true,
  };

  const { error } = await supabase.from("hiring_profiles").insert(profileData);

  if (error) {
    console.error("Error creating hiring profile:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
  return { success: true };
}

export async function updateHiringProfile(id: string, formData: FormData) {
  const supabase = await createClient();

  const profileData = {
    profile_name: formData.get("profile_name") as string,
    role_hiring: formData.get("role_hiring") as string,
    work_mode: formData.get("work_mode") as string || "onsite",
    profile_link: formData.get("profile_link") as string,
  };

  const { error } = await supabase
    .from("hiring_profiles")
    .update(profileData)
    .eq("id", id);

  if (error) {
    console.error("Error updating hiring profile:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
  return { success: true };
}

export async function deleteHiringProfile(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hiring_profiles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting hiring profile:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}

export async function toggleHiringProfileActive(id: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("hiring_profiles")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    console.error("Error toggling hiring profile:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}
