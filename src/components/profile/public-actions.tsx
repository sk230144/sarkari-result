"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Star, Loader2, X, Check } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Modal } from "@/components/cover-letter/modal";
import { RELATIONSHIPS } from "@/lib/profile/types";

/** Counts this visit once per browser session (the server dedupes per day too). */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `ja24-viewed-${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage blocked; the server-side daily dedupe still applies */
    }
    fetch("/api/profile/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}

type Kind = "message" | "endorse";

export function PublicActions({
  slug,
  name,
  ownerId,
  light,
}: {
  slug: string;
  name: string;
  ownerId: string;
  light: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState<Kind | null>(null);
  const [body, setBody] = useState("");
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<Kind | null>(null);

  if (loading) return null;
  const isOwner = user?.id === ownerId;
  if (isOwner) {
    return (
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#a3e635] px-4 py-2 text-[12px] font-bold text-black transition-transform hover:-translate-y-0.5"
      >
        Edit profile
      </Link>
    );
  }

  const secondary = light
    ? "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
    : "border-white/15 bg-white/[0.04] text-[#e6edf3] hover:border-white/30";

  function start(kind: Kind) {
    if (!user) {
      router.push(`/login?next=/u/${slug}`);
      return;
    }
    setOpen(kind);
    setBody("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!open) return;
    setBusy(true);
    setError(null);
    const res = await fetch(open === "message" ? "/api/profile/messages" : "/api/profile/endorsements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(open === "message" ? { slug, body } : { slug, body, relationship }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Something went wrong.");
    setSent(open);
    setOpen(null);
    if (open === "endorse") router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => start("message")}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#a3e635] px-4 py-2 text-[12px] font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          {sent === "message" ? <Check className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
          {sent === "message" ? "Message sent" : "Message"}
        </button>
        <button
          type="button"
          onClick={() => start("endorse")}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[12px] font-semibold transition-colors ${secondary}`}
        >
          <Star className="h-3.5 w-3.5" />
          {sent === "endorse" ? "Endorsement posted" : "Endorse"}
        </button>
      </div>

      {open && (
        <Modal label={open === "message" ? `Message ${name}` : `Endorse ${name}`} onClose={() => setOpen(null)} className="max-w-md">
          <form onSubmit={submit}>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <p className="text-[14px] font-bold text-[#e6edf3]">
                {open === "message" ? `Message ${name}` : `Endorse ${name}`}
              </p>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="text-white/50 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-5">
              {open === "endorse" && (
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold text-white/70">How do you know them?</span>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="h-9 w-full rounded-lg border border-white/10 bg-[#0b0e0b] px-3 text-[12px] text-white focus:outline-none focus:ring-1 focus:ring-[#a3e635]/40"
                  >
                    {RELATIONSHIPS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold text-white/70">
                  {open === "message"
                    ? "Your message (they'll see your name and email so they can reply)"
                    : "Your endorsement (shown publicly on their profile)"}
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={5}
                  maxLength={open === "message" ? 1000 : 600}
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0e0b] px-3 py-2 text-[12px] leading-relaxed text-white focus:outline-none focus:ring-1 focus:ring-[#a3e635]/40"
                />
              </label>
              {error && <p className="text-[12px] text-red-300">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
              <button type="button" onClick={() => setOpen(null)} className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] text-white/70">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-3 py-1.5 text-[11px] font-bold text-black disabled:opacity-50"
              >
                {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                {open === "message" ? "Send" : "Post endorsement"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
