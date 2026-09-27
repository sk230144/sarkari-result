"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BarChart3, CheckCircle2, Crown, Globe2, Loader2, Lock, Mail, Mic, ShieldCheck, Sparkles, Target, X, XCircle, Zap } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { EASE } from "@/components/resume-analysis/motion";
import { PLANS, QUARTERLY_SAVING, daysLeft, inr, type PlanKey, type PremiumStatus } from "@/lib/premium";

const FEATURES = [
  { icon: Target, tint: "text-red-400", label: "Fresh job alerts", free: "Limited", pro: "25x more jobs" },
  { icon: Zap, tint: "text-amber-300", label: "AI Apply Extension", free: "Limited", pro: "One-click autofill" },
  { icon: BarChart3, tint: "text-sky-400", label: "Resume match score", free: "Limited", pro: "Unlimited" },
  { icon: Mail, tint: "text-[var(--color-c-muted)]", label: "AI cover letters", free: "Limited", pro: "Unlimited" },
  { icon: Mic, tint: "text-[var(--color-c-muted)]", label: "Mock interviews", free: "Limited", pro: "Unlimited" },
  { icon: Globe2, tint: "text-teal-300", label: "Developer portfolio", free: "Basic", pro: "Fully customisable" },
];

type Phase =
  | { kind: "idle" }
  | { kind: "confirm" }
  | { kind: "starting" }
  | { kind: "verifying" }
  | { kind: "success"; until: string | null }
  | { kind: "pending" }
  | { kind: "failed"; message: string };

type CashfreeCheckout = (o: { paymentSessionId: string; redirectTarget: "_modal" | "_self" }) => Promise<{ error?: { message?: string } }>;
declare global {
  interface Window {
    Cashfree?: (o: { mode: "production" | "sandbox" }) => { checkout: CashfreeCheckout };
  }
}

function loadCashfree(): Promise<void> {
  if (window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment window. Check your connection."));
    document.head.appendChild(s);
  });
}

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "");

const noop = () => () => {};

