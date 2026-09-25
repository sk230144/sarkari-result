"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Zap,
  FileText,
  Monitor,
  Target,
  ArrowUpRight,
  History,
  LayoutGrid,
  ChevronRight,
  Gift,
  Copy,
  Check,
  Gauge,
  LogIn,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { LetterModal } from "@/components/cover-letter/letter-modal";
import { AnalysisModal } from "@/components/cover-letter/analysis-modal";
import { StepLoader } from "@/components/cover-letter/modal";
import type { CopilotData } from "@/lib/copilot-types";
import type { LetterResult } from "@/lib/cover-letter-config";
import type { AnalysisResult } from "@/lib/analyzer/config";

const EASE = [0.22, 1, 0.36, 1] as const;
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const TOOLS = [
  {
    title: "Cover Letter",
    body: "Generate three tailored cover letters for any job in seconds, written from your resume and the JD.",
    cta: "Begin",
    href: "/cover-letter#generate",
    icon: Zap,
    watermark: FileText,
    tint: "#c084fc",
    glow: "rgba(192,132,252,0.18)",
  },
  {
    title: "Resume Analysis",
    body: "Get an honest ATS match score, the exact skills you're missing, and a plan to close the gap.",
    cta: "Check my score",
    href: "/resume-analysis#generate",
    icon: Target,
    watermark: Gauge,
    tint: "#facc15",
    glow: "rgba(250,204,21,0.14)",
  },
  {
    title: "Mock Interview",
    body: "Practise role-specific AI interviews and get detailed feedback on your answers.",
    cta: "Coming soon",
    href: null,
    icon: Sparkles,
    watermark: Monitor,
    tint: "#34d399",
    glow: "rgba(52,211,153,0.14)",
  },
];

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-muted)]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10">
          <Icon className="h-3 w-3" />
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}

function scoreTone(score: number) {
  if (score >= 80) return { ring: "border-emerald-400/40 bg-emerald-400/10", text: "text-emerald-300" };
  if (score >= 60) return { ring: "border-lime-400/40 bg-lime-400/10", text: "text-lime-300" };
  if (score >= 40) return { ring: "border-amber-400/40 bg-amber-400/10", text: "text-amber-300" };
  return { ring: "border-red-500/40 bg-red-500/10", text: "text-red-300" };
}

