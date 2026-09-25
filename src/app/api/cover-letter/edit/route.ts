import { NextResponse } from "next/server";
import { LETTER_STYLES, EDIT_PRESETS, type LetterStyle, type EditPreset } from "@/lib/cover-letter-config";
import { generateJson, GeminiError } from "@/lib/gemini";
import { getSessionUser, serviceDb, remainingAiCalls, logAiUsage } from "@/lib/server-auth";
import {
  EDIT_SYSTEM_PROMPT,
  LETTER_COLUMNS,
  toLetterResult,
  withParagraphs,
  type LetterRow,
} from "@/lib/cover-letter-server";

const UUID = /^[0-9a-f-]{36}$/i;

/**
 * Rewrites one existing letter body with a preset instruction. Sends only
 * that letter (~300 tokens) — no CV, no JD.
 *
 * Body: { letterId, style, preset }
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  let body: { letterId?: unknown; style?: unknown; preset?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const letterId = typeof body.letterId === "string" && UUID.test(body.letterId) ? body.letterId : null;
  const style =
    typeof body.style === "string" && (LETTER_STYLES as readonly string[]).includes(body.style)
      ? (body.style as LetterStyle)
      : null;
  const preset =
    typeof body.preset === "string" && body.preset in EDIT_PRESETS ? (body.preset as EditPreset) : null;
  if (!letterId || !style || !preset) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const db = serviceDb();
  const { data: row } = await db
    .from("cover_letters")
    .select(LETTER_COLUMNS)
    .eq("id", letterId)
    .eq("user_id", user.id)
    .maybeSingle<LetterRow>();
  if (!row) return NextResponse.json({ error: "Letter not found." }, { status: 404 });

  const remaining = await remainingAiCalls(db, user);
  if (remaining === 0) {
    return NextResponse.json(
      { error: "You've reached today's AI limit. It resets within 24 hours." },
      { status: 429 },
    );
  }

  let result;
  try {
    result = await generateJson({
      system: EDIT_SYSTEM_PROMPT,
      user: `Edit this cover letter body: ${EDIT_PRESETS[preset].instruction}\nKeep facts unchanged. Return JSON {"text": "..."}\nLETTER: ${row[style]}`,
      fields: ["text"] as const,
      maxOutputTokens: style === "short" ? 250 : 450,
      temperature: 0.5,
    });
  } catch (err) {
    const e = err instanceof GeminiError ? err : new GeminiError("Edit failed.");
    return NextResponse.json({ error: e.message }, { status: e.status });
  }

  await logAiUsage(db, user.id, `cover_letter_edit_${preset}`, result.model, result.usage);

  const { data: updated } = await db
    .from("cover_letters")
    .update({ [style]: withParagraphs(style, result.data.text), updated_at: new Date().toISOString() })
    .eq("id", row.id)
    .select(LETTER_COLUMNS)
    .single<LetterRow>();
  if (!updated) return NextResponse.json({ error: "Could not save the edit." }, { status: 500 });

  return NextResponse.json(
    await toLetterResult(db, user, updated, false, remaining === null ? null : remaining - 1),
  );
}
