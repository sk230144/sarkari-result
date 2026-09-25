"use client";

import { useRef, useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Mail,
  Code2,
  LayoutList,
  Eye,
  EyeOff,
  FileText,
  ClipboardList,
  Palette,
  Info,
  ArrowUp,
  ArrowDown,
  Loader2,
  RefreshCw,
  Upload,
  Trash2,
  MailOpen,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { APPLY_FIELDS, SECTION_LABELS, type ApplyKey, type SectionKey } from "@/lib/profile/types";
import { useEditor } from "./editor-context";
import { Card, SmallButton, TextInput, moveItem } from "./ui";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* clipboard blocked */
    }
  }
  return { copied, copy };
}

function ago(iso: string) {
  const mins = Math.floor((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ProfileAside() {
  const { profile, extras, setExtras, save, send, toast } = useEditor();
  const { copied, copy } = useCopy();
  const [applyEdit, setApplyEdit] = useState<ApplyKey | null>(null);
  const [applyDraft, setApplyDraft] = useState("");
  const [resumeBusy, setResumeBusy] = useState<"upload" | "import" | "view" | null>(null);
  const [openMsg, setOpenMsg] = useState<string | null>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const invite = `${origin}/signup?ref=${profile.slug}`;
  const profileUrl = `${origin}/u/${profile.slug}`;
  const badgeMd = `[![${profile.fullName || "Developer"} on jobalert24](${origin}/api/badge/${profile.slug})](${profileUrl})`;
  const unread = extras.messages.filter((m) => !m.read).length;
  const applyFilled = APPLY_FIELDS.filter((f) => profile.applyDetails[f.key]).length;

  /* ---------------------------------------------------------- resume */
  async function viewResume() {
    if (!profile.resume.path) return;
    const win = window.open("", "_blank");
    setResumeBusy("view");
    const { data } = await supabaseBrowser().storage.from("user-documents").createSignedUrl(profile.resume.path, 120);
    setResumeBusy(null);
    if (data?.signedUrl && win) win.location.href = data.signedUrl;
    else {
      win?.close();
      toast("error", "Couldn't open your resume.");
    }
  }

  async function uploadResume(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") return toast("error", "Please choose a PDF file.");
    if (file.size > 5 * 1024 * 1024) return toast("error", "That PDF is over 5 MB.");
    setResumeBusy("upload");
    const fd = new FormData();
    fd.append("resume", file);
    await send("/api/profile/resume", { method: "POST", body: fd }, "Resume updated and profile refreshed");
    setResumeBusy(null);
    if (resumeRef.current) resumeRef.current.value = "";
  }

  async function reimport() {
    setResumeBusy("import");
    await send("/api/profile/import", { method: "POST" }, "Profile refreshed from your resume");
    setResumeBusy(null);
  }

  /* -------------------------------------------------------- messages */
  async function markRead(id: string, read: boolean) {
    setExtras((e) => ({ ...e, messages: e.messages.map((m) => (m.id === id ? { ...m, read } : m)) }));
    await fetch("/api/profile/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
  }

  async function deleteMessage(id: string) {
    const res = await fetch("/api/profile/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return toast("error", "Couldn't delete it.");
    setExtras((e) => ({ ...e, messages: e.messages.filter((m) => m.id !== id) }));
  }

  /* ---------------------------------------------------------- layout */
  function saveLayout(order: SectionKey[], hidden: SectionKey[]) {
    save({ layout: { order, hidden } }, "Layout updated");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Referrals */}
      <Card>
        <div className="border-b border-[var(--color-c-border)] px-4 py-3">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text)]">
            <Gift className="h-4 w-4 text-[var(--color-c-lime)]" />
            Invite Friends
          </h2>
        </div>
        <div className="p-4">
          <div className="mb-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">Your invite link</p>
            <p className="mb-3 truncate font-mono text-[11px] text-[var(--color-c-text-4)]">{invite.replace(/^https?:\/\//, "")}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join me on jobalert24 — jobs, DSA sheets and AI career tools: ${invite}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25d366] text-[10px] font-bold text-white"
              >
                W
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(invite)}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a66c2] text-[10px] font-bold text-white"
              >
                in
              </a>
              <SmallButton onClick={() => copy("invite", invite)}>
                {copied === "invite" ? <Check className="h-3 w-3 text-[var(--color-c-lime)]" /> : <Copy className="h-3 w-3" />}
                {copied === "invite" ? "Copied" : "Copy link"}
              </SmallButton>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-3 py-2.5">
            <span className="text-[11px] text-[var(--color-c-muted)]">Friends who joined</span>
            <span className="text-[16px] font-bold text-[var(--color-c-lime)]">{extras.referrals}</span>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--color-c-dim)]">
            A friend counts once they sign up with your link and verify their email.
          </p>
        </div>
      </Card>

      {/* Inbox */}
      <Card className="p-4">
        <h2 className="mb-2 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Mail className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Inbox
          {unread > 0 && (
            <span className="rounded-full bg-[var(--color-c-lime)] px-1.5 text-[10px] font-bold text-black">{unread}</span>
          )}
        </h2>
        {extras.messages.length === 0 ? (
          <p className="text-[11px] text-[var(--color-c-muted)]">
            No messages. Signed-in visitors can message you from your public profile.
          </p>
        ) : (
          <div className="max-h-80 space-y-1.5 overflow-y-auto">
            {extras.messages.map((m) => {
              const open = openMsg === m.id;
              return (
                <div
                  key={m.id}
                  className={`rounded-lg border p-2.5 ${
                    m.read ? "border-[var(--color-c-border)] bg-[var(--color-c-canvas)]" : "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.04]"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setOpenMsg(open ? null : m.id);
                      if (!m.read) markRead(m.id, true);
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-bold text-[var(--color-c-text)]">{m.senderName}</span>
                      <span className="shrink-0 text-[9px] text-[var(--color-c-dim)]">{ago(m.createdAt)}</span>
                    </span>
                    <span className={`mt-0.5 block text-[11px] text-[var(--color-c-muted)] ${open ? "whitespace-pre-line" : "truncate"}`}>
                      {m.body}
                    </span>
                  </button>
                  {open && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[var(--color-c-border)] pt-2">
                      <span className="mr-auto truncate font-mono text-[10px] text-[var(--color-c-text-4)]">{m.senderEmail}</span>
                      <a
                        href={`mailto:${m.senderEmail}`}
                        className="rounded-md bg-[var(--color-c-lime)] px-2 py-1 text-[10px] font-bold text-black"
                      >
                        Reply
                      </a>
                      <button
                        type="button"
                        onClick={() => markRead(m.id, false)}
                        aria-label="Mark unread"
                        className="rounded p-1 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]"
                      >
                        <MailOpen className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMessage(m.id)}
                        aria-label="Delete message"
                        className="rounded p-1 text-[var(--color-c-dim)] hover:text-[var(--color-c-red)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Embeddable badge */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Code2 className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Embeddable Badge
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">Drop this into your GitHub README or site.</p>
        <div className="mb-3 flex min-h-[40px] items-center justify-center rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${profile.slug}-${profile.isPublic}-${profile.fullName}-${profile.headline}`}
            src={`/api/badge/${profile.slug}?v=${encodeURIComponent(profile.fullName + profile.headline + profile.isPublic)}`}
            alt="Profile badge preview"
            className="max-w-full"
          />
        </div>
        <p className="mb-2 break-all rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-2 font-mono text-[9px] leading-relaxed text-[var(--color-c-dim)]">
          {badgeMd}
        </p>
        <SmallButton onClick={() => copy("badge", badgeMd)}>
          {copied === "badge" ? <Check className="h-3 w-3 text-[var(--color-c-lime)]" /> : <Copy className="h-3 w-3" />}
          {copied === "badge" ? "Copied" : "Copy Markdown"}
        </SmallButton>
        {!profile.isPublic && (
          <p className="mt-2 text-[10px] text-[var(--color-c-amber)]">The badge shows your name once your profile is public.</p>
        )}
      </Card>

      {/* Public profile layout */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <LayoutList className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Public Profile Layout
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">Reorder or hide sections on your public profile.</p>
        <div className="space-y-1.5">
          {profile.layout.order.map((s, i) => {
            const isHidden = profile.layout.hidden.includes(s);
            return (
              <div key={s} className="flex items-center gap-1.5 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-2.5 py-2">
                <span
                  className={`flex-1 truncate text-[11px] font-medium ${
                    isHidden ? "text-[var(--color-c-dim)] line-through" : "text-[var(--color-c-text)]"
                  }`}
                >
                  {SECTION_LABELS[s]}
                </span>
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => saveLayout(moveItem(profile.layout.order, i, -1), profile.layout.hidden)}
                  aria-label={`Move ${SECTION_LABELS[s]} up`}
                  className="rounded p-0.5 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)] disabled:opacity-25"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={i === profile.layout.order.length - 1}
                  onClick={() => saveLayout(moveItem(profile.layout.order, i, 1), profile.layout.hidden)}
                  aria-label={`Move ${SECTION_LABELS[s]} down`}
                  className="rounded p-0.5 text-[var(--color-c-dim)] hover:text-[var(--color-c-text)] disabled:opacity-25"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`${isHidden ? "Show" : "Hide"} ${SECTION_LABELS[s]}`}
                  aria-pressed={isHidden}
                  onClick={() =>
                    saveLayout(
                      profile.layout.order,
                      isHidden ? profile.layout.hidden.filter((h) => h !== s) : [...profile.layout.hidden, s],
                    )
                  }
                  className="rounded p-0.5 text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
                >
                  {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Resume */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
            <FileText className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
            Your Resume
          </h2>
          {profile.resume.importedAt && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-c-lime)]">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
              Imported
            </span>
          )}
        </div>
        <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
          {profile.resume.path ? (
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-c-red-border)] font-mono text-[8px] font-bold text-[var(--color-c-red)]">
                PDF
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold text-[var(--color-c-text)]">{profile.resume.filename ?? "resume.pdf"}</p>
                <p className="text-[9px] text-[var(--color-c-dim)]">
                  {profile.resume.uploadedAt ? `Uploaded ${new Date(profile.resume.uploadedAt).toLocaleDateString("en-IN")}` : "Uploaded at signup"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">No resume yet.</p>
          )}
          <div className="flex gap-2">
            {profile.resume.path && (
              <SmallButton onClick={viewResume} disabled={!!resumeBusy}>
                {resumeBusy === "view" && <Loader2 className="h-3 w-3 animate-spin" />}
                View
              </SmallButton>
            )}
            <SmallButton tone="primary" onClick={() => resumeRef.current?.click()} disabled={!!resumeBusy}>
              {resumeBusy === "upload" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {profile.resume.path ? "Update Resume" : "Upload Resume"}
            </SmallButton>
          </div>
          <input
            ref={resumeRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => uploadResume(e.target.files?.[0])}
          />
          {profile.resume.path && (
            <button
              type="button"
              onClick={reimport}
              disabled={!!resumeBusy}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-c-lime)] hover:underline disabled:opacity-50"
            >
              {resumeBusy === "import" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Refresh profile from resume
            </button>
          )}
          <p className="mt-1.5 text-[9px] leading-relaxed text-[var(--color-c-dim)]">
            Refreshing replaces experience, education, projects and skills with what&apos;s in the resume.
          </p>
        </div>
      </Card>

      {/* Application details */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
            <ClipboardList className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
            Application Details
          </h2>
          <span
            className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
              applyFilled === APPLY_FIELDS.length
                ? "border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] text-[var(--color-c-lime)]"
                : "border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim-3)] text-[var(--color-c-amber)]"
            }`}
          >
            {applyFilled}/{APPLY_FIELDS.length}
          </span>
        </div>
        <p className="mb-3 text-[10px] leading-relaxed text-[var(--color-c-dim)]">
          Kept private. Saved here so you have them ready when filling job applications.
        </p>
        <div className="space-y-1.5">
          {APPLY_FIELDS.map(({ key, label, hint }) =>
            applyEdit === key ? (
              <form
                key={key}
                className="rounded-lg border border-[var(--color-c-lime)]/40 bg-[var(--color-c-canvas)] p-2.5"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const next = { ...profile.applyDetails, [key]: applyDraft.trim() };
                  if (!applyDraft.trim()) delete next[key];
                  if (await save({ applyDetails: next })) setApplyEdit(null);
                }}
              >
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-c-text-4)]">{label}</p>
                <TextInput value={applyDraft} onChange={(e) => setApplyDraft(e.target.value)} maxLength={key === "linkedin" || key === "portfolio" ? 300 : 60} autoFocus />
                <div className="mt-2 flex justify-end gap-1.5">
                  <SmallButton onClick={() => setApplyEdit(null)}>Cancel</SmallButton>
                  <SmallButton type="submit" tone="primary">Save</SmallButton>
                </div>
              </form>
            ) : (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setApplyEdit(key);
                  setApplyDraft(profile.applyDetails[key] ?? "");
                }}
                className="flex w-full items-start gap-2 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-2.5 text-left transition-colors hover:border-[var(--color-c-border-strong)]"
              >
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${profile.applyDetails[key] ? "bg-[var(--color-c-lime)]" : "bg-[var(--color-c-dim)]"}`} />
                <span className="min-w-0">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-c-text-4)]">{label}</span>
                  <span className="block truncate text-[10px] text-[var(--color-c-dim)]">{profile.applyDetails[key] || hint}</span>
                </span>
              </button>
            ),
          )}
        </div>
      </Card>

      {/* Themes */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Palette className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
          Profile Themes
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">Choose how others see your public profile.</p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          {(
            [
              ["midnight", "Midnight", "bg-[var(--color-c-void)] border-[var(--color-c-neutral-6)]"],
              ["daylight", "Daylight", "bg-[#f4f6f1] border-slate-300"],
            ] as const
          ).map(([key, label, swatch]) => (
            <button
              key={key}
              type="button"
              onClick={() => save({ theme: key }, `${label} theme applied`)}
              aria-pressed={profile.theme === key}
              className={`rounded-xl border p-2 text-left transition-all ${
                profile.theme === key
                  ? "border-[var(--color-c-lime)] bg-[var(--color-c-canvas)]"
                  : "border-[var(--color-c-border)] bg-[var(--color-c-canvas)] hover:border-[var(--color-c-border-strong)]"
              }`}
            >
              <span className={`mb-2 block h-8 rounded-lg border ${swatch}`} />
              <span className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--color-c-text)]">{label}</span>
                {profile.theme === key && <Check className="h-3 w-3 text-[var(--color-c-lime)]" strokeWidth={3} />}
              </span>
            </button>
          ))}
        </div>
        <p className="flex gap-1.5 text-[10px] leading-relaxed text-[var(--color-c-dim)]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          This editor always shows the default look. Your chosen theme applies only to your public profile.
        </p>
      </Card>
    </div>
  );
}
