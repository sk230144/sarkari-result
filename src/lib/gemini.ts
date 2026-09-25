import "server-only";

/**
 * Tried in order. Defaults to the cheapest fast paid model open to new keys.
 * An optional fallback can be set in env (e.g. the free but slower
 * gemma-4-31b-it) without a code change.
 */
export const COVER_LETTER_MODELS = [
  process.env.GEMINI_COVER_LETTER_MODEL || "gemini-3.1-flash-lite",
  process.env.GEMINI_COVER_LETTER_FALLBACK_MODEL || "",
].filter((m, i, all) => m && all.indexOf(m) === i);

export class GeminiError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
  }
}

export type Usage = { input: number; output: number; thinking: number };

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
  };
};

const isGemma = (model: string) => model.startsWith("gemma");

function requestBody(model: string, opts: CallOpts<string>): string {
  const generationConfig: Record<string, unknown> = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: Object.fromEntries(opts.fields.map((f) => [f, { type: "STRING" }])),
      required: opts.fields,
    },
    maxOutputTokens: opts.maxOutputTokens,
    temperature: opts.temperature,
  };
  // Thinking is billed as output; Gemma has no thinking config to set.
  if (!isGemma(model)) generationConfig.thinkingConfig = { thinkingLevel: "minimal" };

  // Gemma on this API takes no systemInstruction, so the rules lead the message.
  return JSON.stringify(
    isGemma(model)
      ? {
          contents: [{ role: "user", parts: [{ text: `${opts.system}\n\n${opts.user}` }] }],
          generationConfig,
        }
      : {
          systemInstruction: { parts: [{ text: opts.system }] },
          contents: [{ role: "user", parts: [{ text: opts.user }] }],
          generationConfig,
        },
  );
}

type CallOpts<K extends string> = {
  system: string;
  user: string;
  fields: readonly K[];
  maxOutputTokens: number;
  temperature: number;
};

type Attempt<K extends string> =
  | { ok: true; data: Record<K, string>; usage: Usage }
  | { ok: false; retryable: boolean; error: GeminiError; usage?: Usage };

async function callOnce<K extends string>(
  model: string,
  key: string,
  opts: CallOpts<K>,
): Promise<Attempt<K>> {
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: requestBody(model, opts),
        signal: AbortSignal.timeout(isGemma(model) ? 25_000 : 30_000),
      },
    );
  } catch {
    return {
      ok: false,
      retryable: true,
      error: new GeminiError("The AI took too long to respond. Please try again.", 504),
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      retryable: false,
      error: new GeminiError("The AI is busy right now. Please try again in a minute.", 503),
    };
  }
  if (!res.ok) {
    console.error("Gemini error", model, res.status, (await res.text()).slice(0, 300));
    return {
      ok: false,
      retryable: res.status >= 500,
      error: new GeminiError("The AI could not generate a response. Please try again."),
    };
  }

  const json = (await res.json()) as GeminiResponse;
  const usage: Usage = {
    input: json.usageMetadata?.promptTokenCount ?? 0,
    output: json.usageMetadata?.candidatesTokenCount ?? 0,
    thinking: json.usageMetadata?.thoughtsTokenCount ?? 0,
  };
  const text =
    json.candidates?.[0]?.content?.parts?.filter((p) => !p.thought).map((p) => p.text ?? "").join("") ?? "";

  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const data = {} as Record<K, string>;
    for (const f of opts.fields) {
      const v = parsed[f];
      if (typeof v !== "string" || !v.trim()) throw new Error(`missing ${f}`);
      data[f] = v.replace(/\*\*|__|^#+\s*/gm, "").trim();
    }
    return { ok: true, data, usage };
  } catch {
    return {
      ok: false,
      retryable: true,
      error: new GeminiError("The AI returned an unreadable response. Please try again."),
      usage,
    };
  }
}

/**
 * One structured call: every field is a required string and output is
 * capped. Walks COVER_LETTER_MODELS: the free model gets one try, and the
 * paid fallback gets one retry on bad JSON or a 5xx before giving up.
 */
export async function generateJson<K extends string>(
  opts: CallOpts<K>,
): Promise<{ data: Record<K, string>; usage: Usage; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("AI is not configured.", 500);

  let lastError = new GeminiError("The AI could not generate a response. Please try again.");

  for (const [i, model] of COVER_LETTER_MODELS.entries()) {
    const isLast = i === COVER_LETTER_MODELS.length - 1;
    const tries = isLast ? 2 : 1;
    // Tokens from failed paid attempts are still billed, so they are counted.
    const spent: Usage = { input: 0, output: 0, thinking: 0 };

    for (let t = 0; t < tries; t++) {
      const r = await callOnce(model, key, opts);
      if (r.ok) {
        return {
          data: r.data,
          model,
          usage: {
            input: spent.input + r.usage.input,
            output: spent.output + r.usage.output,
            thinking: spent.thinking + r.usage.thinking,
          },
        };
      }
      lastError = r.error;
      if (r.usage) {
        spent.input += r.usage.input;
        spent.output += r.usage.output;
        spent.thinking += r.usage.thinking;
      }
      if (!r.retryable) break;
    }
  }

  throw lastError;
}
