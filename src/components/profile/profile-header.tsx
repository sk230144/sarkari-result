"use client";

import { useState } from "react";
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
      <div className="overflow-hidden rounded-2xl border border-[#1e2920] bg-[#0f1410]">
        <div className="relative h-36 bg-gradient-to-br from-[#16210f] via-[#111811] to-[#0d110d] sm:h-44">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <button
            type="button"
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg border border-[#2b332b] bg-[#0b0e0b]/80 px-2.5 py-1.5 text-[11px] font-medium text-[#d1d5db] backdrop-blur-sm transition-colors hover:border-[#3f4740] hover:text-white"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Add banner
          </button>
        </div>

        <div className="relative px-5 pb-5">
          {/* Avatar */}
          <div className="absolute -top-10 left-5">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border-2 border-[#0f1410] bg-[#2f4a25]">
              <span className="flex h-full w-full items-center justify-center text-[24px] font-bold text-[#a3e635]">
                S
              </span>
              <span className="blink absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-[#0f1410] bg-[#a3e635]" />
            </div>
          </div>

          <div className="pt-12">
            <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-white">
              Saurabh Tiwari
              <Pencil className="h-3.5 w-3.5 cursor-pointer text-[#6b7280] hover:text-white" />
            </h1>
            <p className="mt-0.5 flex items-center gap-2 text-[12px] font-semibold text-[#a3e635]">
              Add a headline to stand out
              <Pencil className="h-3 w-3 cursor-pointer text-[#6b7280] hover:text-white" />
            </p>
            <p className="mt-1 text-[11px] text-[#8c9c90]">
              risabht043@gmail.com
            </p>
            <p className="text-[11px] text-[#8c9c90]">Engineering · Junior</p>

            {/* Status chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2b332b] bg-[#141a14] px-2.5 py-1 text-[11px] text-[#d1d5db]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
                Mark as Open to Work
              </span>
              <span className="rounded-full border border-[#2b332b] bg-[#141a14] px-2.5 py-1 text-[11px] text-[#d1d5db]">
                Explorer (Free)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24364f] bg-[#0e1726] px-2.5 py-1 text-[11px] text-[#60a5fa]">
                <Sparkles className="h-3 w-3" />
                AI Profile Active
              </span>
            </div>

            {/* Visibility toggle */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white">
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
                  isPublic ? "bg-[#a3e635]" : "bg-[#3f4740]"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8c9c90]">
                <Globe className="h-3 w-3" />
                Public
              </span>
              <span className="text-[11px] text-[#6b7280]">
                {isPublic
                  ? "Anyone with the link can see your profile"
                  : "Only you can see your profile"}
              </span>
            </div>

            {/* Public link */}
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#1e2920] pt-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                  <Globe className="h-3 w-3" />
                  Public Profile Link
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#8c9c90]">
                  devsunite.com/u/cM8LWDXcnuDy…
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-[#2b332b] bg-[#141a14] px-3 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
                >
                  Share Profile
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#2b332b] bg-[#141a14] px-3 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
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
        <div className="relative overflow-hidden rounded-2xl border border-[#1e2920] bg-[#0f1410] p-4 lg:col-span-2">
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
              <span className="text-[12px] font-bold text-white">
                Profile Strength
              </span>
              <span className="text-[19px] font-bold text-white">
                {strength}%
              </span>
            </div>
            <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1e241d]">
              <div
                className="h-full rounded-full bg-[#a3e635] transition-all duration-500"
                style={{ width: `${strength}%` }}
              />
            </div>
            <p className="mb-3 text-[10px] text-[#8c9c90]">
              {met}/{REQUIREMENTS.length} requirements met
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REQUIREMENTS.map((r) => (
                <span
                  key={r.label}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    r.met
                      ? "border-[#2f4a25] bg-[#16210f] text-[#a3e635]"
                      : "border-[#3a2f16] bg-[#1f1a0d] text-[#fbbf24]"
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

        <div className="rounded-2xl border border-[#1e2920] bg-[#0f1410] p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold text-white">
            <Eye className="h-3.5 w-3.5 text-[#8c9c90]" />
            Profile Views
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-[#8c9c90]">
              Unlock view analytics with PRO+
            </p>
            <button
              type="button"
              className="shrink-0 rounded-full bg-[#a3e635] px-3 py-1 text-[11px] font-bold text-black transition-colors hover:bg-[#84cc16]"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
