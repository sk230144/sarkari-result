import { NextResponse } from "next/server";
import type { GithubCalendar } from "@/lib/profile/types";

const GITHUB_USER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * Last year of GitHub contributions for a username.
 *
 * Reads GitHub's public contributions fragment (what the profile page
 * itself loads), so no token or OAuth is needed. Cached for 6 hours.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!GITHUB_USER.test(username)) {
    return NextResponse.json({ error: "That isn't a valid GitHub username." }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      headers: { "User-Agent": "jobalert24-profile", Accept: "text/html" },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 404) {
      return NextResponse.json({ error: "No GitHub user with that name." }, { status: 404 });
    }
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Couldn't reach GitHub. Try again in a moment." }, { status: 502 });
  }

  // Exact counts live in tooltips keyed by the day cell's id.
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,]*|No) contribution/);
    if (n) counts.set(m[1], n[1] === "No" ? 0 : Number(n[1].replace(/,/g, "")));
  }

  const days: GithubCalendar["days"] = [];
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const level = Number(tag.match(/data-level="(\d)"/)?.[1] ?? 0);
    const cellId = tag.match(/\bid="([^"]+)"/)?.[1] ?? "";
    if (date) days.push({ date, level, count: counts.get(cellId) ?? 0 });
  }
  if (!days.length) {
    return NextResponse.json({ error: "Couldn't read contributions for that user." }, { status: 502 });
  }
  days.sort((a, b) => a.date.localeCompare(b.date));

  const totalMatch = html.match(/([\d,]+)\s+contributions?\s+in the last year/);
  const total = totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : days.reduce((n, d) => n + d.count, 0);

  const body: GithubCalendar = { username, total, days };
  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
  });
}
