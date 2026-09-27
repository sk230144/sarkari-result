import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

/**
 * The resume on a public profile: `?download=1` saves it, otherwise it opens
 * in the browser. Redirects to a signed link that works for 5 minutes (the
 * bucket stays private). Works only for public profiles whose owner
 * shows their resume (and always for the owner themself).
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,30}$/.test(slug)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const db = serviceDb();
  const { data: row } = await db.from("profiles").select("*").eq("slug", slug).maybeSingle();
  if (!row?.resume_path) return NextResponse.json({ error: "No resume on this profile." }, { status: 404 });

  const shown = row.is_public === true && row.show_resume !== false;
  if (!shown) {
    const user = await getSessionUser();
    if (user?.id !== row.id) return NextResponse.json({ error: "No resume on this profile." }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const name = String(row.full_name || slug).replace(/[^\p{L}\p{N} ._-]/gu, "").trim() || "resume";
  const { data, error } = await db.storage
    .from("user-documents")
    .createSignedUrl(row.resume_path as string, 300, download ? { download: `${name} - Resume.pdf` } : undefined);
  if (error || !data?.signedUrl) return NextResponse.json({ error: "Couldn't open the resume." }, { status: 502 });

  return NextResponse.redirect(data.signedUrl, { status: 302, headers: { "Cache-Control": "no-store" } });
}
