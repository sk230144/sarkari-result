/**
 * USD per 1M tokens, standard tier. Thinking tokens are billed as output.
 * Update here when Google changes prices or a new model is added.
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Free of charge on the Gemini API (paid tier "Not available" per Google's pricing page).
  "gemma-4-31b-it": { input: 0, output: 0 },
  "gemma-4-26b-a4b-it": { input: 0, output: 0 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
  "gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
};

// Unknown models are costed at the priciest known rate so spend is never understated.
const FALLBACK = { input: 0.3, output: 2.5 };

export const USD_TO_INR = Number(process.env.USD_TO_INR) || 85;

export function costUsd(model: string, input: number, output: number, thinking: number): number {
  const p = MODEL_PRICING[model] ?? FALLBACK;
  return (input * p.input + (output + thinking) * p.output) / 1_000_000;
}
