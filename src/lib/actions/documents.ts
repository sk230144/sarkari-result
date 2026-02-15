"use server";

import { createClient } from "@/lib/supabase/server";

export type DocType =
  | "aadhar"
  | "marksheet_10"
  | "marksheet_12"
  | "photo"
  | "signature"
  | "graduation"
  | "resume"
  | "other";

export interface UserDocument {
  id: string;
  user_id: string;
  doc_type: DocType;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  label: string | null;
  created_at: string;
}

export async function getUserDocuments(): Promise<UserDocument[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data || [];
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("file") as File;
  const docType = formData.get("docType") as DocType;
  const label = formData.get("label") as string;

  if (!file || !docType) {
    return { error: "File and document type are required" };
  }

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    return { error: "File size must be under 5MB" };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPG, PNG, WebP and PDF files are allowed" };
  }

  // Generate unique file path: userId/docType/timestamp_filename
  const ext = file.name.split(".").pop();
  const safeName = `${Date.now()}_${docType}.${ext}`;
  const filePath = `${user.id}/${docType}/${safeName}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from("user-documents")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload file. Please try again." };
  }

  // Save metadata to database
  const { error: dbError } = await supabase.from("user_documents").insert({
    user_id: user.id,
    doc_type: docType,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    label: label || null,
  });

  if (dbError) {
    // Cleanup uploaded file
    await supabase.storage.from("user-documents").remove([filePath]);
    console.error("DB error:", dbError);
    return { error: "Failed to save document record." };
  }

  return { success: true };
}

export async function deleteDocument(docId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get doc info first
  const { data: doc } = await supabase
    .from("user_documents")
    .select("*")
    .eq("id", docId)
    .eq("user_id", user.id)
    .single();

  if (!doc) {
    return { error: "Document not found" };
  }

  // Delete from storage
  await supabase.storage.from("user-documents").remove([doc.file_path]);

  // Delete from database
  const { error } = await supabase
    .from("user_documents")
    .delete()
    .eq("id", docId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to delete document" };
  }

  return { success: true };
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Verify the path belongs to the user
  if (!filePath.startsWith(user.id + "/")) return null;

  const { data } = await supabase.storage
    .from("user-documents")
    .createSignedUrl(filePath, 60 * 5); // 5 min expiry

  return data?.signedUrl || null;
}
