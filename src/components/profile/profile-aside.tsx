"use client";

import { useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Mail,
  Code2,
  LayoutList,
  GripVertical,
  Eye,
  FileText,
  Zap,
  Phone,
  Linkedin,
  Link2,
  Clock,
  DollarSign,
  Palette,
  Lock,
  Info,
  BadgeCheck,
} from "lucide-react";

const INVITE = "devsunite.com?ref=Q88DJJ7";

const LAYOUT_SECTIONS = [
  "Skills & Technologies",
  "Certifications",
  "Experience & Education",
  "Social Profiles",
  "Projects",
];

const AUTO_APPLY = [
  { icon: Phone, label: "Phone Number", hint: "Used for contact fields on job forms" },
  { icon: Linkedin, label: "LinkedIn URL", hint: "Auto-filled on LinkedIn profile fields" },
  { icon: Link2, label: "Portfolio / Website", hint: "Personal site, portfolio, or blog", cta: "Build one free" },
  { icon: Clock, label: "Years of Experience", hint: "Auto-fills experience dropdowns" },
  { icon: DollarSign, label: "Desired Salary", hint: "Used for compensation/salary fields" },
];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#1e2920] bg-[#0f1410] ${className}`}
    >
      {children}
    </section>
  );
}

export function ProfileAside() {
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);
  const [theme, setTheme] = useState<"midnight" | "daylight">("midnight");

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(`https://${INVITE}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — button simply doesn't confirm */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Referrals */}
      <Card>
        <div className="border-b border-[#1e2920] px-4 py-3">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-white">
            <Gift className="h-4 w-4 text-[#a3e635]" />
            Invite Friends, Earn More
          </h2>
        </div>
        <div className="p-4">
          <div className="mb-3 rounded-xl border border-[#1e2920] bg-[#0b0e0b] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Your invite link
            </p>
            <p className="mb-3 truncate font-mono text-[11px] text-[#d1d5db]">
              {INVITE}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="rounded-lg bg-[#a3e635] px-3 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-[#84cc16]"
              >
                Share
              </button>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25d366] text-[10px] font-bold text-white">
                W
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a66c2] text-[10px] font-bold text-white">
                in
              </span>
              <button
                type="button"
                onClick={copyInvite}
                className="inline-flex items-center gap-1 rounded-lg border border-[#2b332b] bg-[#141a14] px-2.5 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-[#a3e635]" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mb-2 text-[11px] leading-relaxed text-[#8c9c90]">
            A referral counts once your friend verifies their email and tries
            DevsUnite at least once.
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-[#8c9c90]">
            Each successful referral gives you{" "}
            <strong className="text-white">+2 matches</strong>,{" "}
            <strong className="text-white">+2 cover letters</strong>,{" "}
            <strong className="text-white">+2 interview preps</strong>, and{" "}
            <strong className="text-white">+3 auto-applies</strong> — free, this
            month. Counts toward up to 12 rewarded referrals per cycle, then
            refreshes.
          </p>

          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-[#8c9c90]">Progress to next reward</span>
            <span className="font-semibold text-white">0 / 3</span>
          </div>
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-[#1e241d]">
            <div className="h-full w-0 rounded-full bg-[#a3e635]" />
          </div>
          <p className="mb-2 text-[10px] text-[#6b7280]">
            Reach this and you&apos;ll unlock 10 days of PRO+, free.
          </p>
          <p className="text-[10px] text-[#6b7280]">
            Tracking referrals since July 14, 2026.
          </p>
        </div>
      </Card>

      {/* Inbox */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-white">
          <Mail className="h-3.5 w-3.5 text-[#8c9c90]" />
          Inbox
        </h2>
        <p className="text-[11px] text-[#8c9c90]">No messages.</p>
      </Card>

      {/* Embeddable badge */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-white">
          <Code2 className="h-3.5 w-3.5 text-[#8c9c90]" />
          Embeddable Badge
        </h2>
        <p className="mb-3 text-[11px] text-[#8c9c90]">
          Drop this into your GitHub README or site.
        </p>
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#2f4a25] bg-gradient-to-r from-[#16210f] to-[#0f1a0c] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a3e635]">
            <BadgeCheck className="h-5 w-5 text-black" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-white">Developer</p>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8c9c90]">
              Verified Developer Profile
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-[#a3e635]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a3e635]" />
            DevsUnite
          </span>
        </div>
        <p className="break-all rounded-lg border border-[#1e2920] bg-[#0b0e0b] p-2 font-mono text-[9px] leading-relaxed text-[#6b7280]">
          [![Saurabh Tiwari](https://devsunite.com/api/badge/cM8LWDXcnuDyS7F67R7EpvwGGqA2)](https://devsunite.com/u/cM8LWDXcnuDyS7F67R7EpvwGGqA2)
        </p>
      </Card>

      {/* Public profile layout */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-white">
          <LayoutList className="h-3.5 w-3.5 text-[#8c9c90]" />
          Public Profile Layout
        </h2>
        <p className="mb-3 text-[11px] text-[#8c9c90]">
          Reorder or hide sections on your public profile.
        </p>
        <div className="space-y-1.5">
          {LAYOUT_SECTIONS.map((s) => {
            const isHidden = hidden.includes(s);
            return (
              <div
                key={s}
                className="flex items-center gap-2 rounded-lg border border-[#1e2920] bg-[#0b0e0b] px-2.5 py-2"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-[#3f4740]" />
                <span
                  className={`flex-1 truncate text-[11px] font-medium ${
                    isHidden ? "text-[#4b5563] line-through" : "text-white"
                  }`}
                >
                  {s}
                </span>
                <button
                  type="button"
                  aria-label={`${isHidden ? "Show" : "Hide"} ${s}`}
                  aria-pressed={isHidden}
                  onClick={() =>
                    setHidden((p) =>
                      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
                    )
                  }
                  className={`shrink-0 transition-colors ${
                    isHidden
                      ? "text-[#4b5563] hover:text-[#8c9c90]"
                      : "text-[#8c9c90] hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Resume */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-white">
            <FileText className="h-3.5 w-3.5 text-[#a3e635]" />
            Your Resume
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#2f4a25] bg-[#16210f] px-2 py-0.5 text-[9px] font-bold text-[#a3e635]">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            AI Parsed
          </span>
        </div>
        <div className="rounded-xl border border-[#1e2920] bg-[#0b0e0b] p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#3b1418] font-mono text-[8px] font-bold text-[#f87171]">
              PDF
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">
                Saurabh Resume.pdf
              </p>
              <p className="text-[9px] text-[#6b7280]">9/15/2026 · 0.39 MB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-[#2b332b] bg-[#141a14] px-3 py-1.5 text-[11px] font-medium text-[#d1d5db] transition-colors hover:border-[#3f4740] hover:text-white"
            >
              View Resume
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#4d7c0f] px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#65a30d]"
            >
              Update Resume
            </button>
          </div>
        </div>
      </Card>

      {/* Auto-apply */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-white">
            <Zap className="h-3.5 w-3.5 text-[#a3e635]" />
            Auto-Apply Preferences
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#3a2f16] bg-[#1f1a0d] px-2 py-0.5 text-[9px] font-bold text-[#fbbf24]">
            0/5
          </span>
        </div>
        <p className="mb-3 flex gap-1.5 rounded-lg border border-[#3a2f16] bg-[#1a1509] p-2.5 text-[10px] leading-relaxed text-[#fbbf24]">
          <Zap className="mt-0.5 h-3 w-3 shrink-0" />
          Complete these fields so the Auto-Apply Chrome Extension can fill job
          applications without asking you every time.
        </p>
        <div className="space-y-1.5">
          {AUTO_APPLY.map(({ icon: Icon, label, hint, cta }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-start gap-2 rounded-lg border border-[#1e2920] bg-[#0b0e0b] p-2.5 text-left transition-colors hover:border-[#3f4740]"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8c9c90]" />
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#d1d5db]">
                  {label}
                </span>
                <span className="block text-[10px] text-[#6b7280]">
                  {hint}
                  {cta && (
                    <span className="ml-1 font-semibold text-[#a3e635]">
                      {cta}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Themes */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-white">
          <Palette className="h-3.5 w-3.5 text-[#a3e635]" />
          Profile Themes
        </h2>
        <p className="mb-3 text-[11px] text-[#8c9c90]">
          Customize how others see your professional profile.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("midnight")}
            aria-pressed={theme === "midnight"}
            className={`rounded-xl border p-2 text-left transition-all ${
              theme === "midnight"
                ? "border-[#a3e635] bg-[#0b0e0b]"
                : "border-[#1e2920] bg-[#0b0e0b] hover:border-[#3f4740]"
            }`}
          >
            <span className="mb-2 block h-8 rounded-lg border border-[#2b332b] bg-[#06080a]" />
            <span className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">
                Midnight
              </span>
              {theme === "midnight" && (
                <Check className="h-3 w-3 text-[#a3e635]" strokeWidth={3} />
              )}
            </span>
          </button>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-[#1e2920] bg-[#0b0e0b] p-2 text-left opacity-80"
          >
            <span className="mb-2 flex h-8 items-center justify-center rounded-lg bg-[#9ca3af]">
              <Lock className="h-3.5 w-3.5 text-[#4b5563]" />
            </span>
            <span className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8c9c90]">
                Daylight
              </span>
              <span className="text-[9px] font-bold text-[#a3e635]">PRO+</span>
            </span>
          </button>
        </div>
        <p className="flex gap-1.5 text-[10px] leading-relaxed text-[#6b7280]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          This editor always shows the default look. Your chosen theme applies
          only to your public profile as seen by others.
        </p>
      </Card>
    </div>
  );
}
