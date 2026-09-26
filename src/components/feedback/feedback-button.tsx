"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, Bug, Lightbulb, Heart, MessageCircle, Star, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Modal } from "@/components/cover-letter/modal";

const CATEGORIES = [
  { key: "bug", label: "Bug", icon: Bug, tint: "text-red-300" },
  { key: "idea", label: "Idea", icon: Lightbulb, tint: "text-amber-300" },
  { key: "praise", label: "Praise", icon: Heart, tint: "text-pink-300" },
  { key: "other", label: "Other", icon: MessageCircle, tint: "text-sky-300" },
] as const;

// Public profiles belong to their owner; auth pages have no signed-in user.
const HIDDEN = [/^\/u\//, /^\/login/, /^\/signup/];

/** Floating "Feedback" button for signed-in users; sends to /api/feedback. */
export function FeedbackButton() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("idea");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (loading || !user || HIDDEN.some((re) => re.test(pathname))) return null;

  function close() {
    setOpen(false);
    if (sent) {
      setSent(false);
      setMessage("");
      setRating(null);
      setCategory("idea");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, rating, message, page: pathname }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(json.error ?? "Couldn't send your feedback.");
    setSent(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[60] inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#1a1d18]/95 px-4 py-2.5 text-[13px] font-semibold text-[#e6edf3] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-[#a3e635]/50"
      >
        <MessageSquarePlus className="h-4 w-4 text-[#a3e635]" />
        Feedback
      </button>

      {open && (
        <Modal label="Send feedback" onClose={close} className="max-w-md">
          {sent ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <CheckCircle2 className="h-10 w-10 text-[#a3e635]" />
              <p className="text-[16px] font-bold text-[#e6edf3]">Thanks for the feedback!</p>
              <p className="text-[13px] text-white/60">We read every message. If we need more detail we&apos;ll reach you at {user.email}.</p>
              <button type="button" onClick={close} className="mt-2 rounded-lg bg-[#a3e635] px-4 py-2 text-[13px] font-bold text-black">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="flex items-center gap-2 text-[15px] font-bold text-[#e6edf3]">
                  <MessageSquarePlus className="h-4 w-4 text-[#a3e635]" />
                  Send us feedback
                </p>
                <button type="button" onClick={close} aria-label="Close" className="text-white/50 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <p className="mb-2 text-[12px] font-semibold text-white/70">What&apos;s it about?</p>
                  <div role="radiogroup" className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((c) => {
                      const on = category === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setCategory(c.key)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[12px] font-semibold transition-colors ${
                            on ? "border-[#a3e635]/60 bg-[#a3e635]/10 text-white" : "border-white/10 text-white/60 hover:border-white/25"
                          }`}
                        >
                          <c.icon className={`h-4 w-4 ${c.tint}`} />
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[12px] font-semibold text-white/70">
                    How&apos;s your experience so far? <span className="font-normal text-white/40">(optional)</span>
                  </p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(rating === n ? null : n)}
                        aria-label={`${n} star${n === 1 ? "" : "s"}`}
                        className="rounded p-0.5 transition-transform hover:scale-110"
                      >
                        <Star className={`h-6 w-6 ${rating && n <= rating ? "fill-amber-400 text-amber-400" : "text-white/25"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-semibold text-white/70">Your message</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={2000}
                    autoFocus
                    placeholder={
                      category === "bug"
                        ? "What happened, and what did you expect to happen?"
                        : category === "idea"
                          ? "What would make Job Alert 24 more useful for you?"
                          : "Tell us anything…"
                    }
                    className="w-full resize-y rounded-xl border border-white/10 bg-[#0b0e0b] px-3 py-2.5 text-[13px] leading-relaxed text-white placeholder:text-white/35 focus:border-[#a3e635]/50 focus:outline-none"
                  />
                  <span className="mt-1 block text-right font-mono text-[10px] text-white/35">{message.length}/2000</span>
                </label>

                <p className="text-[11px] text-white/40">
                  Sent as {user.email}, along with the page you&apos;re on ({pathname}).
                </p>
                {error && <p className="text-[12px] text-red-300">{error}</p>}
              </div>

              <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">
                <button type="button" onClick={close} className="rounded-lg px-3 py-2 text-[13px] text-white/60 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || message.trim().length < 5}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#a3e635] px-4 py-2 text-[13px] font-bold text-black disabled:opacity-40"
                >
                  {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Send feedback
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
