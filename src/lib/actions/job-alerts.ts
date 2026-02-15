"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveJobAlertPreferences(
  qualification: string,
  degreeStream: string,
  whatsappNumber: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // Validate phone
  const digits = whatsappNumber.replace(/\D/g, "");
  const normalized = digits.startsWith("91") && digits.length > 10
    ? digits.slice(2)
    : digits;

  if (normalized.length !== 10) {
    return { error: "Enter a valid 10-digit WhatsApp number" };
  }

  if (!qualification || !degreeStream) {
    return { error: "Qualification and stream are required" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      qualification,
      degree_stream: degreeStream,
      whatsapp_number: normalized,
      wants_notifications: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error saving job alert preferences:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getUserAlertPreferences() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("qualification, degree_stream, whatsapp_number, wants_notifications")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching alert preferences:", error);
    return null;
  }

  return data;
}
