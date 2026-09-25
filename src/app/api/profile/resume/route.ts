import { NextResponse } from "next/server";
import { RESUME_MAX_BYTES } from "@/lib/resume-text-limits";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PROFILE_COLUMNS, ProfileError, importFromResume, rowToProfile, type ProfileRow } from "@/lib/profile/server";

/**
 * Replaces the saved resume, then refills the profile from it.
 * Form field: resume (PDF, max 5 MB).
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > RESUME_MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "The resume PDF is over 5 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("resume");
  if (!(file instanceof File)) return NextResponse.json({ error: "No resume file provided." }, { status: 400 });
  if (file.type !== "application/pdf") return NextResponse.json({ error: "Please upload a PDF file." }, { status: 400 });
  if (file.size > RESUME_MAX_BYTES) return NextResponse.json({ error: "The resume PDF is over 5 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "That file is not a valid PDF." }, { status: 400 });
  }

  const db = serviceDb();
  const path = `${user.id}/resume.pdf`;
  const { error: upErr } = await db.storage
    .from("user-documents")
    .upload(path, bytes, { upsert: true, contentType: "application/pdf" });
  if (upErr) {
    console.error("resume upload failed", upErr.message);
    return NextResponse.json({ error: "Could not upload your resume." }, { status: 502 });
  }

  const { data: row } = await db
    .from("profiles")
    .update({ resume_path: path, resume_filename: file.name.slice(0, 200), resume_uploaded_at: new Date().toISOString() })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>();
  if (!row) return NextResponse.json({ error: "Could not save your resume." }, { status: 500 });

  try {
    const update = await importFromResume(db, row);
    const { data } = await db
      .from("profiles")
      .update(update)
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
      .single<ProfileRow>();
    return NextResponse.json({ profile: rowToProfile(data ?? row) });
  } catch (e) {
    // The new file is saved even if it could not be read; say so.
    const msg = e instanceof ProfileError ? e.message : "Could not read the new resume.";
    return NextResponse.json({ profile: rowToProfile(row), warning: `Resume saved, but ${msg.charAt(0).toLowerCase()}${msg.slice(1)}` });
  }
}