export function Pricing() {
  const reduce = useReducedMotion();
  const params = useSearchParams();
  // False while hydrating (so the markup matches the server), true after.
  // This part of the page hydrates late, when sign-in may already be known.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const router = useRouter();
  const { user, loading } = useAuth();
  // Arriving from the home page keeps the plan chosen there (?plan=quarterly).
  const [plan, setPlan] = useState<PlanKey>(() => (params.get("plan") === "quarterly" ? "quarterly" : "monthly"));
  const [status, setStatus] = useState<(PremiumStatus & { phone: string }) | null>(null);
  const [phone, setPhone] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const verifying = useRef(false);

  const loadStatus = useCallback(async () => {
    const r = await fetch("/api/payments/status", { cache: "no-store" }).catch(() => null);
    if (!r?.ok) return;
    const j = await r.json();
    setStatus(j);
    setPhone((p) => p || j.phone || "");
  }, []);

  useEffect(() => {
    if (!user) return;
    loadStatus();
  }, [user, loadStatus]);

  // Confirm with the server (which asks Cashfree). Polls briefly while the bank confirms.
  const verify = useCallback(
    async (orderId: string) => {
      if (verifying.current) return;
      verifying.current = true;
      setPhase({ kind: "verifying" });
      try {
        for (let i = 0; i < 8; i++) {
          const r = await fetch(`/api/payments/verify?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
          const j = await r.json().catch(() => ({}));
          if (r.ok && j.state === "paid") {
            setStatus((s) => ({ ...(s ?? { phone }), ...j.premium }));
            setPhase({ kind: "success", until: j.premium?.premiumUntil ?? null });
            return;
          }
          if (r.ok && j.state === "failed") return setPhase({ kind: "failed", message: "The payment didn't go through. No money was taken, or it will be refunded by your bank." });
          if (!r.ok && r.status !== 504 && r.status !== 502) return setPhase({ kind: "failed", message: j.error ?? "Couldn't confirm the payment." });
          await new Promise((res) => setTimeout(res, 2500));
        }
        setPhase({ kind: "pending" });
      } finally {
        verifying.current = false;
      }
    },
    [phone],
  );

  // Coming back from a redirect-based payment (?order_id=…).
  useEffect(() => {
    const id = params.get("order_id");
    if (!id || !user) return;
    router.replace("/pricing");
    verify(id);
  }, [params, user, router, verify]);

  async function pay() {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) return setPhase({ kind: "failed", message: "Enter a valid 10-digit mobile number." });
    setPhase({ kind: "starting" });
    try {
      const r = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, phone: digits }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "Couldn't start the payment.");
      await loadCashfree();
      const cf = window.Cashfree!({ mode: j.mode });
      setPhase({ kind: "idle" });
      const result = await cf.checkout({ paymentSessionId: j.paymentSessionId, redirectTarget: "_modal" });
      // Whatever the popup says, the server checks the real status with Cashfree.
      if (result?.error && /cancel|closed/i.test(result.error.message ?? "")) {
        const r2 = await fetch(`/api/payments/verify?orderId=${encodeURIComponent(j.orderId)}`).then((x) => x.json()).catch(() => null);
        if (r2?.state === "paid") return verify(j.orderId);
        return setPhase({ kind: "idle" });
      }
      await verify(j.orderId);
    } catch (e) {
      setPhase({ kind: "failed", message: e instanceof Error ? e.message : "Couldn't start the payment." });
    }
  }

  function upgrade() {
    if (!user) return router.push("/login?next=/pricing");
    setPhase({ kind: "confirm" });
  }

  const active = status?.isPremium;
  const chosen = PLANS[plan];
  const card = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay: 0.1 + i * 0.1 },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6">
      <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="text-center">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--color-c-lime)]">Plans</p>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">
          Land the job faster with <span className="text-[var(--color-c-lime)]">PRO+</span>
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-[14px] text-[var(--color-c-muted)]">Start free. Upgrade when you want the full AI toolkit without monthly caps.</p>
      </motion.div>

      {active && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.07] px-4 py-3 text-center text-[13px] text-[var(--color-c-lime)]"
        >
          <Crown className="h-4 w-4" />
          You&apos;re PRO+ until <b>{fmtDate(status!.premiumUntil)}</b> ({daysLeft(status!.premiumUntil)} days left). Buying again adds time on top.
        </motion.div>
      )}

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {/* Starter */}
        <motion.div {...card(0)} className="flex flex-col rounded-[26px] border border-white/[0.08] bg-[#131511] p-7">
          <p className="flex items-center gap-2 text-[20px] font-bold text-[var(--color-c-text)]">
            <Sparkles className="h-5 w-5 text-[var(--color-c-muted)]" /> Starter
          </p>
          <p className="mt-5 text-[44px] font-extrabold leading-none tracking-tight text-[var(--color-c-text)]">Free</p>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-c-muted)]">Every tool included, with a few free uses each month. No card required.</p>
          <ul className="mt-6 space-y-4 border-t border-white/[0.07] pt-6">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-[13px]">
                <f.icon className={`h-4 w-4 ${f.tint}`} />
                <span className="flex-1 text-[var(--color-c-text-4)]">{f.label}</span>
                <span className="text-[var(--color-c-dim)]">{f.free}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/resources"
            className="mt-auto flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] py-3.5 text-[14px] font-semibold text-[var(--color-c-text)] transition-colors hover:border-white/25 md:mt-12"
          >
            Continue Free
          </Link>
        </motion.div>

        {/* PRO+ */}
        <motion.div {...card(1)} className="relative flex flex-col rounded-[26px] border border-[var(--color-c-lime)]/20 bg-gradient-to-b from-[#1f3a1c] to-[#172b16] p-7 shadow-[0_40px_90px_-40px_rgba(163,230,53,0.35)]">
          <span className="absolute -top-3 right-7 rounded-full bg-[var(--color-c-lime)] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-black">Most popular</span>
          <p className="flex items-center gap-2 text-[20px] font-bold text-[var(--color-c-text)]">
            <Crown className="h-5 w-5 text-[var(--color-c-lime)]" /> PRO+
          </p>
          <div role="radiogroup" aria-label="Billing" className="mt-5 space-y-3">
            {(["quarterly", "monthly"] as const).map((k) => {
              const p = PLANS[k];
              const on = plan === k;
              return (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPlan(k)}
                  className={`relative flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    on ? "border-[var(--color-c-lime)]/70 bg-[var(--color-c-lime)]/[0.09]" : "border-white/10 bg-black/10 hover:border-white/25"
                  }`}
                >
                  {k === "quarterly" && QUARTERLY_SAVING > 0 && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--color-c-lime)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-black">
                      Best value · Save {QUARTERLY_SAVING}%
                    </span>
                  )}
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-[var(--color-c-lime)]" : "border-white/30"}`}>
                    <motion.span className="h-2.5 w-2.5 rounded-full bg-[var(--color-c-lime)]" animate={{ scale: on ? 1 : 0 }} transition={{ duration: 0.2 }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-bold text-[var(--color-c-text)]">{p.label}</span>
                    <span className="block text-[11px] text-[var(--color-c-muted)]">{p.billed}</span>
                  </span>
                  <span className="text-right">
                    <span className="text-[18px] font-extrabold text-[var(--color-c-lime)]">{inr(p.perMonth)}</span>
                    <span className="text-[11px] text-[var(--color-c-muted)]"> /mo</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">The full AI toolkit, unlimited, so a monthly cap never stops you mid-search.</p>
          <ul className="mt-5 space-y-4 border-t border-white/10 pt-5">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-center gap-3 text-[13px]">
                <f.icon className={`h-4 w-4 ${f.tint}`} />
                <span className="flex-1 text-[var(--color-c-text)]">{f.label}</span>
                <span className="font-semibold text-[var(--color-c-lime)]">{f.pro}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={upgrade}
            disabled={!hydrated || loading}
            className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[var(--color-c-lime)] py-3.5 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {active ? "Extend PRO+" : "Upgrade to PRO+"}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[var(--color-c-muted)]">
            <Lock className="h-3 w-3" /> Secure payment by Cashfree · UPI, cards &amp; net banking
          </p>
        </motion.div>
      </div>

      {/* checkout + result dialogs */}
      <AnimatePresence>
        {phase.kind !== "idle" && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => (phase.kind === "confirm" || phase.kind === "failed") && setPhase({ kind: "idle" })}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#131612] p-6 shadow-2xl"
            >
              {(phase.kind === "confirm" || phase.kind === "failed") && (
                <button type="button" aria-label="Close" onClick={() => setPhase({ kind: "idle" })} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] hover:bg-white/10 hover:text-[var(--color-c-text)]">
                  <X className="h-4 w-4" />
                </button>
              )}

              {(phase.kind === "confirm" || phase.kind === "starting") && (
                <>
                  <p className="flex items-center gap-2 text-[18px] font-bold text-[var(--color-c-text)]">
                    <Crown className="h-5 w-5 text-[var(--color-c-lime)]" /> PRO+ {chosen.label}
                  </p>
                  <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-[var(--color-c-muted)]">
                        {chosen.months === 1 ? "1 month" : `${chosen.months} months`} of PRO+
                      </span>
                      <span className="text-[22px] font-extrabold text-[var(--color-c-text)]">{inr(chosen.total)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-[var(--color-c-dim)]">
                      {active ? `Adds to your current PRO+ (until ${fmtDate(status!.premiumUntil)}).` : "Starts right after payment."} One-time payment, no auto-renewal.
                    </p>
                  </div>
                  <label className="mt-4 block">
                    <span className="mb-1.5 block text-[12px] font-semibold text-[var(--color-c-text-4)]">Mobile number (for the payment receipt)</span>
                    <span className="flex items-center rounded-xl border border-white/10 bg-black/20 focus-within:border-[var(--color-c-lime)]/50">
                      <span className="pl-3.5 text-[13px] text-[var(--color-c-dim)]">+91</span>
                      <input
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full bg-transparent px-2.5 py-3 text-[14px] text-[var(--color-c-text)] outline-none placeholder:text-[var(--color-c-dim)]"
                      />
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={pay}
                    disabled={phase.kind === "starting"}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-c-lime)] py-3.5 text-[14px] font-bold text-black disabled:opacity-70"
                  >
                    {phase.kind === "starting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {phase.kind === "starting" ? "Opening secure checkout…" : `Pay ${inr(chosen.total)}`}
                  </button>
                  <p className="mt-3 text-center text-[11px] text-[var(--color-c-dim)]">You&apos;ll choose UPI, card, net banking or wallet in Cashfree&apos;s secure window.</p>
                </>
              )}

              {phase.kind === "verifying" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-c-lime)]" />
                  <p className="mt-4 text-[15px] font-bold text-[var(--color-c-text)]">Confirming your payment…</p>
                  <p className="mt-1 text-[12px] text-[var(--color-c-muted)]">Checking with the bank. Don&apos;t close this page.</p>
                </div>
              )}

              {phase.kind === "success" && (
                <div className="flex flex-col items-center py-4 text-center">
                  <motion.span
                    initial={{ scale: 0.4, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-c-lime)] text-black shadow-[0_0_40px_rgba(163,230,53,0.5)]"
                  >
                    <Crown className="h-8 w-8" />
                  </motion.span>
                  <p className="mt-5 text-[20px] font-extrabold text-[var(--color-c-text)]">Welcome to PRO+</p>
                  <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">
                    Active until <b className="text-[var(--color-c-text)]">{fmtDate(phase.until)}</b>. A receipt is on its way from Cashfree.
                  </p>
                  <Link href="/resources" className="mt-6 w-full rounded-full bg-[var(--color-c-lime)] py-3 text-[14px] font-bold text-black">
                    Start using PRO+
                  </Link>
                </div>
              )}

              {phase.kind === "pending" && (
                <div className="flex flex-col items-center py-4 text-center">
                  <CheckCircle2 className="h-10 w-10 text-amber-300" />
                  <p className="mt-4 text-[16px] font-bold text-[var(--color-c-text)]">Payment is still processing</p>
                  <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">Banks sometimes take a few minutes. PRO+ switches on automatically once it&apos;s confirmed. You don&apos;t need to pay again.</p>
                  <button type="button" onClick={() => setPhase({ kind: "idle" })} className="mt-5 rounded-full border border-white/10 px-5 py-2.5 text-[13px] font-semibold text-[var(--color-c-text)]">
                    OK
                  </button>
                </div>
              )}

              {phase.kind === "failed" && (
                <div className="flex flex-col items-center py-4 text-center">
                  <XCircle className="h-10 w-10 text-red-400" />
                  <p className="mt-4 text-[16px] font-bold text-[var(--color-c-text)]">Payment not completed</p>
                  <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">{phase.message}</p>
                  <button type="button" onClick={() => setPhase({ kind: "confirm" })} className="mt-5 rounded-full bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
                    Try again
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
