import { NextRequest, NextResponse } from "next/server";
import { runScraper } from "@/scripts/scrape-jobs";

export const maxDuration = 60; // 60 seconds max (Vercel limit)
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  // Allow requests with correct secret OR from Vercel cron (no auth header)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Job scraper triggered");
    const results = await runScraper();

    return NextResponse.json({
      success: true,
      message: "Scraping completed",
      ...results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Scraper error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
