import { Crown, CreditCard } from "lucide-react";

export type AdminMember = {
  id: string;
  name: string | null;
  email: string | null;
  plan: string | null;
  since: string | null;
  until: string;
  /** AI Interview Assistant add-on end, if ever bought. */
  appUntil: string | null;
};

export type AdminPayment = {
  order_id: string;
  plan: string;
  amount: number;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  period_end: string | null;
  includes_app: boolean;
  email: string | null;
};

const STATUS: Record<string, string> = {
  paid: "bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]",
  created: "bg-white/10 text-[var(--color-c-muted)]",
  failed: "bg-red-500/15 text-red-300",
  expired: "bg-amber-400/15 text-amber-300",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** PRO+ revenue and recent orders. */
export function AdminPayments({ payments, members, ready }: { payments: AdminPayment[]; members: AdminMember[]; ready: boolean }) {
  // eslint-disable-next-line react-hooks/purity -- server-rendered once per request
  const now = Date.now();
  const active = members.filter((m) => new Date(m.until).getTime() > now);
  const activeMembers = active.length;
  const paid = payments.filter((p) => p.status === "paid");
  const revenue = paid.reduce((n, p) => n + Number(p.amount), 0);
  const month = new Date();
  month.setDate(1);
  month.setHours(0, 0, 0, 0);
  const thisMonth = paid.filter((p) => p.paid_at && new Date(p.paid_at) >= month).reduce((n, p) => n + Number(p.amount), 0);

  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
        <CreditCard className="h-4 w-4 text-[var(--color-c-lime)]" /> PRO+ payments
      </h2>
      {!ready ? (
        <p className="text-[12px] text-amber-300">Run migration 0022_premium.sql to enable payments.</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Revenue (all time)", inr(revenue)],
              ["This month", inr(thisMonth)],
              ["Paid orders", String(paid.length)],
              ["Active PRO+ members", String(activeMembers)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <p className="text-[10px] text-[var(--color-c-dim)]">{label}</p>
                <p className="mt-1 text-[18px] font-bold text-[var(--color-c-text)]">{value}</p>
              </div>
            ))}
          </div>
          {/* members */}
          <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-[var(--color-c-text)]">
            <Crown className="h-3.5 w-3.5 text-[var(--color-c-lime)]" /> PRO+ members
            <span className="font-normal text-[var(--color-c-dim)]">
              ({activeMembers} active{members.length > activeMembers ? `, ${members.length - activeMembers} expired` : ""})
            </span>
          </p>
          {members.length === 0 ? (
            <p className="mb-6 text-[12px] text-[var(--color-c-dim)]">No one has bought PRO+ yet.</p>
          ) : (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12px]">
                <thead className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
                  <tr>
                    <th className="py-2 pr-3">Member</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Member since</th>
                    <th className="py-2 pr-3">PRO+ until</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const left = Math.ceil((new Date(m.until).getTime() - now) / 86_400_000);
                    const on = left > 0;
                    return (
                      <tr key={m.id} className="border-t border-[var(--color-c-border)] text-[var(--color-c-text-4)]">
                        <td className="max-w-[240px] py-2 pr-3">
                          <p className="truncate font-semibold text-[var(--color-c-text)]">{m.name || "—"}</p>
                          <p className="truncate text-[11px] text-[var(--color-c-dim)]">{m.email ?? "—"}</p>
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap capitalize">
                          {m.plan ?? "—"}
                          {m.appUntil && new Date(m.appUntil).getTime() > now && (
                            <span className="ml-1.5 rounded bg-[var(--color-c-lime)]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-lime)]">App</span>
                          )}
                        </td>
                        <td className="py-2 pr-3 whitespace-nowrap">{m.since ? new Date(m.since).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{new Date(m.until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                        <td className="py-2 whitespace-nowrap">
                          {on ? (
                            <span className="rounded bg-[var(--color-c-lime)]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-lime)]">
                              Active · {left} day{left === 1 ? "" : "s"} left
                            </span>
                          ) : (
                            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-muted)]">Expired</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mb-2 text-[13px] font-bold text-[var(--color-c-text)]">Recent orders</p>
          {payments.length === 0 ? (
            <p className="text-[12px] text-[var(--color-c-dim)]">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[12px]">
                <thead className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
                  <tr>
                    <th className="py-2 pr-3">When</th>
                    <th className="py-2 pr-3">User</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3 text-right">Amount</th>
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">PRO+ until</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 50).map((p) => (
                    <tr key={p.order_id} className="border-t border-[var(--color-c-border)] text-[var(--color-c-text-4)]">
                      <td className="py-2 pr-3 whitespace-nowrap">{new Date(p.paid_at ?? p.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="max-w-[200px] truncate py-2 pr-3">{p.email ?? "—"}</td>
                      <td className="py-2 pr-3 whitespace-nowrap capitalize">
                        {p.plan}
                        {p.includes_app && <span className="ml-1.5 rounded bg-[var(--color-c-lime)]/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-[var(--color-c-lime)]">+ App</span>}
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold text-[var(--color-c-text)]">{inr(Number(p.amount))}</td>
                      <td className="py-2 pr-3 uppercase">{p.payment_method?.replace(/_/g, " ") ?? "—"}</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${STATUS[p.status] ?? ""}`}>{p.status}</span>
                      </td>
                      <td className="py-2 whitespace-nowrap">{p.period_end ? new Date(p.period_end).toLocaleDateString("en-IN") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
