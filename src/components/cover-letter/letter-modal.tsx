"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  FileText,
  Building2,
  CalendarDays,
  Gauge,
  Copy,
  Check,
  Download,
  RefreshCw,
  Wand2,
  Loader2,
  Database,
} from "lucide-react";
import { Modal } from "./modal";
import {
  LETTER_STYLES,
  STYLE_LABELS,
  EDIT_PRESETS,
  wrapLetter,
  type EditPreset,
  type LetterResult,
  type LetterStyle,
} from "@/lib/cover-letter-config";

export function LetterModal({
  initial,
  company,
  jd,
  onClose,
  onRegenerateAll,
}: {
  initial: LetterResult;
  company: string;
  jd: string;
  onClose: () => void;
  onRegenerateAll: () => void;
}) {
  const [result, setResult] = useState(initial);
  const [tab, setTab] = useState<LetterStyle>("operator");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const text = wrapLetter(tab, result.letters[tab], result.contact);
  const words = result.letters[tab].trim().split(/\s+/).length;
  const updated = new Date(result.updatedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const outOfCalls = result.remaining === 0;

  async function call(url: string, body: object, label: string) {
    setBusy(label);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setResult(json as LetterResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  function regenerateStyle() {
    call("/api/cover-letter", { cvId: result.cvId, role: result.role, jd, style: tab }, "regenerate");
  }

  function edit(preset: EditPreset) {
    call("/api/cover-letter/edit", { letterId: result.id, style: tab, preset }, preset);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `Cover Letter - ${result.role} - ${STYLE_LABELS[tab]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const details = [
    { icon: FileText, label: "Role", value: result.role, tint: "text-[var(--color-c-lime)]" },
    { icon: Building2, label: "Company", value: company || "Not specified", tint: "text-sky-400" },
  ];

  return (
    <Modal label="AI cover letter" onClose={onClose} className="h-[min(90vh,820px)] max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/10">
          <Sparkles className="h-4 w-4 text-[var(--color-c-lime)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold text-[var(--color-c-text)]">AI Cover Letter</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-c-dim)]">
            3 variations tailored to your resume
          </p>
        </div>
        {result.cached && (
          <span
            title="Same resume and job as before, so no new AI call was made"
            className="hidden items-center gap-1 rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-sky-300 sm:inline-flex"
          >
            <Database className="h-3 w-3" />
            Saved letter
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] transition-colors hover:bg-white/10 hover:text-[var(--color-c-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[250px_1fr]">
        {/* Details rail */}
        <aside className="flex flex-col gap-3 border-b border-white/[0.06] p-4 md:border-b-0 md:border-r">
          <p className="hidden font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-c-dim)] md:block">
            Letter details
          </p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-1 md:gap-3">
            {details.map((d) => (
              <div
                key={d.label}
                className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-3"
              >
                <d.icon aria-hidden className="absolute -right-2 -top-1 h-14 w-14 text-white/[0.04]" />
                <p className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">
                  <d.icon className={`h-3 w-3 ${d.tint}`} />
                  {d.label}
                </p>
                <p className="mt-1.5 truncate text-[13px] font-bold text-[var(--color-c-text)]">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-2 md:grid">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1 font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">
                <CalendarDays className="h-3 w-3 text-violet-400" />
                Updated
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-c-text-4)]">{updated}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
              <p className="flex items-center gap-1 font-mono text-[8px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">
                <Gauge className="h-3 w-3 text-amber-400" />
                Length
              </p>
              <p className="mt-1 text-[11px] text-[var(--color-c-text-4)]">{words} words</p>
            </div>
          </div>

          <div className="mt-auto hidden flex-col gap-2 pt-3 md:flex">
            {result.remaining !== null && (
              <p className="text-center font-mono text-[10px] text-[var(--color-c-dim)]">
                {result.remaining} AI generation{result.remaining === 1 ? "" : "s"} left today
              </p>
            )}
            <button
              type="button"
              onClick={onRegenerateAll}
              disabled={!!busy || outOfCalls}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-[12px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-c-text)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate all 3
            </button>
            <ActionButtons label={STYLE_LABELS[tab]} copied={copied} onCopy={copy} onDownload={download} />
          </div>
        </aside>

        {/* Letter */}
        <div className="flex min-h-0 flex-col">
          <div className="flex justify-center px-4 pt-4">
            <div className="flex gap-1 rounded-full border border-white/[0.07] bg-black/30 p-1">
              {LETTER_STYLES.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTab(s)}
                  aria-pressed={tab === s}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all duration-300 sm:px-4 ${
                    tab === s
                      ? "bg-[var(--color-c-text)] text-black shadow"
                      : "text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${
                      tab === s ? "bg-black/10" : "bg-white/10"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {STYLE_LABELS[s].replace("The ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Quick edits */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-4 pt-3">
            <button
              type="button"
              onClick={regenerateStyle}
              disabled={!!busy || outOfCalls}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-3 py-1 text-[11px] font-semibold text-[var(--color-c-lime)] transition-colors hover:bg-[var(--color-c-lime)]/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy === "regenerate" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Regenerate
            </button>
            {(Object.keys(EDIT_PRESETS) as EditPreset[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => edit(p)}
                disabled={!!busy || outOfCalls}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.06] hover:text-[var(--color-c-text)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy === p ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                {EDIT_PRESETS[p].label}
              </button>
            ))}
          </div>

          {error && (
            <p role="alert" className="mx-4 mt-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-2 text-center text-[12px] text-red-300">
              {error}
            </p>
          )}

          <div className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <article
              key={`${tab}-${result.updatedAt}`}
              className={`cl-fade mx-auto max-w-2xl whitespace-pre-line rounded-2xl border border-white/[0.06] bg-[#1b1f18] px-6 py-7 font-serif text-[14.5px] leading-[1.8] text-[#d9dccf] shadow-inner transition-opacity sm:px-10 sm:py-9 ${
                busy ? "opacity-40" : ""
              }`}
            >
              {text}
            </article>
          </div>

          <div className="flex gap-2 border-t border-white/[0.06] p-3 md:hidden">
            <ActionButtons label={STYLE_LABELS[tab]} copied={copied} onCopy={copy} onDownload={download} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ActionButtons({
  label,
  copied,
  onCopy,
  onDownload,
}: {
  label: string;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-3 text-[13px] font-bold text-black shadow-[0_10px_30px_-10px_rgba(163,230,53,0.6)] transition-transform hover:-translate-y-0.5"
      >
        {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : `Copy ${label.replace("The ", "")}`}
      </button>
      <button
        type="button"
        onClick={onDownload}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-[13px] font-semibold text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.05] hover:text-[var(--color-c-text)]"
      >
        <Download className="h-4 w-4" />
        Download
      </button>
    </>
  );
}
