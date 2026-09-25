"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { GithubCalendar } from "@/lib/profile/types";

const DARK = ["#1b2319", "#2f4f1a", "#4d7c0f", "#65a30d", "#a3e635"];
const LIGHT = ["#ebedf0", "#bef264", "#84cc16", "#4d7c0f", "#365314"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Cell = GithubCalendar["days"][number] | null;

/** Weeks as columns (Sunday on top), padded so the first column starts on Sunday. */
function toWeeks(days: GithubCalendar["days"]): Cell[][] {
  if (!days.length) return [];
  const first = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const cells: Cell[] = [...Array<Cell>(first).fill(null), ...days];
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function GithubHeatmap({ username, light = false }: { username: string; light?: boolean }) {
  const [data, setData] = useState<GithubCalendar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/github/${encodeURIComponent(username)}`)
      .then(async (r) => {
        const json = await r.json();
        if (cancelled) return;
        if (!r.ok) {
          setError(json.error ?? "Couldn't load contributions.");
          setData(null);
        } else {
          setData(json);
          setError(null);
        }
        setLoadedFor(username);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't load contributions.");
          setLoadedFor(username);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const palette = light ? LIGHT : DARK;
  const muted = light ? "text-slate-500" : "text-[var(--color-c-dim)]";

  if (loadedFor !== username) {
    return (
      <p className={`flex items-center gap-2 py-6 text-[12px] ${muted}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading contributions…
      </p>
    );
  }
  if (error || !data) return <p className="py-3 text-[12px] text-red-400">{error}</p>;

  const weeks = toWeeks(data.days);
  const monthLabels = weeks.map((w, i) => {
    const d = w.find(Boolean);
    if (!d) return "";
    const m = Number(d.date.slice(5, 7)) - 1;
    const prev = weeks[i - 1]?.find(Boolean);
    return !prev || Number(prev.date.slice(5, 7)) - 1 !== m ? MONTHS[m] : "";
  });

  return (
    <div>
      <p className={`mb-2 text-[12px] ${light ? "text-slate-700" : "text-[var(--color-c-text-4)]"}`}>
        <span className="font-bold">{data.total.toLocaleString("en-IN")}</span> contributions in the last year
      </p>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-[3px] pl-0">
            {monthLabels.map((m, i) => (
              <span key={i} className={`w-[10px] shrink-0 overflow-visible whitespace-nowrap text-[9px] ${muted}`}>
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((w, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }, (_, d) => {
                  const c = w[d];
                  return (
                    <span
                      key={d}
                      title={c ? `${c.count} contribution${c.count === 1 ? "" : "s"} on ${c.date}` : undefined}
                      className="h-[10px] w-[10px] rounded-[2px]"
                      style={{ backgroundColor: c ? palette[Math.min(4, c.level)] : "transparent" }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`mt-2 flex items-center justify-end gap-1 text-[9px] ${muted}`}>
        Less
        {palette.map((c) => (
          <span key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        More
      </div>
    </div>
  );
}
