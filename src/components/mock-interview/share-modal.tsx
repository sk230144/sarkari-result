"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Globe2, Loader2, Lock, Share2, X } from "lucide-react";
import { Modal } from "@/components/cover-letter/modal";

type State = { loading: true } | { loading: false; isPublic: boolean; token: string | null; error: string | null };

/** Owner-only: turn the public link for a finished interview on or off. */
export function ShareModal({ id, role, score, onClose }: { id: string; role: string; score: number; onClose: () => void }) {
  const [state, setState] = useState<State>({ loading: true });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`/api/mock-interview/${id}/share`, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json();
        if (!live) return;
        setState({ loading: false, isPublic: Boolean(j.isPublic), token: j.token ?? null, error: r.ok ? null : j.error ?? "Couldn't load sharing." });
      })
      .catch(() => live && setState({ loading: false, isPublic: false, token: null, error: "Network error." }));
    return () => {
      live = false;
    };
  }, [id]);

  async function toggle(next: boolean) {
    setBusy(true);
    try {
      const r = await fetch(`/api/mock-interview/${id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public: next }),
      });
      const j = await r.json();
      setState({ loading: false, isPublic: r.ok ? Boolean(j.isPublic) : !next, token: j.token ?? null, error: r.ok ? null : j.error ?? "Couldn't update sharing." });
    } catch {
      setState((s) => ({ ...(s as Exclude<State, { loading: true }>), error: "Network error." }));
    } finally {
      setBusy(false);
    }
  }

  const url = !state.loading && state.isPublic && state.token ? `${window.location.origin}/mock-interview/shared/${state.token}` : "";
  const text = `I scored ${score}/100 in a ${role} mock interview on Job Alert 24.`;
  const targets = url
    ? [
        { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
        { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
        { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
      ]
    : [];

  return (
    <Modal label="Share interview result" onClose={onClose} className="max-w-md">
      <div className="flex items-start gap-3.5 border-b border-white/[0.06] px-6 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-c-lime)]/10">
          <Share2 className="h-4.5 w-4.5 text-[var(--color-c-lime)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold tracking-tight text-[var(--color-c-text)]">Share your result</p>
          <p className="text-[12px] text-[var(--color-c-muted)]">Private until you turn the link on.</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] hover:bg-white/10 hover:text-[var(--color-c-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5 px-6 py-5">
        {state.loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--color-c-lime)]" />
          </div>
        ) : (
          <>
            <button
              type="button"
              role="switch"
              aria-checked={state.isPublic}
              disabled={busy}
              onClick={() => toggle(!state.isPublic)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-colors hover:border-white/15 disabled:opacity-70"
            >
              {state.isPublic ? <Globe2 className="h-5 w-5 shrink-0 text-[var(--color-c-lime)]" /> : <Lock className="h-5 w-5 shrink-0 text-[var(--color-c-dim)]" />}
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-[var(--color-c-text)]">{state.isPublic ? "Public link is on" : "Only you can see this"}</span>
                <span className="block text-[11px] text-[var(--color-c-muted)]">
                  {state.isPublic ? "Anyone with the link can view this report." : "Turn on to get a link you can share."}
                </span>
              </span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${state.isPublic ? "bg-[var(--color-c-lime)]" : "bg-white/15"}`}>
                {busy ? (
                  <Loader2 className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 animate-spin text-black" />
                ) : (
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${state.isPublic ? "left-[22px]" : "left-0.5"}`} />
                )}
              </span>
            </button>

            {url && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={url}
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label="Share link"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-[11px] text-[var(--color-c-text-4)] outline-none focus:border-[var(--color-c-lime)]/50"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      } catch {
                        /* the field is selectable as a fallback */
                      }
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-c-lime)] px-3.5 text-[12px] font-bold text-black"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {targets.map((t) => (
                    <a
                      key={t.label}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
                    >
                      {t.label}
                    </a>
                  ))}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold text-[var(--color-c-lime)] hover:underline"
                  >
                    Preview <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              The public page shows your name, the role, your score, the debrief, and every question with your answer, feedback and the model answer.
              Your email and resume are never shown. Turn the link off any time and it stops working.
            </p>
            {state.error && <p className="text-[12px] text-amber-300">{state.error}</p>}
          </>
        )}
      </div>
    </Modal>
  );
}
