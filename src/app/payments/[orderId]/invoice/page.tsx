import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdminEmail } from "@/lib/admin";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import { PLANS, inr, isPlan } from "@/lib/premium";
import { PrintButton } from "@/components/premium/print-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice — Job Alert 24", robots: { index: false } };

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—");

/** Printable invoice for one paid order. Visible to the buyer (and admins) only. */
export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  if (!/^ja24_[a-z0-9]+_[0-9a-f]{8}$/.test(orderId)) notFound();
  const user = await getSessionUser();
  if (!user) notFound();

  const db = serviceDb();
  const { data: p } = await db.from("payments").select("*").eq("order_id", orderId).maybeSingle();
  if (!p || p.status !== "paid" || (p.user_id !== user.id && !isAdminEmail(user.email))) notFound();
  const { data: prof } = await db.from("profiles").select("full_name, email").eq("id", p.user_id).maybeSingle();

  const planKey: unknown = p.plan;
  const plan = isPlan(planKey) ? PLANS[planKey] : null;
  const amount = Number(p.amount);
  const number = `JA24-${String(orderId).split("_").slice(1).join("-").toUpperCase()}`;
  const buyer = (prof?.full_name as string) || (prof?.email as string) || "Customer";

  return (
    <main className="min-h-screen bg-[#eef0ea] px-4 py-8 text-slate-800 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-2xl items-center justify-between print:hidden">
        <Link href="/payments" className="text-[13px] font-semibold text-slate-600 hover:text-slate-900">
          ← Back to payments
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:p-10 print:shadow-none sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <p className="text-[22px] font-extrabold tracking-tight text-slate-900">
              jobalert<span className="text-lime-600">24</span>
            </p>
            <p className="mt-1 text-[12px] text-slate-500">jobalerts24.com</p>
          </div>
          <div className="text-right">
            <p className="text-[20px] font-bold text-slate-900">Invoice</p>
            <p className="mt-1 font-mono text-[12px] text-slate-500">{number}</p>
            <span className="mt-2 inline-block rounded-full bg-lime-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-lime-700">Paid</span>
          </div>
        </header>

        <section className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Billed to</p>
            <p className="mt-1.5 text-[14px] font-semibold text-slate-900">{buyer}</p>
            {prof?.email && <p className="text-[13px] text-slate-600">{prof.email as string}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Details</p>
            <p className="mt-1.5 text-[13px] text-slate-600">
              Paid on <b className="text-slate-900">{date(p.paid_at as string)}</b>
            </p>
            {p.payment_method && <p className="text-[13px] text-slate-600">Method: {String(p.payment_method).replace(/_/g, " ").toUpperCase()}</p>}
            <p className="font-mono text-[11px] text-slate-500">Order {orderId}</p>
            {p.cf_payment_id && <p className="font-mono text-[11px] text-slate-500">Payment ID {p.cf_payment_id as string}</p>}
          </div>
        </section>

        <table className="mt-6 w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <th className="pb-2">Description</th>
              <th className="pb-2">Period</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3.5 font-semibold text-slate-900">PRO+ membership · {plan ? plan.label : String(p.plan)}</td>
              <td className="py-3.5 text-slate-600">
                {date(p.period_start as string)} – {date(p.period_end as string)}
              </td>
              <td className="py-3.5 text-right font-semibold text-slate-900">{inr(amount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1.5 text-[13px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{inr(amount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-[15px] font-bold text-slate-900">
              <span>Total paid</span>
              <span>{inr(amount)}</span>
            </div>
          </div>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
          Payment processed securely by Cashfree Payments. This is a computer-generated invoice and needs no signature. For help, contact
          support through jobalerts24.com.
        </footer>
      </article>
    </main>
  );
}
