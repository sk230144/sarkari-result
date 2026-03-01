"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export interface ExamPdf {
  id: string;
  name: string;
  exam_body: string;
  file_path: string;
  file_url: string;
  created_at: string;
}

export async function getExamPdfs(): Promise<ExamPdf[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exam_pdfs")
    .select("*")
    .order("exam_body", { ascending: true });

  if (error) {
    console.error("Error fetching exam PDFs:", error.message);
    return [];
  }
  return data || [];
}

export async function uploadExamPdf(formData: FormData) {
  const supabase = createServiceClient();

  const name = (formData.get("name") as string)?.trim();
  const examBody = (formData.get("exam_body") as string)?.trim();
  const file = formData.get("file") as File;

  if (!name || !examBody || !file || file.size === 0) {
    return { error: "All fields are required" };
  }
  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are allowed" };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { error: "File must be under 10 MB" };
  }

  const fileName = `${examBody.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.pdf`;
  const filePath = `calendars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("exam-pdfs")
    .upload(filePath, file, { contentType: "application/pdf", upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from("exam-pdfs")
    .getPublicUrl(filePath);

  const { error: dbError } = await supabase.from("exam_pdfs").insert({
    name,
    exam_body: examBody,
    file_path: filePath,
    file_url: urlData.publicUrl,
  });

  if (dbError) {
    // Clean up storage if DB insert fails
    await supabase.storage.from("exam-pdfs").remove([filePath]);
    return { error: dbError.message };
  }

  revalidatePath("/admin/exam-calendars");
  revalidatePath("/exam-calendars");
  revalidatePath("/");
}

export async function deleteExamPdf(id: string, filePath: string) {
  const supabase = createServiceClient();

  const { error: dbError } = await supabase
    .from("exam_pdfs")
    .delete()
    .eq("id", id);

  if (dbError) return { error: dbError.message };

  await supabase.storage.from("exam-pdfs").remove([filePath]);

  revalidatePath("/admin/exam-calendars");
  revalidatePath("/exam-calendars");
  revalidatePath("/");
}
