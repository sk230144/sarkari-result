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

export function detectCategory(title: string): JobCategory {
  const t = title.toLowerCase();
  if (t.includes("result") || t.includes("scorecard")) return "result";
  if (
    t.includes("admit card") ||
    t.includes("hall ticket") ||
    t.includes("call letter")
  )
    return "admit_card";
  if (t.includes("answer key") || t.includes("answer sheet"))
    return "answer_key";
  if (t.includes("syllabus")) return "syllabus";
  if (t.includes("scholarship") || t.includes("fellowship"))
    return "scholarship";
  return "job";
}

export function extractLastDate(text: string): string | null {
  const patterns = [
    /(\d{2}[-\/]\d{2}[-\/]\d{4})/,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    /closes?\s+on\s+(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /last\s+date[:\s]+(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
    /apply.*?(\d{2}[-\/]\d{2}[-\/]\d{4})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        const d = new Date(match[1].replace(/[-\/]/g, "/"));
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2024) {
          return d.toISOString().split("T")[0];
        }
      } catch {}
    }
  }
  return null;
}

function extractOrgFromTitle(title: string): string {
  // Extract org name from common patterns like "XYZ Recruitment 2026"
  const match = title.match(/^(.+?)\s+(?:Recruitment|Result|Admit|Answer|Syllabus|Notification)/i);
  if (match) return match[1].trim();
  return "Government of India";
}

function extractTagsFromTitle(title: string): string[] {
  const tags: string[] = [];
  const t = title.toLowerCase();
  if (t.includes("ssc")) tags.push("SSC");
  if (t.includes("upsc") || t.includes("ias") || t.includes("ips")) tags.push("UPSC");
  if (t.includes("railway") || t.includes("rrb") || t.includes("rrbc") || t.includes("rpf")) tags.push("Railway");
  if (t.includes("bank") || t.includes("ibps") || t.includes("sbi") || t.includes("rbi")) tags.push("Bank");
  if (t.includes("police") || t.includes("constable")) tags.push("Police");
  if (t.includes("army") || t.includes("navy") || t.includes("airforce") || t.includes("defence")) tags.push("Defence");
  if (t.includes("teaching") || t.includes("teacher") || t.includes("professor")) tags.push("Teaching");
  if (t.includes("engineer") || t.includes("je ") || t.includes("ae ")) tags.push("Engineering");
  if (tags.length === 0) tags.push("Govt Job");
  tags.push("Central Govt");
  return tags;
}

// Parse RSS XML and return jobs
function parseRSSFeed(xml: string, source: string): ScrapedJob[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const jobs: ScrapedJob[] = [];

  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim() ||
                 $(el).find("guid").first().text().trim();
    const description = $(el).find("description").first().text().trim();
    const pubDate = $(el).find("pubDate").first().text().trim();

    if (!title || title.length < 5) return;

    let postDate = new Date().toISOString().split("T")[0];
    if (pubDate) {
      try {
        const d = new Date(pubDate);
        if (!isNaN(d.getTime())) postDate = d.toISOString().split("T")[0];
      } catch {}
    }

    const fullText = `${title} ${description}`;

    jobs.push({
      title: title.substring(0, 250),
      organization: extractOrgFromTitle(title),
      category: detectCategory(title),
      notification_url: link || null,
      apply_url: link || null,
      post_date: postDate,
      last_date: extractLastDate(fullText),
      short_description: description
        ? description.replace(/<[^>]+>/g, "").substring(0, 300)
        : null,
      tags: extractTagsFromTitle(title),
      source,
    });
  });

  return jobs;
}

// ─── RSS Feed Sources ────────────────────────────────────────────────────────

export async function scrapeFreeJobAlert(): Promise<ScrapedJob[]> {
  try {
    const res = await fetch("https://www.freejobalert.com/feed/", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSSFeed(xml, "freejobalert.com").slice(0, 25);
  } catch (err) {
    console.error("[FreeJobAlert] Error:", err);
    return [];
  }
}

export async function scrapeEmploymentNews(): Promise<ScrapedJob[]> {
  try {
    const res = await fetch("https://www.employmentnews.gov.in/NewMain/RssFeeds", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobBot/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSSFeed(xml, "employmentnews.gov.in").slice(0, 15);
  } catch (err) {
    console.error("[EmploymentNews] Error:", err);
    return [];
  }
}

export async function scrapeNaukri(): Promise<ScrapedJob[]> {
  // Naukri govt jobs RSS
  try {
    const res = await fetch(
      "https://www.naukri.com/rss/search-results.rss?qf=government-jobs",
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; JobBot/1.0)" },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    return parseRSSFeed(xml, "naukri.com").slice(0, 10);
  } catch (err) {
    console.error("[Naukri] Error:", err);
    return [];
  }
}

// Keep these as named exports so scrape-jobs.ts import works
export const scrapeSSC = scrapeFreeJobAlert;
export const scrapeUPSC = scrapeEmploymentNews;
export const scrapeIBPS = scrapeNaukri;
export async function scrapeRailway(): Promise<ScrapedJob[]> { return []; }
