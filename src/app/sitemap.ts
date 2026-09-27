import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Only public content belongs here. Blog articles have their own sitemap.
const routes = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/cover-letter",
  "/dsa-patterns",
  "/dsa-sheets",
  "/dsa-sheets/love-babbar",
  "/dsa-sheets/neetcode-150",
  "/dsa-sheets/rohit-negi",
  "/dsa-sheets/striver-a2z",
  "/faang-questions",
  "/faang-questions/airbnb",
  "/faang-questions/amazon",
  "/faang-questions/anthropic",
  "/faang-questions/apple",
  "/faang-questions/bytedance",
  "/faang-questions/databricks",
  "/faang-questions/doordash",
  "/faang-questions/google",
  "/faang-questions/linkedin",
  "/faang-questions/meta",
  "/faang-questions/microsoft",
  "/faang-questions/netflix",
  "/faang-questions/nvidia",
  "/faang-questions/openai",
  "/faang-questions/palantir",
  "/faang-questions/stripe",
  "/faang-questions/tesla",
  "/faang-questions/uber",
  "/hire",
  "/interview-assistant",
  "/jobs",
  "/mock-interview",
  "/portfolio-builder",
  "/pricing",
  "/privacy",
  "/resume-analysis",
  "/system-design",
  "/terms"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({ url: `${SITE_URL}${path}` }));
}
