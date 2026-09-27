import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { imageType } from "@/lib/profile/images";

const MAX_BYTES = 4 * 1024 * 1024;

/** Uploads a cover or inline image for a post. multipart: file. Returns { url }. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("file");
    file = f instanceof File ? f : null;
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Images must be under 4 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = imageType(bytes);
  if (!type) return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });

  const path = `${user.id}/${crypto.randomUUID()}.${type.ext}`;
  const db = serviceDb();
  const { error } = await db.storage.from("blog-images").upload(path, bytes, { contentType: type.mime, cacheControl: "31536000" });
  if (error) {
    console.error("blog image upload failed", error.message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ url: db.storage.from("blog-images").getPublicUrl(path).data.publicUrl });
}
