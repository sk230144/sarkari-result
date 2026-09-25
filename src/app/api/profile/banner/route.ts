import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PROFILE_COLUMNS, rowToProfile, type ProfileRow } from "@/lib/profile/server";
import { bannerFolder, clearImages, imageType } from "@/lib/profile/images";

const MAX_BYTES = 4 * 1024 * 1024;

/** Uploads a custom banner image (JPG, PNG or WebP, max 4 MB). Form field: banner. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Banner image must be under 4 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("banner");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image provided." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Banner image must be under 4 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = imageType(bytes);
  if (!type) return NextResponse.json({ error: "Please upload a JPG, PNG or WebP image." }, { status: 400 });

  const db = serviceDb();
  const folder = bannerFolder(user.id);
  // New name per upload, so browsers and CDNs never show the old banner.
  const path = `${folder}/${Date.now()}.${type.ext}`;
  const { error } = await db.storage.from("avatars").upload(path, bytes, { contentType: type.mime });
  if (error) {
    console.error("banner upload failed", error.message);
    return NextResponse.json({ error: "Could not upload your banner." }, { status: 502 });
  }
  await clearImages(db, folder, path);

  const { data } = await db
    .from("profiles")
    .update({ banner_url: db.storage.from("avatars").getPublicUrl(path).data.publicUrl })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>();
  if (!data) return NextResponse.json({ error: "Could not save your banner." }, { status: 500 });
  return NextResponse.json({ profile: rowToProfile(data) });
}

/** Removes the custom banner and falls back to the chosen gradient. */
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const db = serviceDb();
  await clearImages(db, bannerFolder(user.id));
  const { data } = await db
    .from("profiles")
    .update({ banner_url: null })
    .eq("id", user.id)
    .select(PROFILE_COLUMNS)
    .single<ProfileRow>();
  if (!data) return NextResponse.json({ error: "Could not remove your banner." }, { status: 500 });
  return NextResponse.json({ profile: rowToProfile(data) });
}
