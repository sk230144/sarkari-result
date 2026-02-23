"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Verify user is in admins table
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .single();

  if (!admin) {
    await supabase.auth.signOut();
    return { error: "You are not authorized as admin" };
  }

  redirect("/admin");
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return !!data;
}

export async function logoutAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function getAdminJobs(page = 1, search = "") {
  const supabase = await createClient();
  const perPage = 100;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin jobs:", error);
    return { jobs: [], count: 0 };
  }

  return { jobs: data || [], count: count || 0 };
}

export async function createJob(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const jobData = {
    title: formData.get("title") as string,
    organization: (formData.get("organization") as string) || null,
    category: (formData.get("category") as string) || "job",
    state: (formData.get("state") as string) || null,
    qualification: (formData.get("qualification") as string) || null,
    tags,
    post_date: (formData.get("post_date") as string) || new Date().toISOString().split("T")[0],
    last_date: (formData.get("last_date") as string) || null,
    total_posts: formData.get("total_posts")
      ? parseInt(formData.get("total_posts") as string, 10)
      : null,
    fee: (formData.get("fee") as string) || null,
    age_limit: (formData.get("age_limit") as string) || null,
    short_description: (formData.get("short_description") as string) || null,
    notification_url: (formData.get("notification_url") as string) || null,
    apply_url: (formData.get("apply_url") as string) || null,
    is_published: formData.get("is_published") === "true",
    is_featured: formData.get("is_featured") === "true",
    created_by: user?.id || null,
  };

  const { error } = await supabase.from("jobs").insert(jobData);

  if (error) {
    console.error("Error creating job:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
  redirect("/admin/jobs");
}

export async function updateJob(id: string, formData: FormData) {
  const supabase = await createClient();

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const jobData = {
    title: formData.get("title") as string,
    organization: (formData.get("organization") as string) || null,
    category: (formData.get("category") as string) || "job",
    state: (formData.get("state") as string) || null,
    qualification: (formData.get("qualification") as string) || null,
    tags,
    post_date: (formData.get("post_date") as string) || new Date().toISOString().split("T")[0],
    last_date: (formData.get("last_date") as string) || null,
    total_posts: formData.get("total_posts")
      ? parseInt(formData.get("total_posts") as string, 10)
      : null,
    fee: (formData.get("fee") as string) || null,
    age_limit: (formData.get("age_limit") as string) || null,
    short_description: (formData.get("short_description") as string) || null,
    notification_url: (formData.get("notification_url") as string) || null,
    apply_url: (formData.get("apply_url") as string) || null,
    is_published: formData.get("is_published") === "true",
    is_featured: formData.get("is_featured") === "true",
  };

  const { error } = await supabase.from("jobs").update(jobData).eq("id", id);

  if (error) {
    console.error("Error updating job:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  redirect("/admin/jobs");
}

export async function deleteJob(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    console.error("Error deleting job:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function deleteMultipleJobs(ids: string[]) {
  const supabase = await createClient();

  const { error } = await supabase.from("jobs").delete().in("id", ids);

  if (error) {
    console.error("Error deleting multiple jobs:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function toggleJobPublish(id: string, isPublished: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("jobs")
    .update({ is_published: isPublished })
    .eq("id", id);

  if (error) {
    console.error("Error toggling publish:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function toggleJobFeatured(id: string, isFeatured: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("jobs")
    .update({ is_featured: isFeatured })
    .eq("id", id);

  if (error) {
    console.error("Error toggling featured:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  revalidatePath("/jobs");
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [usersRes, premiumRes, jobsRes, publishedRes, alertsRes] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("wants_notifications", true),
    ]);

  // Get user signups per day for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group by date
  const signupsByDate: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    signupsByDate[key] = 0;
  }
  if (recentUsers) {
    for (const u of recentUsers) {
      const key = u.created_at.split("T")[0];
      if (signupsByDate[key] !== undefined) {
        signupsByDate[key]++;
      }
    }
  }

  return {
    totalUsers: usersRes.count || 0,
    premiumUsers: premiumRes.count || 0,
    totalJobs: jobsRes.count || 0,
    publishedJobs: publishedRes.count || 0,
    alertUsers: alertsRes.count || 0,
    signupChart: Object.entries(signupsByDate).map(([date, count]) => ({
      date,
      count,
    })),
  };
}
