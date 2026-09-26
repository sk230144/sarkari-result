import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { CHALLENGES, COUNTRIES, SOURCES, STAGES, type OnboardingState } from "@/lib/onboarding";

export const dynamic = "force-dynamic";

const PHONE = /^\+?[\d\s()-]{7,20}$/;

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { data: p } = await serviceDb()
    .from("profiles")
    .select("full_name, country, apply_details, contact_consent, job_search_stage, challenges, heard_from, resume_path, resume_filename, resume_uploaded_at, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  const state: OnboardingState = {
    name: (p?.full_name as string) || user.email?.split("@")[0] || "",
    country: (p?.country as string) ?? null,
    phone: ((p?.apply_details as Record<string, string> | null)?.phone as string) ?? "",
    consent: Boolean(p?.contact_consent),
    stage: (p?.job_search_stage as OnboardingState["stage"]) ?? null,
    challenges: (p?.challenges as string[]) ?? [],
    source: (p?.heard_from as string) ?? null,
    resume: p?.resume_path ? { filename: (p.resume_filename as string) ?? null, uploadedAt: (p.resume_uploaded_at as string) ?? null } : null,
    onboardedAt: (p?.onboarded_at as string) ?? null,
  };
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}

/** Saves all answers and marks onboarding complete. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const country = typeof b.country === "string" && COUNTRIES.includes(b.country) ? b.country : null;
  if (!country) return NextResponse.json({ error: "Please select your country." }, { status: 400 });

  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  if (phone && !PHONE.test(phone)) return NextResponse.json({ error: "That phone number doesn't look right." }, { status: 400 });

  const stage = STAGES.find((s) => s.key === b.stage)?.key;
  if (!stage) return NextResponse.json({ error: "Please pick where you are in your job search." }, { status: 400 });

  const challenges = Array.isArray(b.challenges) ? [...new Set(b.challenges.filter((c): c is string => typeof c === "string" && CHALLENGES.includes(c)))] : [];
  if (!challenges.length) return NextResponse.json({ error: "Select at least one challenge." }, { status: 400 });

  const source = typeof b.source === "string" && SOURCES.includes(b.source) ? b.source : null;
  if (!source) return NextResponse.json({ error: "Tell us how you heard about us." }, { status: 400 });

  const db = serviceDb();
  const { data: current } = await db.from("profiles").select("apply_details, location").eq("id", user.id).maybeSingle();
  const apply = { ...((current?.apply_details as Record<string, string>) ?? {}) };
  if (phone) apply.phone = phone;

  const { error } = await db
    .from("profiles")
    .update({
      country,
      apply_details: apply,
      contact_consent: b.consent === true,
      job_search_stage: stage,
      challenges,
      heard_from: source,
      onboarded_at: new Date().toISOString(),
      // Fill the profile location from the country if nothing better is set.
      ...(current?.location ? {} : { location: country === "Other" ? null : country }),
    })
    .eq("id", user.id);
  if (error) {
    console.error("onboarding save failed", error.message);
    return NextResponse.json({ error: "Couldn't save your answers. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
