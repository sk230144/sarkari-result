"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  FileSearch,
  BookOpen,
  MessagesSquare,
  BadgeCheck,
  Mail,
  Briefcase,
  ListChecks,
  Loader2,
  UploadCloud,
  Sparkles,
  Table,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { LogoClimb, Logo } from "@/components/ui/logo";
import {
  CHALLENGES,
  COUNTRIES,
  SOURCES,
  STAGES,
  TOOL_FOR_CHALLENGE,
  type OnboardingState,
  type Stage,
} from "@/lib/onboarding";
import { ActiveArt, ExploringArt, PassiveArt } from "./illustrations";

const EASE = [0.22, 1, 0.36, 1] as const;
const ART = { active: ActiveArt, passive: PassiveArt, not_looking: ExploringArt };
const LIME = "#a3e635";

const TOOLS = [
  { key: "resume", icon: FileSearch, tint: "#15803d", title: "Resume Analyser", body: "See exactly what's missing against a real job description, and fix it in minutes.", cta: "Try Resume Analyser", href: "/resume-analysis" },
  { key: "prep", icon: BookOpen, tint: "#b91c1c", title: "Free Prep Resources", body: "DSA sheets, system design, and company interview questions, free and yours to revisit.", cta: "Explore Resources", href: "/dsa-sheets", free: true },
  { key: "interview", icon: MessagesSquare, tint: "#b45309", title: "Mock Interview", body: "Practise with AI-driven interviews tailored to the role, with feedback on every answer.", cta: "Try Mock Interview", href: "/mock-interview" },
  { key: "portfolio", icon: BadgeCheck, tint: "#7c3aed", title: "Portfolio Builder", body: "Turn your resume into a public page you can share with recruiters.", cta: "Build my portfolio", href: "/profile", free: true },
  { key: "letter", icon: Mail, tint: "#1d4ed8", title: "Cover Letter Writer", body: "Generate a letter matched to the exact job you're applying to, instead of a blank page.", cta: "Try Cover Letter Writer", href: "/cover-letter" },
  { key: "tasks", icon: ListChecks, tint: "#0f766e", title: "Task Board", body: "Plan applications, prep and follow-ups on one board that syncs to your account.", cta: "Open Task Board", href: "/task-board", free: true },
];

/* --------------------------------------------------------- left panel */

