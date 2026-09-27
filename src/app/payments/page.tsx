import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { Crown, FileText, LogIn, Receipt } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { getPremiumStatus } from "@/lib/payments/server";
import { PLANS, daysLeft, inr, isPlan } from "@/lib/premium";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata("/payments", { title: "Payments & invoices — Job Alert 24", robots: { index: false } });

const STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paid", cls: "bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]" },
  created: { label: "Not completed", cls: "bg-white/10 text-[var(--color-c-muted)]" },
  failed: { label: "Failed", cls: "bg-red-500/15 text-red-300" },
  expired: { label: "Expired", cls: "bg-amber-400/15 text-amber-300" },
};

/** Unfinished checkouts are only shown for a day; paid ones always. */
const recentCutoff = () => new Date(Date.now() - 86_400_000).toISOString();

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default async function PaymentsPage() {
  const user = await getSessionUser();
  if (!user) {
    return (
      <DashboardShell canvas="obsidian">
        <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
          <LogIn className="h-7 w-7 text-[var(--color-c-lime)]" />
          <p className="text-[16px] font-bold text-[var(--color-c-text)]">Sign in to see your payments</p>
          <Link href="/login?next=/payments" className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black">
            Sign in
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const db = serviceDb();
  const [{ data: rows, error }, premium] = await Promise.all([
    db
      .from("payments")
      .select("order_id, plan, amount, status, payment_method, paid_at, created_at, period_start, period_end")
      .eq("user_id", user.id)
      .or(`status.eq.paid,created_at.gte.${recentCutoff()}`)
      .order("created_at", { ascending: false })
      .limit(200),
    getPremiumStatus(db, user.id),
  ]);
  const payments = rows ?? [];
  const spent = payments.filter((p) => p.status === "paid").reduce((n, p) => n + Number(p.amount), 0);

  return (
    <DashboardShell canvas="obsidian">
      <div className="mx-auto w-full max-w-4xl px-4 pb-20 pt-4 sm:px-6">
        <h1 className="flex items-center gap-2.5 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.03em] text-[var(--color-c-text)]">
          <Receipt className="h-6 w-6 text-[var(--color-c-lime)]" /> Payments &amp; invoices
        </h1>
        <p className="mt-1 text-[13px] text-[var(--color-c-muted)]">Every PRO+ purchase on your account, with a downloadable invoice for each payment.</p>

        {/* membership summary */}
        <div
          className={`mt-6 flex flex-wrap items-center gap-4 rounded-2xl border p-5 ${
            premium.isPremium ? "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/[0.06]" : "border-white/[0.08] bg-[#141713]"
          }`}
        >
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${premium.isPremium ? "bg-[var(--color-c-lime)] text-black" : "bg-white/[0.06] text-[var(--color-c-muted)]"}`}>
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-[var(--color-c-text)]">{premium.isPremium ? "PRO+ is active" : premium.premiumUntil ? "PRO+ has ended" : "You're on the free plan"}</p>
            <p className="text-[12px] text-[var(--color-c-muted)]">
              {premium.isPremium
                ? `Until ${date(premium.premiumUntil)} · ${daysLeft(premium.premiumUntil)} days left${premium.plan ? ` · ${PLANS[premium.plan].label} plan` : ""}`
                : premium.premiumUntil
                  ? `Ended on ${date(premium.premiumUntil)}`
                  : "Upgrade for the full AI toolkit, without monthly caps."}
            </p>
          </div>
          <Link href="/pricing" className="rounded-xl bg-[var(--color-c-lime)] px-4 py-2 text-[13px] font-bold text-black">
            {premium.isPremium ? "Extend PRO+" : premium.premiumUntil ? "Renew PRO+" : "Upgrade to PRO+"}
          </Link>
        </div>

        {error ? (
          <p className="mt-6 text-[13px] text-amber-300">Payments aren&apos;t available yet.</p>
        ) : payments.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
            <FileText className="h-7 w-7 text-[var(--color-c-dim)]" />
            <p className="text-[15px] font-bold text-[var(--color-c-text)]">No payments yet</p>
            <p className="text-[13px] text-[var(--color-c-muted)]">Your PRO+ purchases and invoices will appear here.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between text-[12px] text-[var(--color-c-muted)]">
              <span>
                {payments.length} payment{payments.length === 1 ? "" : "s"}
              </span>
              <span>
                Total paid: <b className="text-[var(--color-c-text)]">{inr(spent)}</b>
              </span>
            </div>
            <ul className="mt-2.5 space-y-2.5">
              {payments.map((p) => {
                const st = STATUS[p.status as string] ?? STATUS.created;
                const plan = isPlan(p.plan) ? PLANS[p.plan].label : String(p.plan);
                return (
                  <li key={p.order_id as string} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#141713] px-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-bold text-[var(--color-c-text)]">PRO+ {plan}</p>
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-[var(--color-c-dim)]">
                        {date((p.paid_at as string) ?? (p.created_at as string))}
                        {p.payment_method && ` · ${String(p.payment_method).replace(/_/g, " ").toUpperCase()}`}
                        {p.status === "paid" && p.period_end && ` · PRO+ ${date(p.period_start as string)} – ${date(p.period_end as string)}`}
                        {` · ${p.order_id}`}
                      </p>
                    </div>
                    <p className="text-[16px] font-extrabold text-[var(--color-c-text)]">{inr(Number(p.amount))}</p>
                    {p.status === "paid" ? (
                      <Link
                        href={`/payments/${p.order_id}/invoice`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-lime)]/40 px-3 py-1.5 text-[12px] font-semibold text-[var(--color-c-lime)] hover:bg-[var(--color-c-lime)]/10"
                      >
                        <FileText className="h-3.5 w-3.5" /> Invoice
                      </Link>
                    ) : (
                      <span className="w-[86px]" />
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
