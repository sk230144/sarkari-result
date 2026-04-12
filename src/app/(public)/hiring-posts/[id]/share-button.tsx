"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";

export function ShareButton({
  url,
  title,
  variant = "ghost",
}: {
  url: string;
  title: string;
  variant?: "ghost" | "solid";
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (variant === "solid") {
    return (
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-sm"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Link copied!" : "Share"}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
      title="Share this post"
    >
      {copied ? (
        <Check className="h-4 w-4 text-white" />
      ) : (
        <Share2 className="h-4 w-4 text-white" />
      )}
    </button>
  );
}
