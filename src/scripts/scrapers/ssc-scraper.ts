import * as cheerio from "cheerio";
import type { JobCategory } from "@/types";

export interface ScrapedJob {
  title: string;
  organization: string;
  category: JobCategory;
  notification_url: string | null;
  apply_url: string | null;
  post_date: string;
  last_date: string | null;
  short_description: string | null;
  tags: string[];
  source: string;
}

// Detect category from title keywords
export function detectCategory(title: string): JobCategory {
  const t = title.toLowerCase();
  if (t.includes("result")) return "result";
  if (t.includes("admit card") || t.includes("hall ticket") || t.includes("call letter")) return "admit_card";
  if (t.includes("answer key") || t.includes("answer sheet")) return "answer_key";
  if (t.includes("syllabus")) return "syllabus";
  if (t.includes("scholarship") || t.includes("fellowship")) return "scholarship";
  return "job";
}

// Extract last date from text
export function extractLastDate(text: string): string | null {
  const patterns = [
    /last\s+date[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /apply\s+by[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /closing\s+date[:\s]+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    /(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/,
    /(\d{1,2}\s+\w+\s+\d{4})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const d = new Date(match[1].replace(/[-\/]/g, "/"));
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      } catch {}
    }
  }
  return null;
}

export async function scrapeSSC(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const res = await fetch("https://ssc.gov.in/portal/latestNews", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`SSC fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // SSC latest news/notifications table rows
    $("table tr, .news-list li, .notification-list li, ul.list li").each((_, el) => {
      const text = $(el).text().trim();
      const link = $(el).find("a").attr("href") || null;

      if (!text || text.length < 10) return;

      const title = text.substring(0, 200).trim();
      const notifUrl = link
        ? link.startsWith("http")
          ? link
          : `https://ssc.gov.in${link}`
        : null;

      jobs.push({
        title,
        organization: "Staff Selection Commission (SSC)",
        category: detectCategory(title),
        notification_url: notifUrl,
        apply_url: notifUrl,
        post_date: new Date().toISOString().split("T")[0],
        last_date: extractLastDate(text),
        short_description: `Latest notification from SSC: ${title.substring(0, 100)}`,
        tags: ["SSC", "Central Govt"],
        source: "ssc.gov.in",
      });
    });
  } catch (err) {
    console.error("[SSC Scraper] Error:", err);
  }

  return jobs.slice(0, 20);
}

export async function scrapeUPSC(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const res = await fetch("https://upsc.gov.in/whatsnew", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`UPSC fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("table tr, .view-content .views-row, ul li, .item-list li").each((_, el) => {
      const text = $(el).text().trim();
      const link = $(el).find("a").attr("href") || null;

      if (!text || text.length < 10) return;

      const title = text.substring(0, 200).trim();
      const notifUrl = link
        ? link.startsWith("http")
          ? link
          : `https://upsc.gov.in${link}`
        : null;

      jobs.push({
        title,
        organization: "Union Public Service Commission (UPSC)",
        category: detectCategory(title),
        notification_url: notifUrl,
        apply_url: "https://upsconline.gov.in",
        post_date: new Date().toISOString().split("T")[0],
        last_date: extractLastDate(text),
        short_description: `Latest UPSC notification: ${title.substring(0, 100)}`,
        tags: ["UPSC", "Central Govt", "IAS", "IPS"],
        source: "upsc.gov.in",
      });
    });
  } catch (err) {
    console.error("[UPSC Scraper] Error:", err);
  }

  return jobs.slice(0, 20);
}

export async function scrapeIBPS(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const res = await fetch("https://www.ibps.in/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`IBPS fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $(".what-new li, .news-update li, table tr, ul.newsList li").each((_, el) => {
      const text = $(el).text().trim();
      const link = $(el).find("a").attr("href") || null;

      if (!text || text.length < 10) return;

      const title = text.substring(0, 200).trim();
      const notifUrl = link
        ? link.startsWith("http")
          ? link
          : `https://www.ibps.in${link}`
        : null;

      jobs.push({
        title,
        organization: "Institute of Banking Personnel Selection (IBPS)",
        category: detectCategory(title),
        notification_url: notifUrl,
        apply_url: notifUrl,
        post_date: new Date().toISOString().split("T")[0],
        last_date: extractLastDate(text),
        short_description: `Latest IBPS notification: ${title.substring(0, 100)}`,
        tags: ["IBPS", "Bank", "Banking"],
        source: "ibps.in",
      });
    });
  } catch (err) {
    console.error("[IBPS Scraper] Error:", err);
  }

  return jobs.slice(0, 20);
}

export async function scrapeRailway(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];

  try {
    const res = await fetch("https://indianrailways.gov.in/railwayboard/view_section.jsp?lang=0&id=0,1,304,366,554", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) throw new Error(`Railway fetch failed: ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    $("table tr, ul li, .notification li").each((_, el) => {
      const text = $(el).text().trim();
      const link = $(el).find("a").attr("href") || null;

      if (!text || text.length < 10) return;
      if (!text.toLowerCase().includes("recruit") &&
          !text.toLowerCase().includes("vacanc") &&
          !text.toLowerCase().includes("result") &&
          !text.toLowerCase().includes("admit") &&
          !text.toLowerCase().includes("ntpc") &&
          !text.toLowerCase().includes("rrb")) return;

      const title = text.substring(0, 200).trim();
      const notifUrl = link
        ? link.startsWith("http")
          ? link
          : `https://indianrailways.gov.in${link}`
        : "https://www.rrbapply.gov.in";

      jobs.push({
        title,
        organization: "Indian Railways / RRB",
        category: detectCategory(title),
        notification_url: notifUrl,
        apply_url: "https://www.rrbapply.gov.in",
        post_date: new Date().toISOString().split("T")[0],
        last_date: extractLastDate(text),
        short_description: `Latest Railway notification: ${title.substring(0, 100)}`,
        tags: ["Railway", "RRB", "Central Govt"],
        source: "indianrailways.gov.in",
      });
    });
  } catch (err) {
    console.error("[Railway Scraper] Error:", err);
  }

  return jobs.slice(0, 20);
}
