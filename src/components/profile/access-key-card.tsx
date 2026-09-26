"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { Card, SmallButton } from "./ui";

type KeyState =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; key: string; expiresAt: string };

function left(ms: number) {
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h ? `${h}h ${m}m` : m ? `${m}m` : "under a minute";
}

/** The user's rotating access key: hidden by default, replaced every 12 hours. */
export function AccessKeyCard() {
  const [k, setK] = useState<KeyState>({ state: "loading" });
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/access-key", { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) setK({ state: "error", message: j.error ?? "Couldn't load your key." });
      else setK({ state: "ready", key: j.key, expiresAt: j.expiresAt });
    } catch {
      setK({ state: "error", message: "Network error." });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    load();
  }, [load]);

  // Tick the countdown, and fetch the new key the moment the old one expires.
  useEffect(() => {
    if (k.state !== "ready") return;
    const t = setInterval(() => setNow(Date.now()), 30_000);
    const until = new Date(k.expiresAt).getTime() - Date.now();
    const swap = setTimeout(() => {
      setShown(false);
      load();
    }, Math.max(1000, until + 1000));
    return () => {
      clearInterval(t);
      clearTimeout(swap);
    };
  }, [k, load]);

  const ms = k.state === "ready" ? new Date(k.expiresAt).getTime() - now : 0;

  return (
    <Card>
      <div className="border-b border-[var(--color-c-border)] px-4 py-3">
        <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text)]">
          <KeyRound className="h-4 w-4 text-[var(--color-c-lime)]" />
          Your access key
        </h2>
      </div>
      <div className="p-4">
        {k.state === "loading" ? (
          <div className="flex justify-center py-3">
            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-c-lime)]" />
          </div>
        ) : k.state === "error" ? (
          <div className="space-y-2">
            <p className="text-[11px] text-amber-300">{k.message}</p>
            <SmallButton onClick={load}>
              <RefreshCw className="h-3 w-3" /> Try again
            </SmallButton>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
              <p className="mb-2 break-all font-mono text-[12px] text-[var(--color-c-text)]" aria-label={shown ? "Access key" : "Access key, hidden"}>
                {shown ? k.key : `ja24_${"•".repeat(24)}`}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <SmallButton onClick={() => setShown((v) => !v)}>
                  {shown ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {shown ? "Hide" : "Show"}
                </SmallButton>
                <SmallButton
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(k.key);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    } catch {
                      setShown(true);
                    }
                  }}
                >
                  {copied ? <Check className="h-3 w-3 text-[var(--color-c-lime)]" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </SmallButton>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-3 py-2.5">
              <span className="text-[11px] text-[var(--color-c-muted)]">New key in</span>
              <span className="text-[13px] font-bold text-[var(--color-c-lime)]" title={new Date(k.expiresAt).toLocaleString("en-IN")}>
                {left(ms)}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-c-dim)]">
              A new key is issued every 12 hours and the old one stops working. Keep it private: anyone with it can confirm it&apos;s you.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}
