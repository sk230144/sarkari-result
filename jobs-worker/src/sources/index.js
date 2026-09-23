import greenhouse from "./greenhouse.js";
import lever from "./lever.js";
import ashby from "./ashby.js";
import smartrecruiters from "./smartrecruiters.js";
import wipro from "./wipro.js";

/** Every adapter implements the §12.1 JobSourceAdapter contract. */
export const ADAPTERS = { greenhouse, lever, ashby, smartrecruiters, wipro };

/** Adapters driven by the company registry rather than a single global feed. */
export const ATS_ADAPTERS = ["greenhouse", "lever", "ashby", "smartrecruiters", "wipro"];

export function getAdapter(key) {
  const a = ADAPTERS[key];
  if (!a) throw new Error(`Unknown source adapter: ${key}`);
  return a;
}
