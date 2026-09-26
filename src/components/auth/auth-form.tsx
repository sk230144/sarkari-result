"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Upload,
  FileText,
  X,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Logo } from "@/components/ui/logo";

/**
 * Supabase's OTP length is a project setting — 6 by default, 8 on some
 * projects. Truncating at 6 silently sent an invalid token, so accept the
 * full range instead of assuming.
 */
const MIN_OTP_LENGTH = 6;
const MAX_OTP_LENGTH = 8;

/** Supabase Storage free tier caps a single file well above this. */
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

type Step = "form" | "otp";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  // Whoever sent them here sets ?next=; the home page is the neutral
  // fallback, since auth is not tied to any one feature.
  const next = params.get("next") || "/";

  const isSignup = mode === "signup";

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function pickResume(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) {
      setResume(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Your resume must be a PDF.");
      setResume(null);
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setError("That PDF is over 5 MB. Please upload a smaller file.");
      setResume(null);
      return;
    }
    setResume(file);
  }

  /**
   * Uploads the resume once the account exists.
   *
   * Runs after verification rather than before, because the storage bucket
   * is private and its policies key off the signed-in user's id — there is
   * no authenticated identity to own the file until then.
   */
  async function uploadResume(userId: string, file: File) {
    const path = `${userId}/resume.pdf`;
    const { error: upErr } = await supabase.storage
      .from("user-documents")
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (upErr) throw upErr;

    await supabase
      .from("profiles")
      .update({
        resume_path: path,
        resume_filename: file.name,
        resume_uploaded_at: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (isSignup) {
        if (!resume) {
          setError("Please attach your resume as a PDF to continue.");
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() || null } },
        });
        if (error) throw error;

        // Supabase mails a numeric code; the account is unusable until it
        // is entered, so move straight to the code step.
        setStep("otp");
        setNotice(`We sent a verification code to ${email}.`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: "signup",
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId && resume) {
        try {
          await uploadResume(userId, resume);
        } catch (upErr) {
          // The account is real and verified; a failed upload should not
          // strand them at the login screen. Say so and let them retry
          // from their profile.
          setNotice(
            "Account verified, but your resume did not upload. You can add it from your profile.",
          );
          console.error("resume upload failed", upErr);
        }
      }

      // Credit whoever invited them. Best effort: never blocks signup.
      const ref = params.get("ref");
      if (ref) {
        await fetch("/api/profile/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ref }),
        }).catch(() => {});
      }

      // New accounts go through onboarding first, then on to where they were headed.
      router.push(`/onboarding?next=${encodeURIComponent(next)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code did not work.");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setError(error ? error.message : null);
    if (!error) setNotice(`New code sent to ${email}.`);
    setBusy(false);
  }

  /* ------------------------------------------------------ OTP step */
  if (step === "otp") {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center gap-3">
          <Logo markClassName="h-11 w-11" size="lg" animate="always" />
          <p className="text-center text-[13px] text-[var(--color-c-muted)]">
            Enter the code we emailed you
          </p>
        </div>

        <form
          onSubmit={onVerify}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5"
        >
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, MAX_OTP_LENGTH))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="00000000"
            maxLength={MAX_OTP_LENGTH}
            aria-label="Verification code"
            className="h-14 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] text-center font-mono text-[24px] tracking-[0.25em] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
          />

          {error && (
            <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-c-chip-hard)] px-3 py-2 text-[12px] text-[var(--color-c-red)]">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </p>
          )}
          {notice && !error && (
            <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-c-chip-easy)] px-3 py-2 text-[12px] text-[var(--color-c-lime)]">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || otp.length < MIN_OTP_LENGTH}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-c-lime)] text-[13px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)] disabled:opacity-50"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify and continue
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={busy}
            className="text-[11px] text-[var(--color-c-muted)] transition-colors hover:text-[var(--color-c-lime)] disabled:opacity-50"
          >
            Didn&apos;t get it? Send another code
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setStep("form");
            setOtp("");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 w-full text-center text-[12px] text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
        >
          ← Use a different email
        </button>
      </div>
    );
  }

  /* ----------------------------------------------------- form step */
  return (
    <div className="w-full max-w-sm">
      <div className="mb-7 flex flex-col items-center gap-3">
        <Logo markClassName="h-11 w-11" size="lg" animate="always" />
        <p className="text-[13px] text-[var(--color-c-muted)]">
          {isSignup
            ? "Create your account to get started"
            : "Sign in to continue"}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5"
      >
        {isSignup && (
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
              className="h-10 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] px-3 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
            Email
          </span>
          <span className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-dim)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 w-full rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] pl-9 pr-3 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
            />
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
            Password
          </span>
          <span className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-c-dim)]" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "At least 6 characters" : "••••••••"}
              className="h-10 w-full rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] pl-9 pr-3 text-[13px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
            />
          </span>
        </label>

        {/* Resume is required at signup — the platform is built around it. */}
        {isSignup && (
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
              Resume (PDF)
              <span className="text-[var(--color-c-lime)]">required</span>
            </span>

            {resume ? (
              <div className="flex items-center gap-2 rounded-lg border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-2.5">
                <FileText className="h-4 w-4 shrink-0 text-[var(--color-c-lime)]" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--color-c-text)]">
                  {resume.name}
                </span>
                <span className="shrink-0 text-[10px] text-[var(--color-c-dim)]">
                  {(resume.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => setResume(null)}
                  aria-label="Remove resume"
                  className="shrink-0 text-[var(--color-c-dim)] hover:text-[var(--color-c-red)]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-[var(--color-c-border-strong)] bg-[var(--color-c-surface-2)] px-3 py-5 text-center transition-colors hover:border-[var(--color-c-lime)]">
                <Upload className="h-5 w-5 text-[var(--color-c-dim)]" />
                <span className="text-[12px] font-medium text-[var(--color-c-text-4)]">
                  Upload your resume
                </span>
                <span className="text-[10px] text-[var(--color-c-dim)]">
                  PDF, up to 5 MB
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={pickResume}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {error && (
          <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-c-chip-hard)] px-3 py-2 text-[12px] text-[var(--color-c-red)]">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
        {notice && (
          <p className="flex items-start gap-1.5 rounded-lg bg-[var(--color-c-chip-easy)] px-3 py-2 text-[12px] text-[var(--color-c-lime)]">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || (isSignup && !resume)}
          className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-c-lime)] text-[13px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)] disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-[12px] text-[var(--color-c-muted)]">
        {isSignup ? "Already have an account?" : "New here?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-[var(--color-c-lime)] hover:underline"
        >
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
