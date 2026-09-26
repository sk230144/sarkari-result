import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { newShareToken } from "@/lib/interview/share";

const UUID = /^[0-9a-f-]{36}$/i;
const NOT_READY = "Sharing isn't set up yet. Run migration 0017_mock_interview_sharing.sql in Supabase.";

async function own(id: string, userId: string) {
  if (!UUID.test(id)) return { row: null, error: null };
  const { data, error } = await serviceDb()
    .from("mock_interviews")
    .select("id, status, share_token, is_public")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return { row: data, error };
}

/** Current sharing state of one of the user's interviews. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const { row, error } = await own((await params).id, user.id);
  if (error) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  if (!row) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  return NextResponse.json({ isPublic: row.is_public, token: row.is_public ? row.share_token : null });
}

/** Turns the public link on or off. Body: { public: boolean } */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  let body: { public?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.public !== "boolean") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const { row, error } = await own((await params).id, user.id);
  if (error) return NextResponse.json({ error: NOT_READY }, { status: 503 });
  if (!row) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  if (row.status !== "completed") return NextResponse.json({ error: "Only finished interviews can be shared." }, { status: 409 });

  // Turning sharing back on reuses the same link, so links already sent work again.
  const token = (row.share_token as string | null) ?? newShareToken();
  const { error: upd } = await serviceDb()
    .from("mock_interviews")
    .update(body.public ? { is_public: true, share_token: token, shared_at: new Date().toISOString() } : { is_public: false })
    .eq("id", row.id)
    .eq("user_id", user.id);
  if (upd) return NextResponse.json({ error: "Couldn't update sharing. Try again." }, { status: 500 });

  return NextResponse.json({ isPublic: body.public, token: body.public ? token : null });
}
