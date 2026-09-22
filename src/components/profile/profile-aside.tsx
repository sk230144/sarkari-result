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
      className={`rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] ${className}`}
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
        <div className="border-b border-[var(--color-c-border)] px-4 py-3">
          <h2 className="flex items-center gap-2 text-[13px] font-bold text-[var(--color-c-text)]">
            <Gift className="h-4 w-4 text-[var(--color-c-lime)]" />
            Invite Friends, Earn More
          </h2>
        </div>
        <div className="p-4">
          <div className="mb-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
              Your invite link
            </p>
            <p className="mb-3 truncate font-mono text-[11px] text-[var(--color-c-text-4)]">
              {INVITE}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="rounded-lg bg-[var(--color-c-lime)] px-3 py-1.5 text-[11px] font-bold text-black transition-colors hover:bg-[var(--color-c-lime-4)]"
              >
                Share
              </button>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25d366] text-[10px] font-bold text-[var(--color-c-text)]">
                W
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a66c2] text-[10px] font-bold text-[var(--color-c-text)]">
                in
              </span>
              <button
                type="button"
                onClick={copyInvite}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-[var(--color-c-lime)]" />
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

          <p className="mb-2 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
            A referral counts once your friend verifies their email and tries
            DevsUnite at least once.
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
            Each successful referral gives you{" "}
            <strong className="text-[var(--color-c-text)]">+2 matches</strong>,{" "}
            <strong className="text-[var(--color-c-text)]">+2 cover letters</strong>,{" "}
            <strong className="text-[var(--color-c-text)]">+2 interview preps</strong>, and{" "}
            <strong className="text-[var(--color-c-text)]">+3 auto-applies</strong> — free, this
            month. Counts toward up to 12 rewarded referrals per cycle, then
            refreshes.
          </p>

          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="text-[var(--color-c-muted)]">Progress to next reward</span>
            <span className="font-semibold text-[var(--color-c-text)]">0 / 3</span>
          </div>
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-[var(--color-c-track)]">
            <div className="h-full w-0 rounded-full bg-[var(--color-c-lime)]" />
          </div>
          <p className="mb-2 text-[10px] text-[var(--color-c-dim)]">
            Reach this and you&apos;ll unlock 10 days of PRO+, free.
          </p>
          <p className="text-[10px] text-[var(--color-c-dim)]">
            Tracking referrals since July 14, 2026.
          </p>
        </div>
      </Card>

      {/* Inbox */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Mail className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Inbox
        </h2>
        <p className="text-[11px] text-[var(--color-c-muted)]">No messages.</p>
      </Card>

      {/* Embeddable badge */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Code2 className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Embeddable Badge
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">
          Drop this into your GitHub README or site.
        </p>
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-[var(--color-c-olive)] bg-gradient-to-r from-[var(--color-c-chip-easy)] to-[var(--color-c-surface-1c)] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-lime)]">
            <BadgeCheck className="h-5 w-5 text-black" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-[var(--color-c-text)]">Developer</p>
            <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-[var(--color-c-muted)]">
              Verified Developer Profile
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[9px] font-semibold text-[var(--color-c-lime)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-c-lime)]" />
            DevsUnite
          </span>
        </div>
        <p className="break-all rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-2 font-mono text-[9px] leading-relaxed text-[var(--color-c-dim)]">
          [![Saurabh Tiwari](https://devsunite.com/api/badge/cM8LWDXcnuDyS7F67R7EpvwGGqA2)](https://devsunite.com/u/cM8LWDXcnuDyS7F67R7EpvwGGqA2)
        </p>
      </Card>

      {/* Public profile layout */}
      <Card className="p-4">
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <LayoutList className="h-3.5 w-3.5 text-[var(--color-c-muted)]" />
          Public Profile Layout
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">
          Reorder or hide sections on your public profile.
        </p>
        <div className="space-y-1.5">
          {LAYOUT_SECTIONS.map((s) => {
            const isHidden = hidden.includes(s);
            return (
              <div
                key={s}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] px-2.5 py-2"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab text-[var(--color-c-border-strong)]" />
                <span
                  className={`flex-1 truncate text-[11px] font-medium ${
                    isHidden ? "text-[var(--color-c-dim-4)] line-through" : "text-[var(--color-c-text)]"
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
                      ? "text-[var(--color-c-dim-4)] hover:text-[var(--color-c-muted)]"
                      : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
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
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
            <FileText className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
            Your Resume
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-c-lime)]">
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
            AI Parsed
          </span>
        </div>
        <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-c-red-border)] font-mono text-[8px] font-bold text-[var(--color-c-red)]">
              PDF
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[var(--color-c-text)]">
                Saurabh Resume.pdf
              </p>
              <p className="text-[9px] text-[var(--color-c-dim)]">9/15/2026 · 0.39 MB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
            >
              View Resume
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg bg-[var(--color-c-lime-deep)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-c-text)] transition-colors hover:bg-[var(--color-c-lime-5)]"
            >
              Update Resume
            </button>
          </div>
        </div>
      </Card>

      {/* Auto-apply */}
      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
            <Zap className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
            Auto-Apply Preferences
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim-3)] px-2 py-0.5 text-[9px] font-bold text-[var(--color-c-amber)]">
            0/5
          </span>
        </div>
        <p className="mb-3 flex gap-1.5 rounded-lg border border-[var(--color-c-amber-border)] bg-[var(--color-c-amber-dim)] p-2.5 text-[10px] leading-relaxed text-[var(--color-c-amber)]">
          <Zap className="mt-0.5 h-3 w-3 shrink-0" />
          Complete these fields so the Auto-Apply Chrome Extension can fill job
          applications without asking you every time.
        </p>
        <div className="space-y-1.5">
          {AUTO_APPLY.map(({ icon: Icon, label, hint, cta }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-start gap-2 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-2.5 text-left transition-colors hover:border-[var(--color-c-border-strong)]"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-c-muted)]" />
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-c-text-4)]">
                  {label}
                </span>
                <span className="block text-[10px] text-[var(--color-c-dim)]">
                  {hint}
                  {cta && (
                    <span className="ml-1 font-semibold text-[var(--color-c-lime)]">
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
        <h2 className="mb-1 flex items-center gap-2 text-[12px] font-bold text-[var(--color-c-text)]">
          <Palette className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
          Profile Themes
        </h2>
        <p className="mb-3 text-[11px] text-[var(--color-c-muted)]">
          Customize how others see your professional profile.
        </p>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTheme("midnight")}
            aria-pressed={theme === "midnight"}
            className={`rounded-xl border p-2 text-left transition-all ${
              theme === "midnight"
                ? "border-[var(--color-c-lime)] bg-[var(--color-c-canvas)]"
                : "border-[var(--color-c-border)] bg-[var(--color-c-canvas)] hover:border-[var(--color-c-border-strong)]"
            }`}
          >
            <span className="mb-2 block h-8 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-void)]" />
            <span className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--color-c-text)]">
                Midnight
              </span>
              {theme === "midnight" && (
                <Check className="h-3 w-3 text-[var(--color-c-lime)]" strokeWidth={3} />
              )}
            </span>
          </button>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-2 text-left opacity-80"
          >
            <span className="mb-2 flex h-8 items-center justify-center rounded-lg bg-[var(--color-c-text-dim)]">
              <Lock className="h-3.5 w-3.5 text-[var(--color-c-dim-4)]" />
            </span>
            <span className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[var(--color-c-muted)]">
                Daylight
              </span>
              <span className="text-[9px] font-bold text-[var(--color-c-lime)]">PRO+</span>
            </span>
          </button>
        </div>
        <p className="flex gap-1.5 text-[10px] leading-relaxed text-[var(--color-c-dim)]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          This editor always shows the default look. Your chosen theme applies
          only to your public profile as seen by others.
        </p>
      </Card>
    </div>
  );
}
