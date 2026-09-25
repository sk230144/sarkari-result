import "server-only";
import { DAYS } from "@/components/striver/striver-data";
import { BABBAR_TOTAL } from "@/components/striver/babbar-data";
import { NEGI_TOTAL } from "@/components/striver/negi-data";
import { PATTERN_TOTAL } from "@/components/striver/patterns-data";
import { QUESTIONS as SYSTEM_DESIGN } from "@/components/dashboard/system-design-data";
import { AIRBNB_TOTAL } from "@/components/faang/airbnb-data";
import { AMAZON_TOTAL } from "@/components/faang/amazon-data";
import { ANTHROPIC_TOTAL } from "@/components/faang/anthropic-data";
import { APPLE_TOTAL } from "@/components/faang/apple-data";
import { BYTEDANCE_TOTAL } from "@/components/faang/bytedance-data";
import { DATABRICKS_TOTAL } from "@/components/faang/databricks-data";
import { DOORDASH_TOTAL } from "@/components/faang/doordash-data";
import { GOOGLE_TOTAL } from "@/components/faang/google-data";
import { LINKEDIN_TOTAL } from "@/components/faang/linkedin-data";
import { META_TOTAL } from "@/components/faang/meta-data";
import { MICROSOFT_TOTAL } from "@/components/faang/microsoft-data";
import { NETFLIX_TOTAL } from "@/components/faang/netflix-data";
import { NVIDIA_TOTAL } from "@/components/faang/nvidia-data";
import { OPENAI_TOTAL } from "@/components/faang/openai-data";
import { PALANTIR_TOTAL } from "@/components/faang/palantir-data";
import { STRIPE_TOTAL } from "@/components/faang/stripe-data";
import { TESLA_TOTAL } from "@/components/faang/tesla-data";
import { UBER_TOTAL } from "@/components/faang/uber-data";

export type SheetKind = "dsa" | "faang" | "system-design";

export type SheetInfo = { key: string; label: string; href: string; total: number; kind: SheetKind };

const faang = (key: string, label: string, total: number): SheetInfo => ({
  key: `faang-${key}`,
  label: `${label} Questions`,
  href: `/faang-questions/${key}`,
  total,
  kind: "faang",
});

/**
 * Every tracked sheet, keyed by the storageKey its page saves progress
 * under. Totals come from the same data the sheets render, so they stay
 * right when a sheet is edited. Server-only: the question lists are large.
 */
export const SHEETS: SheetInfo[] = [
  {
    key: "striver-sde",
    label: "Striver SDE Sheet",
    href: "/dsa-sheets/striver-a2z",
    total: DAYS.reduce((n, d) => n + d.problems.length, 0),
    kind: "dsa",
  },
  { key: "babbar-450", label: "Love Babbar Sheet", href: "/dsa-sheets/love-babbar", total: BABBAR_TOTAL, kind: "dsa" },
  { key: "negi-725", label: "Rohit Negi Sheet", href: "/dsa-sheets/rohit-negi", total: NEGI_TOTAL, kind: "dsa" },
  { key: "dsa-patterns", label: "20 DSA Patterns", href: "/dsa-patterns", total: PATTERN_TOTAL, kind: "dsa" },
  faang("google", "Google", GOOGLE_TOTAL),
  faang("amazon", "Amazon", AMAZON_TOTAL),
  faang("meta", "Meta", META_TOTAL),
  faang("microsoft", "Microsoft", MICROSOFT_TOTAL),
  faang("apple", "Apple", APPLE_TOTAL),
  faang("netflix", "Netflix", NETFLIX_TOTAL),
  faang("nvidia", "NVIDIA", NVIDIA_TOTAL),
  faang("openai", "OpenAI", OPENAI_TOTAL),
  faang("anthropic", "Anthropic", ANTHROPIC_TOTAL),
  faang("tesla", "Tesla", TESLA_TOTAL),
  faang("uber", "Uber", UBER_TOTAL),
  faang("airbnb", "Airbnb", AIRBNB_TOTAL),
  faang("stripe", "Stripe", STRIPE_TOTAL),
  faang("linkedin", "LinkedIn", LINKEDIN_TOTAL),
  faang("bytedance", "ByteDance", BYTEDANCE_TOTAL),
  faang("databricks", "Databricks", DATABRICKS_TOTAL),
  faang("doordash", "DoorDash", DOORDASH_TOTAL),
  faang("palantir", "Palantir", PALANTIR_TOTAL),
  {
    key: "system-design",
    label: "System Design Sheet",
    href: "/system-design",
    total: SYSTEM_DESIGN.length,
    kind: "system-design",
  },
];
