import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { ROLES, LETTER_STYLES, type LetterStyle } from "@/lib/cover-letter-config";
import { JOB_DESCRIPTION_MAX_CHARS } from "@/lib/resume-text-limits";
import { cleanJobDescription } from "@/lib/jd-clean";
import { generateJson, GeminiError } from "@/lib/gemini";
import { getSessionUser, serviceDb, remainingAiCalls, logAiUsage } from "@/lib/server-auth";
import {
  LETTER_SYSTEM_PROMPT,
  LETTER_COLUMNS,
  toLetterResult,
  withParagraphs,
  type LetterRow,
} from "@/lib/cover-letter-server";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Generates all three letter bodies in one call, or serves them from cache.
 *
 * Body: { cvId, role, jd?, regenerate?, style? }
 *  - regenerate: skip the cache and write a fresh set of three.
 *  - style: rewrite only that one style of the cached set (1/3 the output).
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: { cvId?: unknown; role?: unknown; jd?: unknown; regenerate?: unknown; style?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const cvId = typeof body.cvId === "string" && UUID.test(body.cvId) ? body.cvId : null;
  const role = typeof body.role === "string" && ROLES.includes(body.role) ? body.role : null;
  const jdRaw = typeof body.jd === "string" ? body.jd : "";
  const style =
    typeof body.style === "string" && (LETTER_STYLES as readonly string[]).includes(body.style)
      ? (body.style as LetterStyle)
      : null;
  const regenerate = body.regenerate === true;

  if (!cvId || !role) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (jdRaw.length > JOB_DESCRIPTION_MAX_CHARS) {
    return NextResponse.json(
      { error: `Job description is too long (max ${JOB_DESCRIPTION_MAX_CHARS} characters).` },
      { status: 413 },
    );
  }

  const db = serviceDb();

  const { data: cv } = await db
    .from("cv_documents")
    .select("id, cleaned_text")
    .eq("id", cvId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cv) return NextResponse.json({ error: "Resume not found. Please re-select it." }, { status: 404 });

  const jd = cleanJobDescription(jdRaw);
  const jdHash = createHash("sha256").update(`${role}\n${jd}`).digest("hex");

  const { data: existing } = await db
    .from("cover_letters")
    .select(LETTER_COLUMNS)
    .eq("user_id", user.id)
    .eq("cv_id", cvId)
    .eq("jd_hash", jdHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<LetterRow>();

  const remaining = await remainingAiCalls(db, user);

  if (existing && !regenerate && !style) {
    return NextResponse.json(await toLetterResult(db, user, existing, true, remaining));
  }

  if (remaining === 0) {
    return NextResponse.json(
      { error: "You've reached today's AI limit. It resets within 24 hours." },
      { status: 429 },
    );
  }

  const single = style && existing ? style : null;
  const fields = single ? ([single] as const) : LETTER_STYLES;
  const user_msg =
    `ROLE: ${role}\nJD: ${jd || "Not provided"}\nCV: ${cv.cleaned_text}` +
    (single ? `\n\nWrite ONLY the ${single} style.` : "");

  let result;
  try {
    result = await generateJson({
      system: LETTER_SYSTEM_PROMPT,
      user: user_msg,
      fields,
      maxOutputTokens: single ? (single === "short" ? 250 : 450) : 900,
      temperature: 0.7,
    });
  } catch (err) {
    const e = err instanceof GeminiError ? err : new GeminiError("Generation failed.");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }

  await logAiUsage(db, user.id, single ? `cover_letter_${single}` : "cover_letter", result.model, result.usage);

  const now = new Date().toISOString();
  let row: LetterRow | null;
  if (single && existing) {
    const { data } = await db
      .from("cover_letters")
      .update({
        [single]: withParagraphs(single, result.data[single]),
        updated_at: now,
        model: result.model,
      })
      .eq("id", existing.id)
      .select(LETTER_COLUMNS)
      .single<LetterRow>();
    row = data;
  } else {
    const d = result.data as Record<LetterStyle, string>;
    const { data } = await db
      .from("cover_letters")
      .insert({
        user_id: user.id,
        cv_id: cvId,
        jd_hash: jdHash,
        role,
        jd_clean: jd || null,
        operator: withParagraphs("operator", d.operator),
        believer: withParagraphs("believer", d.believer),
        short: withParagraphs("short", d.short),
        model: result.model,
      })
      .select(LETTER_COLUMNS)
      .single<LetterRow>();
    row = data;
  }

  if (!row) return NextResponse.json({ error: "Could not save the letter." }, { status: 500 });

  return NextResponse.json(
    await toLetterResult(db, user, row, false, remaining === null ? null : remaining - 1),
  );
}
