import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import {
  PROFILE_COLUMNS,
  ProfileError,
  importFromResume,
  loadExtras,
  rowToProfile,
  validatePatch,
  type ProfileRow,
} from "@/lib/profile/server";
import { bannerFolder, clearImages } from "@/lib/profile/images";

const MAX_BODY_BYTES = 200 * 1024;

/** The signed-in user's editable profile plus owner-only stats. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const db = serviceDb();
  let { data: row } = await db.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle<ProfileRow>();
  if (!row) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  // First visit: fill the profile from the resume they uploaded at signup.
  if (row.resume_path && !row.resume_imported_at) {
    try {
      const update = await importFromResume(db, row);
      const { data } = await db
        .from("profiles")
        .update(update)
        .eq("id", user.id)
        .select(PROFILE_COLUMNS)
        .single<ProfileRow>();
      if (data) row = data;
    } catch (e) {
      console.error("auto import failed", e instanceof Error ? e.message : e);
    }
  }

  return NextResponse.json({ profile: rowToProfile(row), extras: await loadExtras(db, user.id) });
}

/** Partial update; every field is validated server-side. */
export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "That update is too large." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = serviceDb();
  try {
    const update = await validatePatch(db, user.id, body ?? {});
    if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    const { data, error } = await db
      .from("profiles")
      .update(update)
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
      .single<ProfileRow>();
    if (error || !data) {
      // Two users racing for the same custom URL both pass the check;
      // the unique index stops the second.
      if (error?.code === "23505") throw new ProfileError("That URL is already taken.", 409);
      console.error("profile update failed", error?.message);
      throw new ProfileError("Could not save your profile.", 500);
    }
    // The gradient replaced the uploaded banner, so its file can go.
    if ("banner_url" in update) await clearImages(db, bannerFolder(user.id));
    return NextResponse.json({ profile: rowToProfile(data) });
  } catch (e) {
    const err = e instanceof ProfileError ? e : new ProfileError("Could not save your profile.", 500);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
