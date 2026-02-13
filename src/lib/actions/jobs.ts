"use server";

import { createClient } from "@/lib/supabase/server";
import { type JobFilters } from "@/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export async function getPublicJobs(filters: JobFilters = {}) {
  const supabase = await createClient();
  const {
    category = "all",
    state,
    qualification,
    search,
    sort = "newest",
    page = 1,
  } = filters;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (state) {
    query = query.eq("state", state);
  }
  if (qualification) {
    query = query.eq("qualification", qualification);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,organization.ilike.%${search}%`);
  }

  switch (sort) {
    case "last_date":
      query = query.order("last_date", { ascending: true, nullsFirst: false });
      break;
    case "featured":
      query = query
        .order("is_featured", { ascending: false })
        .order("post_date", { ascending: false });
      break;
    default:
      query = query.order("post_date", { ascending: false });
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return { jobs: [], count: 0 };
  }

  return { jobs: data || [], count: count || 0 };
}

export async function getJobById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job:", error);
    return null;
  }

  return data;
}

export async function getFeaturedJobs(limit = 6) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("post_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured jobs:", error);
    return [];
  }

  return data || [];
}

export async function getLatestJobs(limit = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_published", true)
    .order("post_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest jobs:", error);
    return [];
  }

  return data || [];
}
