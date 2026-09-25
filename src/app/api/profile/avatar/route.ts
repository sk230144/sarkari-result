import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PROFILE_COLUMNS, rowToProfile, type ProfileRow } from "@/lib/profile/server";
import { clearImages, imageType } from "@/lib/profile/images";

const MAX_BYTES = 2 * 1024 * 1024;

const clearOld = (db: ReturnType<typeof serviceDb>, userId: string, keep?: string) => clearImages(db, userId, keep);

/** Uploads a profile photo (JPG, PNG or WebP, max 2 MB). Form field: avatar. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Photo must be under 2 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "No photo provided." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be under 2 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = imageType(bytes);
  if (!type) return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 400 });

  const db = serviceDb();
  // A new file name each time, so browsers and CDNs never show a stale photo.
  const path = `${user.id}/${Date.now()}.${type.ext}`;
  const { error } = await db.storage.from("avatars").upload(path, bytes, { contentType: type.mime });
  if (error) {
    console.error("avatar upload failed", error.message);
    return NextResponse.json({ error: "Could not upload your photo." }, { status: 502 });
  }
  await clearOld(db, user.id, path);

  const publicUrl = db.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  const { data } = await db
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>();
  if (!data) return NextResponse.json({ error: "Could not save your photo." }, { status: 500 });
  return NextResponse.json({ profile: rowToProfile(data) });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const db = serviceDb();
  await clearOld(db, user.id);
  const { data } = await db
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>();
  if (!data) return NextResponse.json({ error: "Could not remove your photo." }, { status: 500 });
  return NextResponse.json({ profile: rowToProfile(data) });
}
