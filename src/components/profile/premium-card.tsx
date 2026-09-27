"use client";

import Link from "next/link";
import { Crown, Laptop, Sparkles } from "lucide-react";
import { daysLeft, isPremiumActive } from "@/lib/premium";
import { useEditor } from "./editor-context";
import { Card } from "./ui";

/** Membership status in the profile sidebar: PRO+ until when, or an upgrade prompt. */
export function PremiumCard() {
  const { profile } = useEditor();
  const until = profile.premiumUntil;
  const active = isPremiumActive(until);
  const expired = Boolean(until) && !active;
  const left = daysLeft(until);
  const date = until ? new Date(until).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <Card className={active ? "border-[var(--color-c-lime)]/35" : ""}>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text)]">
            <Crown className={`h-4 w-4 ${active ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-muted)]"}`} />
            Membership
          </h2>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
              active ? "bg-[var(--color-c-lime)] text-black" : "border border-[var(--color-c-border)] text-[var(--color-c-muted)]"
            }`}
          >
            {active ? "PRO+" : "Free"}
          </span>
        </div>
        {active ? (
          <>
            <p className="mt-3 text-[12px] text-[var(--color-c-text-4)]">
              PRO+ until <b className="text-[var(--color-c-text)]">{date}</b>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-[var(--color-c-lime)]" style={{ width: `${Math.min(100, (left / 90) * 100)}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--color-c-dim)]">
              {left} day{left === 1 ? "" : "s"} left{left <= 7 ? " · renew to keep PRO+ without a break" : ""}
            </p>
            <AppLine until={profile.appAccessUntil} />
            <Link href="/pricing" className="mt-3 inline-flex text-[11px] font-semibold text-[var(--color-c-lime)] hover:underline">
              Extend PRO+ →
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-c-muted)]">
              {expired ? `Your PRO+ ended on ${date}.` : "Unlimited resume scores, cover letters and mock interviews."}
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[12px] font-bold text-black"
            >
              <Sparkles className="h-3.5 w-3.5" /> {expired ? "Renew PRO+" : "Upgrade to PRO+"}
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}

/** Whether the AI Interview Assistant add-on is part of this membership. */
function AppLine({ until }: { until: string | null }) {
  const on = isPremiumActive(until);
  const date = until ? new Date(until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  return (
    <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-2.5 py-2 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
      <Laptop className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${on ? "text-[var(--color-c-lime)]" : ""}`} />
      {on ? (
        <span>
          AI Interview Assistant until <b className="text-[var(--color-c-text)]">{date}</b> ·{" "}
          <Link href="/interview-assistant#download" className="font-semibold text-[var(--color-c-lime)] hover:underline">
            Download
          </Link>
        </span>
      ) : (
        <span>
          AI Interview Assistant not included ·{" "}
          <Link href="/pricing?app=1" className="font-semibold text-[var(--color-c-lime)] hover:underline">
            Add it
          </Link>
        </span>
      )}
    </p>
  );
}
