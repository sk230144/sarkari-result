import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { extractResumeText, ResumeTextError, RESUME_MAX_BYTES } from "@/lib/resume-text";
import { cleanCv } from "@/lib/cv-clean";
import { getSessionUser, serviceDb } from "@/lib/server-auth";

/** New distinct resumes a user may process per 24 h (parsing is CPU, not AI). */
const DAILY_CV_LIMIT = 30;

/**
 * Step 1 of the flow: turn a resume (the saved one, or a fresh upload) into
 * cleaned text stored once per distinct file. Returns the id that the
 * generation routes use, so the PDF is never re-parsed for the same file.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > RESUME_MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "The resume PDF is over 5 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const db = serviceDb();
  let bytes: Buffer;
  let filename: string | null;

  if (form.get("source") === "saved") {
    const { data: profile } = await db
      .from("profiles")
      .select("resume_path, resume_filename")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.resume_path) {
      return NextResponse.json({ error: "No saved resume found. Please upload one." }, { status: 404 });
    }
    const { data: blob, error } = await db.storage.from("user-documents").download(profile.resume_path);
    if (error || !blob) {
      return NextResponse.json({ error: "Could not load your saved resume." }, { status: 502 });
    }
    bytes = Buffer.from(await blob.arrayBuffer());
    filename = profile.resume_filename ?? null;
  } else {
    const file = form.get("resume");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
    }
    if (file.size > RESUME_MAX_BYTES) {
      return NextResponse.json({ error: "The resume PDF is over 5 MB." }, { status: 413 });
    }
    bytes = Buffer.from(await file.arrayBuffer());
    filename = file.name.slice(0, 200);
  }

  const fileHash = createHash("sha256").update(bytes).digest("hex");

  const { data: existing } = await db
    .from("cv_documents")
    .select("id")
    .eq("user_id", user.id)
    .eq("file_hash", fileHash)
    .maybeSingle();
  if (existing) return NextResponse.json({ cvId: existing.id, cached: true });

  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { count } = await db
    .from("cv_documents")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_CV_LIMIT) {
    return NextResponse.json(
      { error: "Too many new resumes today. Please try again tomorrow." },
      { status: 429 },
    );
  }

  let raw: string;
  try {
    raw = await extractResumeText(bytes);
  } catch (err) {
    const message = err instanceof ResumeTextError ? err.message : "Failed to read the resume.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { text, contact } = cleanCv(raw);
  if (text.length < 100) {
    return NextResponse.json(
      { error: "Could not find enough readable text in that resume." },
      { status: 422 },
    );
  }

  const { data: inserted, error } = await db
    .from("cv_documents")
    .upsert(
      { user_id: user.id, file_hash: fileHash, filename, cleaned_text: text, contact },
      { onConflict: "user_id,file_hash" },
    )
    .select("id")
    .single();
  if (error || !inserted) {
    console.error("cv_documents insert failed", error?.message);
    return NextResponse.json({ error: "Could not save the resume." }, { status: 500 });
  }

  return NextResponse.json({ cvId: inserted.id, cached: false });
}