function UsageBar({ label, value, color }: { label: string; value: { used: number; limit: number } | null; color: string }) {
  const pct = value ? Math.min(100, (value.used / value.limit) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-[12px]">
        <span className="text-[var(--color-c-text-4)]">{label}</span>
        <span className="text-[var(--color-c-muted)]">
          {value ? (
            <>
              <strong className="text-[var(--color-c-text)]">{value.used}</strong> / {value.limit}
            </>
          ) : (
            <strong className="text-[var(--color-c-text)]">Unlimited</strong>
          )}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: value ? `${Math.max(pct, value.used ? 3 : 0)}%` : "100%" }}
          transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export function CopilotDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [data, setData] = useState<CopilotData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<(LetterResult & { company: string | null; jd: string }) | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [regenerating, setRegenerating] = useState<{ done: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/copilot", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't load your dashboard.");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your dashboard.");
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    load();
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [user, authLoading, load]);

  async function regenerate(l: NonNullable<typeof letter>) {
    setLetter(null);
    setRegenerating({ done: false });
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvId: l.cvId, role: l.role, jd: l.jd, regenerate: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Couldn't regenerate.");
      const next = { ...(json as LetterResult), company: l.company, jd: l.jd };
      setRegenerating({ done: true });
      setTimeout(() => {
        setRegenerating(null);
        setLetter(next);
        load();
      }, 400);
    } catch (e) {
      setRegenerating(null);
      setError(e instanceof Error ? e.message : "Couldn't regenerate.");
    }
  }

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const invite = data?.invite.slug ? `${origin}/signup?ref=${data.invite.slug}` : "";

  const fade = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay: 0.08 * i },
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div {...fade(0)} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-lime)]">
            <Sparkles className="h-3.5 w-3.5" />
            AI Workspace
          </p>
          <h1 className="mt-1.5 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">
            AI Copilot Dashboard
          </h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-[var(--color-c-muted)]">
            Track your AI-powered career growth. Your cover letters, resume match scores and daily limits in one place.
          </p>
        </div>
        <Link
          href="/resume-analysis#generate"
          className="cl-glow inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black transition-transform hover:-translate-y-0.5 sm:self-auto"
        >
          Analyse New Job
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </motion.div>

      {/* Tool cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {TOOLS.map((t, i) => {
          const card = (
            <motion.div
              {...fade(i + 1)}
              whileHover={t.href ? { y: -5 } : undefined}
              className={`group relative h-full overflow-hidden rounded-3xl border border-white/[0.07] bg-[#141713] p-6 ${
                t.href ? "cursor-pointer" : "opacity-80"
              }`}
              style={{ boxShadow: `0 0 0 1px ${t.glow}, 0 20px 50px -30px ${t.glow}` }}
            >
              <t.watermark aria-hidden className="absolute -right-3 -top-3 h-28 w-28 rotate-12 opacity-[0.06] transition-transform duration-500 group-hover:rotate-6" />
              <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${t.tint}1f`, color: t.tint }}>
                <t.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-[20px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">{t.title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-c-muted)]">{t.body}</p>
              <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: t.tint }}>
                {t.cta}
                {t.href && <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
              </p>
            </motion.div>
          );
          return t.href ? (
            <Link key={t.title} href={t.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={t.title}>{card}</div>
          );
        })}
      </div>

      {!authLoading && !user ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/[0.07] bg-[#141713] px-6 py-14 text-center">
          <LogIn className="h-6 w-6 text-[var(--color-c-lime)]" />
          <p className="text-[16px] font-bold text-[var(--color-c-text)]">Sign in to see your AI workspace</p>
          <p className="max-w-md text-[13px] text-[var(--color-c-muted)]">Your letters, match reports and usage are saved to your account.</p>
          <Link href="/login?next=/ai-copilot" className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
            Sign in
          </Link>
        </div>
      ) : error && !data ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-500/25 bg-red-500/[0.06] px-6 py-10 text-center">
          <p className="text-[13px] text-red-300">{error}</p>
          <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] text-[var(--color-c-text)]">
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      ) : !data ? (
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="h-80 animate-pulse rounded-3xl bg-white/[0.03]" />
          <div className="h-80 animate-pulse rounded-3xl bg-white/[0.03]" />
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
          {/* Left rail */}
          <div className="flex flex-col gap-5">
            <motion.div {...fade(4)} className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#141713]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
                  <History className="h-4 w-4 text-[var(--color-c-lime)]" />
                  Usage Limits
                  <span className="text-[11px] font-normal text-[var(--color-c-dim)]">(today)</span>
                </p>
                <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-muted)]">
                  Free
                </span>
              </div>
              <div className="space-y-4 px-5 py-5">
                <UsageBar label="Cover letter AI calls" value={data.usage.letters} color="#a855f7" />
                <UsageBar label="Resume analyses" value={data.usage.analyses} color="#3b82f6" />
                <p className="text-[11px] leading-relaxed text-[var(--color-c-dim)]">
                  Limits reset on a rolling 24-hour window. Opening a letter or report you already made is always free.
                </p>
              </div>
            </motion.div>

            <motion.div {...fade(5)} className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#141713]">
              <div className="border-b border-white/[0.06] px-5 py-4">
                <p className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
                  <Gift className="h-4 w-4 text-[var(--color-c-lime)]" />
                  Invite Friends
                </p>
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">Your invite link</p>
                  <p className="mt-1 truncate font-mono text-[11px] text-[var(--color-c-text-4)]">{invite.replace(/^https?:\/\//, "") || "—"}</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Join me on jobalert24: ${invite}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on WhatsApp"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#25d366] text-[11px] font-bold text-white"
                    >
                      W
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(invite)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on LinkedIn"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a66c2] text-[11px] font-bold text-white"
                    >
                      in
                    </a>
                    <button
                      type="button"
                      disabled={!invite}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(invite);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1800);
                        } catch {
                          /* clipboard blocked */
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[11px] font-medium text-[var(--color-c-text-4)] hover:text-[var(--color-c-text)]"
                    >
                      {copied ? <Check className="h-3 w-3 text-[var(--color-c-lime)]" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-[var(--color-c-muted)]">Friends who joined</span>
                  <span className="text-[18px] font-bold text-[var(--color-c-lime)]">{data.invite.referrals}</span>
                </div>
                <p className="text-[10px] leading-relaxed text-[var(--color-c-dim)]">
                  A friend counts once they sign up with your link and verify their email.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="flex min-w-0 flex-col gap-8">
            <div className="grid gap-6 xl:grid-cols-2">
              <Section icon={History} title="Recent letters">
                {data.letters.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-muted)]">No letters yet</p>
                    <Link href="/cover-letter#generate" className="text-[12px] font-semibold text-[var(--color-c-lime)] hover:underline">
                      Write your first one →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.letters.map((l, i) => (
                      <motion.div
                        key={l.id}
                        {...fade(i + 5)}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#141713] px-4 py-3.5 transition-colors hover:border-white/15"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-bold tracking-tight text-[var(--color-c-text)]">{l.role}</p>
                          <p className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-muted)]">
                            {l.company ?? "Company not specified"}
                          </p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-c-dim)]">{fmtDay(l.updatedAt)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLetter(l)}
                          className="rounded-lg border border-[var(--color-c-lime)]/40 px-3 py-1.5 font-mono text-[10px] font-bold uppercase text-[var(--color-c-lime)] transition-colors hover:bg-[var(--color-c-lime)]/10"
                        >
                          View
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Section>

              <Section icon={History} title="Recent mock sessions">
                <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-[#141713] px-4 py-8 text-center">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-muted)]">No sessions</p>
                  <p className="text-[11px] text-[var(--color-c-dim)]">Mock interviews are coming soon.</p>
                </div>
              </Section>
            </div>

            <div>
              <p className="mb-4 flex items-center gap-3 text-[22px] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <LayoutGrid className="h-4 w-4" />
                </span>
                Recent Activity
              </p>
              {data.analyses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center">
                  <p className="text-[13px] font-semibold text-[var(--color-c-text)]">No resume analyses yet</p>
                  <p className="text-[12px] text-[var(--color-c-muted)]">Score your resume against a job to see it here.</p>
                  <Link href="/resume-analysis#generate" className="mt-1 text-[12px] font-semibold text-[var(--color-c-lime)] hover:underline">
                    Analyse a job →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {data.analyses.map((a, i) => {
                    const tone = scoreTone(a.report.score);
                    return (
                      <motion.button
                        key={a.id}
                        type="button"
                        {...fade(i + 6)}
                        whileHover={{ x: 3 }}
                        onClick={() => setAnalysis(a)}
                        className="flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-[#141713] px-4 py-3.5 text-left transition-colors hover:border-white/15"
                      >
                        <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border ${tone.ring}`}>
                          <span className={`font-mono text-[7px] font-bold uppercase ${tone.text}`}>Match</span>
                          <span className={`text-[13px] font-extrabold ${tone.text}`}>{a.report.score}%</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold tracking-tight text-[var(--color-c-text)]">{a.report.jdTitle}</span>
                          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-c-muted)]">
                            {a.report.verdict} · {fmtDay(a.createdAt)}
                          </span>
                        </span>
                        <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                          {a.report.matched.slice(0, 3).map((s) => (
                            <span key={s} className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-text-4)]">
                              {s}
                            </span>
                          ))}
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-[var(--color-c-muted)]">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {letter && (
        <LetterModal
          key={`${letter.id}-${letter.updatedAt}`}
          initial={letter}
          company={letter.company ?? ""}
          jd={letter.jd}
          onClose={() => {
            setLetter(null);
            load();
          }}
          onRegenerateAll={() => regenerate(letter)}
        />
      )}
      {regenerating && (
        <StepLoader
          title="Rewriting your cover letters"
          steps={["Reading your resume…", "Drafting The Operator…", "Drafting The Believer…", "Drafting Quick Apply…"]}
          done={regenerating.done}
          onDone={() => {}}
        />
      )}
      {analysis && (
        <AnalysisModal
          result={analysis}
          onClose={() => setAnalysis(null)}
          onCoverLetter={() => router.push("/cover-letter#generate")}
        />
      )}
      {regenerating === null && error && data && (
        <p className="text-center text-[12px] text-red-300">{error}</p>
      )}
    </div>
  );
}
