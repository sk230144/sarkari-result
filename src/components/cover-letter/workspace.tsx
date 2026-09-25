"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Target,
  FileText,
  CheckCircle2,
  ChevronsUpDown,
  UploadCloud,
  Zap,
  Monitor,
  Loader2,
  X,
  LogIn,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Kicker, Reveal } from "./primitives";
import { StepLoader } from "./modal";
import { LetterModal } from "./letter-modal";
import { AnalysisModal } from "./analysis-modal";
import { ROLES, type LetterResult } from "@/lib/cover-letter-config";
import type { AnalysisResult } from "@/lib/analyzer/config";
import { RESUME_MAX_BYTES, JOB_DESCRIPTION_MAX_CHARS } from "@/lib/resume-text-limits";

const MAX_PDF_BYTES = RESUME_MAX_BYTES;
const NEED_LOGIN = "__need_login__";

const LETTER_STEPS = [
  "Reading your resume…",
  "Matching your experience to the role…",
  "Drafting The Operator…",
  "Drafting The Believer…",
  "Drafting Quick Apply…",
  "Polishing tone and formatting…",
];

const ANALYSIS_STEPS = [
  "Uploading job description to AI engine…",
  "Extracting required skills & keywords…",
  "Reading your resume experience…",
  "Identifying skill gaps & matches…",
  "Calculating compatibility score…",
  "Analyzing ATS-optimization opportunities…",
];

type Saved = {
  uid: string;
  path: string | null;
  filename: string | null;
  uploadedAt: string | null;
  fullName: string | null;
};

type Stage = "idle" | "loading-letter" | "loading-analysis" | "letter" | "analysis";

