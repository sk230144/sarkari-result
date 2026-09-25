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

export const ANALYZER_MODELS = [
  process.env.GEMINI_ANALYZER_MODEL || "gemini-3.1-flash-lite",
  process.env.GEMINI_ANALYZER_FALLBACK_MODEL || "",
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

/** Gemini's OpenAPI-subset response schema. */
export type Schema = Record<string, unknown>;

type StructuredOpts<T> = {
  system: string;
  user: string;
  schema: Schema;
  /** Validates and coerces the parsed JSON; throw to treat it as invalid. */
  parse: (value: unknown) => T;
  maxOutputTokens: number;
  temperature: number;
  models?: string[];
};

const isGemma = (model: string) => model.startsWith("gemma");

function requestBody(model: string, opts: StructuredOpts<unknown>): string {
  const generationConfig: Record<string, unknown> = {
    responseMimeType: "application/json",
    responseSchema: opts.schema,
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

type Attempt<T> =
  | { ok: true; data: T; usage: Usage }
  | { ok: false; retryable: boolean; error: GeminiError; usage?: Usage };

async function callOnce<T>(model: string, key: string, opts: StructuredOpts<T>): Promise<Attempt<T>> {
  let res: Response;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: requestBody(model, opts as StructuredOpts<unknown>),
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
    return { ok: true, data: opts.parse(JSON.parse(text)), usage };
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
 * One structured call with output capped. Walks the model list: earlier
 * models get one try, the last gets one retry on bad JSON or a 5xx.
 */
export async function generateStructured<T>(
  opts: StructuredOpts<T>,
): Promise<{ data: T; usage: Usage; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError("AI is not configured.", 500);

  const models = opts.models ?? COVER_LETTER_MODELS;
  let lastError = new GeminiError("The AI could not generate a response. Please try again.");

  for (const [i, model] of models.entries()) {
    const tries = i === models.length - 1 ? 2 : 1;
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

/** Flat object of required, non-empty string fields (cover letters). */
export function generateJson<K extends string>(opts: {
  system: string;
  user: string;
  fields: readonly K[];
  maxOutputTokens: number;
  temperature: number;
}): Promise<{ data: Record<K, string>; usage: Usage; model: string }> {
  return generateStructured({
    system: opts.system,
    user: opts.user,
    maxOutputTokens: opts.maxOutputTokens,
    temperature: opts.temperature,
    schema: {
      type: "OBJECT",
      properties: Object.fromEntries(opts.fields.map((f) => [f, { type: "STRING" }])),
      required: opts.fields,
    },
    parse: (value) => {
      const parsed = value as Record<string, unknown>;
      const data = {} as Record<K, string>;
      for (const f of opts.fields) {
        const v = parsed?.[f];
        if (typeof v !== "string" || !v.trim()) throw new Error(`missing ${f}`);
        data[f] = v.replace(/\*\*|__|^#+\s*/gm, "").trim();
      }
      return data;
    },
  });
}
