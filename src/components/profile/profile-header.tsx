"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Pencil,
  ImagePlus,
  Lock,
  Eye,
  Globe,
  Sparkles,
  Check,
} from "lucide-react";

const REQUIREMENTS = [
  { label: "Profile photo", met: true },
  { label: "Headline", met: false },
  { label: "Resume uploaded", met: true },
  { label: "Work experience", met: true },
  { label: "Projects", met: true },
  { label: "3+ skills", met: true },
  { label: "Social links", met: true },
];

export function ProfileHeader() {
  const [isPublic, setIsPublic] = useState(false);

  const met = REQUIREMENTS.filter((r) => r.met).length;
  const strength = Math.round((met / REQUIREMENTS.length) * 100);

  return (
    <>
      {/* Banner + identity */}
      <div className="overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)]">
        <div className="relative h-36 bg-gradient-to-br from-[var(--color-c-chip-easy)] via-[var(--color-c-surface-2d)] to-[var(--color-c-canvas-alt2)] sm:h-44">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          {/* This page has no topbar, so the theme switch lives here. */}
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-canvas)]/80 px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] backdrop-blur-sm transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Add banner
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="relative px-5 pb-5">
          {/* Avatar */}
          <div className="absolute -top-10 left-5">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-[var(--color-c-surface-1)] bg-[var(--color-c-olive)]">
              <span className="flex h-full w-full items-center justify-center text-[24px] font-bold text-[var(--color-c-lime)]">
                S
              </span>
              <span className="blink absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[var(--color-c-surface-1)] bg-[var(--color-c-lime)]" />
            </div>
          </div>

          <div className="pt-12">
            <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-[var(--color-c-text)]">
              Saurabh Tiwari
              <Pencil className="h-3.5 w-3.5 cursor-pointer text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]" />
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[12px] font-semibold text-[var(--color-c-lime)]">
              Add a headline to stand out
              <Pencil className="h-3 w-3 cursor-pointer text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]" />
            </p>
            <p className="mt-1 text-[11px] text-[var(--color-c-muted)]">
              risabht043@gmail.com
            </p>
            <p className="text-[11px] text-[var(--color-c-muted)]">Engineering · Junior</p>

            {/* Status chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2.5 py-1 text-[11px] text-[var(--color-c-text-4)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
                Mark as Open to Work
              </span>
              <span className="rounded-full border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2.5 py-1 text-[11px] text-[var(--color-c-text-4)]">
                Explorer (Free)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-blue-raised)] bg-[var(--color-c-blue-dim-2)] px-2.5 py-1 text-[11px] text-[var(--color-c-blue)]">
                <Sparkles className="h-3 w-3" />
                AI Profile Active
              </span>
            </div>

            {/* Visibility toggle */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-c-text)]">
                <Lock className="h-3 w-3" />
                Private
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                aria-label="Toggle profile visibility"
                onClick={() => setIsPublic((v) => !v)}
                className={`relative h-5 w-10 rounded-full p-0.5 transition-colors ${
                  isPublic ? "bg-[var(--color-c-lime)]" : "bg-[var(--color-c-border-strong)]"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-c-muted)]">
                <Globe className="h-3 w-3" />
                Public
              </span>
              <span className="text-[11px] text-[var(--color-c-dim)]">
                {isPublic
                  ? "Anyone with the link can see your profile"
                  : "Only you can see your profile"}
              </span>
            </div>

            {/* Public link */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--color-c-border)] pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-c-text)]">
                  <Globe className="h-3 w-3" />
                  Public Profile Link
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--color-c-muted)]">
                  devsunite.com/u/cM8LWDXcnuDy…
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
                >
                  Share Profile
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
                >
                  Claim Custom URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strength + views */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4 lg:col-span-2">
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.12]"
            style={{
              background:
                "radial-gradient(circle at 80% 30%, #a3e635 0%, transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[12px] font-bold text-[var(--color-c-text)]">
                Profile Strength
              </span>
              <span className="text-[19px] font-bold text-[var(--color-c-text)]">
                {strength}%
              </span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]">
              <div
                className="h-full rounded-full bg-[var(--color-c-lime)] transition-all duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>
            <p className="mb-3 text-[10px] text-[var(--color-c-muted)]">
              {met}/{REQUIREMENTS.length} requirements met
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REQUIREMENTS.map((r) => (
                <span
                  key={r.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    r.met
                      ? "border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] text-[var(--color-c-lime)]"
                      : "border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim-3)] text-[var(--color-c-amber)]"
                  }`}
                >
                  {r.met ? (
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  ) : (
                    <span className="text-[9px]">✕</span>
                  )}
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-c-text)]">
            <Eye className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
            Profile Views
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-[var(--color-c-muted)]">
              Unlock view analytics with PRO+
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full bg-[var(--color-c-lime)] px-3 py-1 text-[11px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)]"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