export function CoverLetterWorkspace() {
  const { user, loading: authLoading } = useAuth();
  const supabase = supabaseBrowser();

  const [role, setRole] = useState(ROLES[0]);
  const [jd, setJd] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [upload, setUpload] = useState<File | null>(null);
  const [choice, setChoice] = useState<"saved" | "upload" | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [opening, setOpening] = useState(false);
  const [letter, setLetter] = useState<LetterResult | null>(null);
  const [letterReady, setLetterReady] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  // Resume key -> cvId, so the same file is only sent to /api/cv once.
  const cvIds = useRef(new Map<string, string>());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("resume_path, resume_filename, resume_uploaded_at, full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setSaved({
          uid: user.id,
          path: (data?.resume_path as string | null) ?? null,
          filename: (data?.resume_filename as string | null) ?? null,
          uploadedAt: (data?.resume_uploaded_at as string | null) ?? null,
          fullName: (data?.full_name as string | null) ?? null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user, supabase]);

  // Only trust the fetched profile if it belongs to whoever is signed in now.
  const profile = user && saved?.uid === user.id ? saved : null;
  const savedResume = profile?.path ? profile : null;
  const resumeLoading = authLoading || (!!user && !profile);

  const active: "saved" | "upload" | null =
    choice === "upload" && upload
      ? "upload"
      : choice === "saved" && savedResume
        ? "saved"
        : savedResume
          ? "saved"
          : upload
            ? "upload"
            : null;

  function takeFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError("That PDF is over 5 MB. Please choose a smaller file.");
      return;
    }
    setError(null);
    setUpload(file);
    setChoice("upload");
  }

  async function viewSaved() {
    if (!savedResume?.path) return;
    // Open synchronously so the popup is tied to the click, then point it at the file.
    const win = window.open("", "_blank");
    setOpening(true);
    const { data } = await supabase.storage
      .from("user-documents")
      .createSignedUrl(savedResume.path, 120);
    setOpening(false);
    if (data?.signedUrl && win) win.location.href = data.signedUrl;
    else win?.close();
  }

  async function ensureCvId(): Promise<string> {
    const key =
      active === "saved"
        ? `saved:${savedResume?.path}:${savedResume?.uploadedAt}`
        : `upload:${upload?.name}:${upload?.size}:${upload?.lastModified}`;
    const known = cvIds.current.get(key);
    if (known) return known;

    const fd = new FormData();
    fd.append("source", active === "saved" ? "saved" : "upload");
    if (active === "upload" && upload) fd.append("resume", upload);
    const res = await fetch("/api/cv", { method: "POST", body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Could not read your resume.");
    cvIds.current.set(key, json.cvId);
    return json.cvId as string;
  }

  async function generateLetter(regenerate = false) {
    if (!user) {
      setError(NEED_LOGIN);
      return;
    }
    if (!active) {
      setError("Choose a resume first — your saved one, or upload a PDF.");
      return;
    }
    setError(null);
    setLetterReady(false);
    setStage("loading-letter");
    try {
      const cvId = await ensureCvId();
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId, role, jd, regenerate }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not generate your cover letter.");
      setLetter(json as LetterResult);
      setLetterReady(true);
    } catch (e) {
      setStage("idle");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  async function startAnalysis() {
    if (!user) {
      setError(NEED_LOGIN);
      return;
    }
    if (!active) {
      setError("Choose a resume first — your saved one, or upload a PDF.");
      return;
    }
    setError(null);
    setAnalysisReady(false);
    setStage("loading-analysis");
    try {
      const cvId = await ensureCvId();
      const res = await fetch("/api/resume-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId, role, jd }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not analyse your resume.");
      setAnalysis(json as AnalysisResult);
      setAnalysisReady(true);
    } catch (e) {
      setStage("idle");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const close = useCallback(() => setStage("idle"), []);
  const showLetter = useCallback(() => setStage("letter"), []);
  const showAnalysis = useCallback(() => setStage("analysis"), []);

  const company = useMemo(() => {
    // First "at Company" / "Company is hiring" style mention, if the JD has one.
    const m = jd.match(/\b(?:at|join)\s+([A-Z][\w&.-]*(?:\s+[A-Z][\w&.-]*){0,2})/);
    return m?.[1] ?? "";
  }, [jd]);

  return (
    <section id="generate" className="scroll-mt-20 px-6 pb-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-8 text-center">
          <Kicker>Start here</Kicker>
          <h2 className="mt-5 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-0.045em] text-[var(--color-c-text)]">
            Tailor it to your <span className="text-[var(--color-c-lime)]">next role</span>
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-[#181c16] to-[#121510] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 right-0 h-56 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(163,230,53,0.1) 0%, transparent 70%)" }}
            />

            <div className="relative border-b border-white/[0.06] px-6 py-5 sm:px-8">
              <h3 className="text-[18px] font-bold tracking-tight text-[var(--color-c-text)]">
                Configuration
              </h3>
              <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">
                Set your target role and add a job description for precise AI analysis.
              </p>
            </div>

            <div className="relative space-y-7 px-6 py-6 sm:px-8">
              {/* 1. Role */}
              <div>
                <label htmlFor="cl-role" className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text-4)]">
                  <Target className="h-4 w-4 text-[var(--color-c-lime)]" />
                  1. Target Role
                </label>
                <div className="relative">
                  <select
                    id="cl-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-white/[0.07] bg-[#20241d] px-4 text-[14px] font-medium text-[var(--color-c-text)] transition-colors hover:border-white/15 focus:border-[var(--color-c-lime)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-c-lime)]/15"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#1a1d18]">
                        {r}
                      </option>
                    ))}
                  </select>
                  <ChevronsUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-dim)]" />
                </div>
              </div>

              {/* 2. JD */}
              <div>
                <label htmlFor="cl-jd" className="mb-2.5 flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text-4)]">
                  <FileText className="h-4 w-4 text-[var(--color-c-lime)]" />
                  2. Job Description
                  <span className="font-normal text-[var(--color-c-dim)]">(Optional)</span>
                </label>
                <textarea
                  id="cl-jd"
                  value={jd}
                  onChange={(e) => setJd(e.target.value.slice(0, JOB_DESCRIPTION_MAX_CHARS))}
                  maxLength={JOB_DESCRIPTION_MAX_CHARS}
                  rows={5}
                  placeholder="Paste the target job description here for highly accurate match scoring…"
                  className="w-full resize-y rounded-xl border border-white/[0.07] bg-[#20241d] px-4 py-3.5 text-[13px] leading-relaxed text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] transition-colors hover:border-white/15 focus:border-[var(--color-c-lime)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-c-lime)]/15"
                />
                <p className="mt-1.5 text-right font-mono text-[10px] text-[var(--color-c-dim)]">
                  {jd.trim()
                    ? `${jd.trim().split(/\s+/).length} words · ${jd.length}/${JOB_DESCRIPTION_MAX_CHARS} chars`
                    : "Adding a JD makes the letter far more specific"}
                </p>
              </div>

              {/* 3. Resume */}
              <div className="border-t border-white/[0.06] pt-6">
                <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text-4)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-c-lime)]" />
                  3. Active Resume
                </p>

                <div className="space-y-2.5">
                  {resumeLoading ? (
                    <div className="h-[74px] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
                  ) : savedResume ? (
                    <ResumeOption
                      selected={active === "saved"}
                      onSelect={() => setChoice("saved")}
                      icon={<FileText className="h-5 w-5 text-red-400" />}
                      iconBg="bg-red-500/10"
                      title={savedResume.filename ?? "resume.pdf"}
                      subtitle={`Saved resume${
                        savedResume.uploadedAt
                          ? ` · Uploaded ${new Date(savedResume.uploadedAt).toLocaleDateString("en-IN")}`
                          : ""
                      }`}
                      action={
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSaved();
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-4 py-2 text-[12px] font-bold text-[var(--color-c-text)] transition-colors hover:bg-black"
                        >
                          {opening && <Loader2 className="h-3 w-3 animate-spin" />}
                          View
                        </button>
                      }
                    />
                  ) : !user ? (
                    <Link
                      href="/login?next=/cover-letter"
                      className="flex items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-[var(--color-c-lime)]/40"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-c-lime)]/10">
                        <LogIn className="h-5 w-5 text-[var(--color-c-lime)]" />
                      </span>
                      <span>
                        <span className="block text-[14px] font-bold text-[var(--color-c-text)]">Sign in to use your saved resume</span>
                        <span className="text-[12px] text-[var(--color-c-dim)]">Or upload a PDF below for this session</span>
                      </span>
                    </Link>
                  ) : null}

                  <ResumeOption
                    selected={active === "upload"}
                    onSelect={() => (upload ? setChoice("upload") : fileInput.current?.click())}
                    dragging={dragging}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragging(false);
                      takeFile(e.dataTransfer.files?.[0]);
                    }}
                    icon={<UploadCloud className="h-5 w-5 text-[var(--color-c-lime)]" />}
                    iconBg="bg-[var(--color-c-lime)]/10"
                    title={upload ? upload.name : "Upload New Resume"}
                    subtitle={
                      upload
                        ? `${(upload.size / 1024).toFixed(0)} KB · Used for this session`
                        : dragging
                          ? "Drop it here"
                          : "Drag and drop a PDF, or click to browse"
                    }
                    action={
                      upload ? (
                        <button
                          type="button"
                          aria-label="Remove uploaded resume"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpload(null);
                            setChoice(null);
                            if (fileInput.current) fileInput.current.value = "";
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] transition-colors hover:bg-white/10 hover:text-[var(--color-c-text)]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null
                    }
                  />
                  <input
                    ref={fileInput}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => takeFile(e.target.files?.[0])}
                  />
                </div>
              </div>

              {error && (
                <p role="alert" className="cl-fade rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-2.5 text-[12px] text-red-300">
                  {error === NEED_LOGIN ? (
                    <>
                      Please{" "}
                      <Link href="/login?next=/cover-letter" className="font-bold underline underline-offset-2">
                        sign in
                      </Link>{" "}
                      to generate your cover letter.
                    </>
                  ) : (
                    error
                  )}
                </p>
              )}

              {/* Actions */}
              <div className="grid gap-2.5 border-t border-white/[0.06] pt-6 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => generateLetter()}
                  className="cl-glow group flex items-center justify-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-3.5 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5"
                >
                  <FileText className="h-4 w-4" />
                  Cover Letter
                </button>
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#171a15] px-4 py-3.5 text-[14px] font-bold text-[var(--color-c-text-4)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-c-lime)]/40 hover:text-[var(--color-c-text)]"
                >
                  <Zap className="h-4 w-4 text-[var(--color-c-lime)]" />
                  Analyse CV
                </button>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#141712] px-4 py-3.5 text-[14px] font-bold text-[var(--color-c-dim)]"
                >
                  <Monitor className="h-4 w-4" />
                  Mock Interview
                  <span className="rounded-full border border-white/10 px-1.5 py-px font-mono text-[8px] uppercase tracking-wider">
                    Soon
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {stage === "loading-letter" && (
        <StepLoader
          title="Writing your cover letters"
          steps={LETTER_STEPS}
          done={letterReady}
          onDone={showLetter}
        />
      )}
      {stage === "loading-analysis" && (
        <StepLoader
          title="Analysing your resume"
          steps={ANALYSIS_STEPS}
          done={analysisReady}
          onDone={showAnalysis}
        />
      )}
      {stage === "letter" && letter && (
        <LetterModal
          key={`${letter.id}-${letter.updatedAt}`}
          initial={letter}
          company={company}
          jd={jd}
          onClose={close}
          onRegenerateAll={() => generateLetter(true)}
        />
      )}
      {stage === "analysis" && analysis && (
        <AnalysisModal result={analysis} onClose={close} onCoverLetter={() => generateLetter()} />
      )}
    </section>
  );
}

function ResumeOption({
  selected,
  onSelect,
  icon,
  iconBg,
  title,
  subtitle,
  action,
  dragging = false,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  dragging?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-300 ${
        selected
          ? "border-[var(--color-c-lime)]/60 bg-[var(--color-c-lime)]/[0.06] shadow-[0_0_0_4px_rgba(163,230,53,0.06)]"
          : dragging
            ? "border-dashed border-[var(--color-c-lime)]/60 bg-[var(--color-c-lime)]/[0.04]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-[var(--color-c-lime)]" : "border-white/15"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full bg-[var(--color-c-lime)] transition-transform duration-300 ${
            selected ? "scale-100" : "scale-0"
          }`}
        />
      </span>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-[var(--color-c-text)]">{title}</span>
        <span className="block truncate text-[12px] text-[var(--color-c-dim)]">{subtitle}</span>
      </span>
      {action}
    </div>
  );
}
