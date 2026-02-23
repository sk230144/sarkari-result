"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface ScrapeResult {
  success: boolean;
  inserted?: number;
  skipped?: number;
  total?: number;
  sources?: Record<string, number>;
  error?: string;
}

export function RunScraperBtn() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);

  async function handleRun() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/scrape", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`,
        },
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleRun}
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-white font-black border-0 shadow-md shadow-amber-500/20 w-full"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Scraping Jobs..." : "Run Job Scraper"}
      </Button>

      {result && (
        <div
          className={`rounded-xl p-3 text-xs font-semibold border ${
            result.success
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {result.success ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Scraping Complete
              </div>
              <div>Total scraped: {result.total}</div>
              <div>New jobs inserted: {result.inserted}</div>
              <div>Duplicates skipped: {result.skipped}</div>
              {result.sources && Object.keys(result.sources).length > 0 && (
                <div className="mt-1 pt-1 border-t border-emerald-200">
                  {Object.entries(result.sources).map(([src, count]) => (
                    <div key={src}>
                      {src}: {count} jobs
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5" />
              Error: {result.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
