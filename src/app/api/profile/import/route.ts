import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PROFILE_COLUMNS, ProfileError, importFromResume, rowToProfile, type ProfileRow } from "@/lib/profile/server";

/** Re-reads the saved resume and refills the profile sections from it. */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const db = serviceDb();
  const { data: row } = await db.from("profiles").select(PROFILE_COLUMNS).eq("id", user.id).maybeSingle<ProfileRow>();
  if (!row) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  try {
    const update = await importFromResume(db, row);
    const { data } = await db
      .from("profiles")
      .update(update)
      .eq("id", user.id)
      .select(PROFILE_COLUMNS)
      .single<ProfileRow>();
    if (!data) throw new ProfileError("Could not save the imported profile.", 500);
    return NextResponse.json({ profile: rowToProfile(data) });
  } catch (e) {
    const err = e instanceof ProfileError ? e : new ProfileError("Could not import your resume.", 500);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