function BrandPanel() {
  const reduce = useReducedMotion();
  const facts = [
    { icon: Briefcase, text: "Fresh jobs from 40+ top companies, refreshed every 6 hours" },
    { icon: Table, text: "2,100+ DSA and company interview questions with progress tracking" },
    { icon: Sparkles, text: "AI cover letters, ATS resume scoring and mock interviews" },
  ];
  return (
    <aside className="relative hidden overflow-hidden bg-[#0e1a12] lg:flex lg:w-[38%] lg:flex-col lg:justify-center lg:px-14 xl:px-20">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div aria-hidden className="absolute -left-20 top-1/3 h-80 w-80 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.14), transparent 70%)" }} />
      <div className="relative">
        <Logo markClassName="h-10 w-10" size="lg" animate="always" />
        <p className="mt-10 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-white/60">One place for your job search</p>
        <ul className="mt-6 space-y-4">
          {facts.map((f, i) => (
            <motion.li
              key={f.text}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 + i * 0.12 }}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#a3e635]/15 text-[#a3e635]">
                <f.icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-[14px] leading-snug text-white/85">{f.text}</span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-8 text-[13px] leading-relaxed text-white/50">
          A few quick questions help us show you the right tools first. Nothing here limits what you can use.
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------ pieces */

function Progress({ step }: { step: number }) {
  const about = Math.min(step, 4);
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="mb-2 flex justify-between text-[14px]">
          <span className="font-medium text-[#1a1c1b]">A little bit about you</span>
          {step <= 4 && <span className="text-[#6b6b66]">{about}/4</span>}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e6e5de]">
          <motion.div className="h-full rounded-full" style={{ background: LIME }} animate={{ width: `${(about / 4) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-[14px] font-medium text-[#6b6b66]">How we can help you</div>
        <div className="h-2 overflow-hidden rounded-full bg-[#e6e5de]">
          <motion.div className="h-full rounded-full" style={{ background: LIME }} animate={{ width: step > 4 ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
      </div>
    </div>
  );
}

function Choice({ label, on, multi, onClick }: { label: string; on: boolean; multi?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={on}
      onClick={onClick}
      className={`flex min-h-[62px] items-center gap-3.5 rounded-2xl border-2 bg-white px-5 py-3 text-left text-[15px] transition-all ${
        on ? "border-[#84cc16] shadow-[0_0_0_4px_rgba(163,230,53,0.18)]" : "border-[#e4e3dc] hover:border-[#c9d6b0]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          on ? "border-[#65a30d] bg-[#84cc16] text-white" : "border-[#a3e635]"
        }`}
      >
        {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
      </span>
      <span className="text-[#1a1c1b]">{label}</span>
    </button>
  );
}

function Nav({ onBack, onNext, disabled, busy, nextLabel = "Next" }: { onBack?: () => void; onNext: () => void; disabled: boolean; busy?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-10 flex items-center justify-between">
      {onBack ? (
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-medium text-[#1a1c1b] hover:bg-black/5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || busy}
        className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold text-[#1a2e05] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
        style={{ background: LIME }}
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {nextLabel}
      </button>
    </div>
  );
}

/* -------------------------------------------------------------- flow */

export function OnboardingFlow({ next }: { next: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [data, setData] = useState<OnboardingState | null>(null);
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/onboarding")}`);
      return;
    }
    fetch("/api/onboarding", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: OnboardingState) => setData({ ...d, country: d.country ?? "India", consent: d.onboardedAt ? d.consent : true }))
      .catch(() => setError("Couldn't load your details. Please refresh."));
  }, [user, authLoading, router]);

  const go = (to: number) => {
    setError(null);
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const set = (patch: Partial<OnboardingState>) => setData((d) => (d ? { ...d, ...patch } : d));

  async function uploadResume(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf") return setError("Please choose a PDF file.");
    if (file.size > 5 * 1024 * 1024) return setError("That PDF is over 5 MB.");
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("resume", file);
    const res = await fetch("/api/profile/resume", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) return setError(json.error ?? "Couldn't upload your resume.");
    set({ resume: { filename: file.name, uploadedAt: new Date().toISOString() } });
  }

  async function finish() {
    if (!data) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: data.country,
        phone: data.phone,
        consent: data.consent,
        stage: data.stage,
        challenges: data.challenges,
        source: data.source,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(json.error ?? "Couldn't save your answers.");
    go(5);
  }

  const recommended = new Set((data?.challenges ?? []).map((c) => TOOL_FOR_CHALLENGE[c]).filter(Boolean));
  const tools = [...TOOLS].sort((a, b) => Number(recommended.has(b.key)) - Number(recommended.has(a.key)));
  const phoneValid = !data?.phone || /^\+?[\d\s()-]{7,20}$/.test(data.phone.trim());

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -40 }),
  };

  return (
    <div className="flex min-h-screen bg-[#f3f2ec] text-[#1a1c1b]" style={{ colorScheme: "light" }}>
      <BrandPanel />
      <main className="flex min-h-screen flex-1 justify-center px-5 py-10 sm:px-10 lg:py-16">
        <div className="w-full max-w-3xl">
          <div className="mb-8 lg:hidden">
            <LogoClimb className="h-9 w-9 text-[#65a30d]" animate="always" />
          </div>
          <Progress step={step} />

          {!data ? (
            <div className="flex items-center justify-center py-32 text-[#6b6b66]">
              {error ?? <Loader2 className="h-6 w-6 animate-spin" />}
            </div>
          ) : (
            <AnimatePresence mode="wait" custom={dir}>
              <motion.section
                key={step}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: EASE }}
                className="pt-12"
              >
                {step === 1 && (
                  <>
                    <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                      Let&apos;s add your basic information
                    </h1>
                    <div className="mt-9 space-y-7">
                      <label className="block">
                        <span className="mb-2.5 block text-[15px] font-medium">
                          Location <span className="text-red-500">*</span>
                        </span>
                        <span className="relative block">
                          <select
                            value={data.country ?? ""}
                            onChange={(e) => set({ country: e.target.value })}
                            className="h-[62px] w-full appearance-none rounded-2xl border-2 border-[#e0dfd8] bg-[#f3f2ec] px-5 text-[16px] focus:border-[#84cc16] focus:outline-none"
                          >
                            <option value="" disabled>
                              Select a country
                            </option>
                            {COUNTRIES.map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b6b66]" />
                        </span>
                      </label>

                      <label className="block">
                        <span className="mb-2.5 block text-[15px] font-medium">
                          Phone Number <span className="font-normal text-[#6b6b66]">(Optional)</span>
                        </span>
                        <input
                          value={data.phone}
                          onChange={(e) => set({ phone: e.target.value.slice(0, 20) })}
                          inputMode="tel"
                          placeholder="e.g. +91 1234567890"
                          className={`h-[62px] w-full rounded-2xl border-2 bg-[#f3f2ec] px-5 text-[16px] placeholder:text-[#8a8a84] focus:outline-none ${
                            phoneValid ? "border-[#e0dfd8] focus:border-[#84cc16]" : "border-red-400"
                          }`}
                        />
                        <span className="mt-2 block text-[13px] text-[#4b4b47]">
                          Used for job recommendations and saved to your private application details. It will not be
                          publicly visible.
                        </span>
                      </label>

                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={data.consent}
                        onClick={() => set({ consent: !data.consent })}
                        className="flex w-full items-center gap-4 rounded-2xl border-2 border-[#e0dfd8] bg-white px-5 py-5 text-left text-[15px]"
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            data.consent ? "border-[#65a30d] bg-[#84cc16] text-white" : "border-[#c9c8c0]"
                          }`}
                        >
                          {data.consent && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
                        </span>
                        I agree to be contacted by Job Alert 24 via email or WhatsApp about relevant job opportunities.
                      </button>

                      <div>
                        <p className="text-[15px] font-medium">
                          Resume <span className="font-normal text-[#6b6b66]">(Optional)</span>
                        </p>
                        <p className="mt-1.5 text-[15px] text-[#4b4b47]">
                          We use this to build your public portfolio and match you to jobs. You can skip it and add it
                          later.
                        </p>
                        {data.resume ? (
                          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-[#d9f99d] bg-[#f7fee7] px-5 py-4 text-[15px]">
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4d7c0f]" />
                            <span className="flex-1">
                              You already have a resume on file{data.resume.filename ? ` (${data.resume.filename})` : ""}. We&apos;ll use it for your portfolio.
                            </span>
                            <button type="button" onClick={() => fileRef.current?.click()} className="text-[13px] font-semibold text-[#4d7c0f] hover:underline">
                              Replace
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c9d6b0] bg-white px-5 py-6 text-[15px] font-medium text-[#3f6212] hover:bg-[#f7fee7]"
                          >
                            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                            {uploading ? "Uploading…" : "Upload your resume (PDF, max 5 MB)"}
                          </button>
                        )}
                        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => uploadResume(e.target.files?.[0])} />
                      </div>
                    </div>
                    {error && <p className="mt-6 text-[14px] text-red-600">{error}</p>}
                    <Nav onNext={() => go(2)} disabled={!data.country || !phoneValid || uploading} />
                  </>
                )}

                {step === 2 && (
                  <>
                    <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                      Where are you in your job search?
                    </h1>
                    <p className="mt-3 text-[16px] text-[#4b4b47]">
                      This helps us tailor what we show you. It does not restrict anything you can use.
                    </p>
                    <div role="radiogroup" className="mt-9 grid gap-5 sm:grid-cols-3">
                      {STAGES.map((s) => {
                        const Art = ART[s.key];
                        const on = data.stage === s.key;
                        return (
                          <motion.button
                            key={s.key}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => set({ stage: s.key as Stage })}
                            whileHover={reduce ? undefined : { y: -4 }}
                            className={`rounded-2xl border-2 p-2 text-left transition-colors ${
                              on ? "border-[#84cc16] bg-white shadow-[0_0_0_4px_rgba(163,230,53,0.2)]" : "border-transparent hover:bg-white/60"
                            }`}
                          >
                            <span className="block aspect-[16/10] overflow-hidden rounded-xl">
                              <Art />
                            </span>
                            <span className="mt-4 flex items-center gap-2 px-1 text-[17px] font-medium">
                              {s.title}
                              {on && <CheckCircle2 className="h-4 w-4 text-[#65a30d]" />}
                            </span>
                            <span className="mt-2 block px-1 pb-2 text-[14px] leading-relaxed text-[#4b4b47]">{s.body}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                    <Nav onBack={() => go(1)} onNext={() => go(3)} disabled={!data.stage} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                      What challenges are you facing?
                    </h1>
                    <p className="mt-3 text-[15px] text-[#4b4b47]">Select at least one option.</p>
                    <div className="mt-8 grid gap-3.5 sm:grid-cols-2">
                      {CHALLENGES.map((c) => {
                        const on = data.challenges.includes(c);
                        return (
                          <Choice
                            key={c}
                            label={c}
                            multi
                            on={on}
                            onClick={() => set({ challenges: on ? data.challenges.filter((x) => x !== c) : [...data.challenges, c] })}
                          />
                        );
                      })}
                    </div>
                    <Nav onBack={() => go(2)} onNext={() => go(4)} disabled={!data.challenges.length} />
                  </>
                )}

                {step === 4 && (
                  <>
                    <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                      How did you hear about us?
                    </h1>
                    <p className="mt-3 text-[15px] text-[#4b4b47]">Select the option that fits best.</p>
                    <div role="radiogroup" className="mt-8 grid gap-3.5 sm:grid-cols-2">
                      {SOURCES.map((s) => (
                        <Choice key={s} label={s} on={data.source === s} onClick={() => set({ source: s })} />
                      ))}
                    </div>
                    {error && <p className="mt-6 text-[14px] text-red-600">{error}</p>}
                    <Nav onBack={() => go(3)} onNext={finish} disabled={!data.source} busy={saving} nextLabel="Finish" />
                  </>
                )}

                {step === 5 && (
                  <>
                    <h1 className="text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
                      AI-powered job search, at your fingertips
                    </h1>
                    <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[#4b4b47]">
                      {data.name ? `You're all set, ${data.name.split(" ")[0]}. ` : ""}Every tool below is built around
                      real job postings, so you always know the next right step, from your resume to the offer.
                    </p>
                    <Link
                      href="/jobs"
                      className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-[16px] font-semibold text-[#1a2e05] transition-all hover:brightness-95"
                      style={{ background: LIME }}
                    >
                      Find the best role
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <p className="mt-12 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#4b4b47]">
                      Every tool, in one place
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tools.map((t, i) => {
                        const rec = recommended.has(t.key);
                        return (
                          <motion.div
                            key={t.key}
                            initial={reduce ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
                          >
                            <Link
                              href={t.href}
                              className={`group flex h-full flex-col rounded-3xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.25)] ${
                                rec ? "border-[#84cc16]" : "border-[#e4e3dc]"
                              }`}
                            >
                              <span className="flex items-start justify-between">
                                <t.icon className="h-7 w-7" style={{ color: t.tint }} />
                                {rec ? (
                                  <span className="rounded-full bg-[#ecfccb] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3f6212]">
                                    For you
                                  </span>
                                ) : (
                                  t.free && <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#15803d]">Free</span>
                                )}
                              </span>
                              <span className="mt-6 text-[17px] font-medium">{t.title}</span>
                              <span className="mt-2 flex-1 text-[14px] leading-relaxed text-[#4b4b47]">{t.body}</span>
                              <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#15803d]">
                                {t.cta}
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                    <Link href={next} className="mt-8 inline-block text-[15px] text-[#4b4b47] underline-offset-4 hover:underline">
                      Skip, take me to the dashboard
                    </Link>
                  </>
                )}
              </motion.section>
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
