"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HiringPost } from "@/types";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getHiringPosts(): Promise<HiringPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hiring_posts")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching hiring posts:", error);
    return [];
  }
  return (data || []) as HiringPost[];
}

export async function getHiringPostById(id: string): Promise<HiringPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hiring_posts")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching hiring post:", error);
    return null;
  }
  return data as HiringPost | null;
}

export async function getAdminHiringPosts(page = 1, search = "") {
  const supabase = await createClient();
  const perPage = 50;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("hiring_posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`title.ilike.%${search}%,company_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("Error fetching admin hiring posts:", error);
    return { posts: [] as HiringPost[], count: 0 };
  }
  return { posts: (data || []) as HiringPost[], count: count || 0 };
}

async function uploadToCloudinary(file: File): Promise<string | null> {
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "jobalerts24/hiring-posts",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    return result.secure_url;
  } catch (e) {
    console.error("Cloudinary upload error:", e);
    return null;
  }
}

export async function createHiringPost(formData: FormData) {
  const supabase = await createClient();

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const imageFile = formData.get("image") as File | null;
  let imageUrl: string | null = null;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadToCloudinary(imageFile);
  }

  const { error } = await supabase.from("hiring_posts").insert({
    title: formData.get("title") as string,
    company_name: (formData.get("company_name") as string) || null,
    description: (formData.get("description") as string) || null,
    image_url: imageUrl,
    tags,
    work_mode: (formData.get("work_mode") as string) || "onsite",
    is_active: true,
  });

  if (error) {
    console.error("Error creating hiring post:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}

export async function updateHiringPost(id: string, formData: FormData) {
  const supabase = await createClient();

  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  const imageFile = formData.get("image") as File | null;
  const keepExistingImage = formData.get("keep_image") === "1";

  const updateData: Record<string, unknown> = {
    title: formData.get("title") as string,
    company_name: (formData.get("company_name") as string) || null,
    description: (formData.get("description") as string) || null,
    tags,
    work_mode: (formData.get("work_mode") as string) || "onsite",
    updated_at: new Date().toISOString(),
  };

  if (imageFile && imageFile.size > 0) {
    const imageUrl = await uploadToCloudinary(imageFile);
    if (imageUrl) updateData.image_url = imageUrl;
  } else if (!keepExistingImage) {
    updateData.image_url = null;
  }

  const { error } = await supabase
    .from("hiring_posts")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating hiring post:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}

export async function deleteHiringPost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hiring_posts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting hiring post:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}

export async function toggleHiringPostActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("hiring_posts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error toggling hiring post:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/hiring");
  revalidatePath("/corporate-jobs");
}
