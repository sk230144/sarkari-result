import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Users,
  Eye,
  Clock,
  Activity,
  FileText,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isAdmin, getAdminData, adminDb } from "@/lib/admin";
import { AdminFeedback, type FeedbackItem } from "@/components/admin/admin-feedback";
import { USD_TO_INR } from "@/lib/ai-pricing";

/** "₹1.24" with the USD figure alongside; tiny amounts keep enough decimals to read. */
function inr(usd: number): string {
  const rs = usd * USD_TO_INR;
  if (!usd) return "₹0";
  return `₹${rs < 1 ? rs.toFixed(3) : rs.toFixed(2)}`;
}

function usdText(usd: number): string {
  return `$${usd < 0.01 ? usd.toFixed(5) : usd.toFixed(3)}`;
}

/** 950, 12.4k, 3.1M */
function tokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const KIND_LABELS: Record<string, string> = {
  cover_letter: "Cover letter · all 3 styles",
  cover_letter_operator: "Cover letter · regenerate Operator",
  cover_letter_believer: "Cover letter · regenerate Believer",
  cover_letter_short: "Cover letter · regenerate Quick Apply",
  cover_letter_edit_shorter: "Cover letter · edit: shorter",
  cover_letter_edit_formal: "Cover letter · edit: more formal",
  cover_letter_edit_confident: "Cover letter · edit: more confident",
  cover_letter_edit_warmer: "Cover letter · edit: warmer",
  analysis_cv: "Resume analysis · CV profile (once per resume)",
  analysis_jd: "Resume analysis · JD profile (once per job, shared)",
  analysis_judgment: "Resume analysis · judgment",
  analysis_risk: "Resume analysis · AI risk (once per role)",
};

export const metadata: Metadata = {
  title: "Admin — Job Alert 24",
  robots: { index: false, follow: false },
};

// Always read live data; a cached admin dashboard is a misleading one.
export const dynamic = "force-dynamic";

/** "2h 14m 30s", "3m 20s", "45s", "—" — always down to the second. */
function duration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h) return `${h}h ${m}m ${s}s`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

/** "3 hours ago", "2 days ago", "Never" */
function ago(iso: string | null): string {
  if (!iso) return "Never";
  const ms = Date.now() - Date.parse(iso);
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  jobs: "Jobs",
  "dsa-sheets": "DSA Sheets",
  "dsa-patterns": "DSA Patterns",
  "faang-questions": "FAANG Questions",
  "system-design": "System Design",
  "task-board": "Task Board",
  resources: "Resources",
  "portfolio-builder": "Portfolio Builder",
  "cover-letter": "Cover Letter",
  "resume-analysis": "Resume Analysis",
  "ai-copilot": "AI Copilot",
  "mock-interview": "Mock Interview",
  onboarding: "Onboarding",
  u: "Public Profiles",
  profile: "Profile",
  login: "Login",
  signup: "Signup",
  admin: "Admin",
};

export default async function AdminPage() {
  // Server-side gate. notFound() rather than a redirect, so the page's
  // existence is not disclosed to anyone who is not an admin.
  if (!(await isAdmin())) notFound();

  const [{ users, sections, totals, ai }, feedback] = await Promise.all([
    getAdminData(),
    adminDb()
      .from("feedback")
      .select("id, name, email, category, rating, message, page, resolved_at, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);
  const maxViews = sections[0]?.views ?? 1;
  const aiUsers = users.filter((u) => u.ai.calls > 0).sort((a, b) => b.ai.costUsd - a.ai.costUsd);

  return (
    <DashboardShell canvas="obsidian" sidebar={false} backTo="/">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-6 lg:px-8">
        <header className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
            <Activity className="h-3 w-3" />
            Admin
          </span>
          <h1 className="text-[26px] font-bold leading-9 tracking-tight text-[var(--color-c-text)]">
            Platform activity
          </h1>
        </header>

        {/* Headline numbers */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={<Users className="h-4 w-4" />} label="Total users" value={totals.users} />
          <Stat
            icon={<Activity className="h-4 w-4" />}
            label="Active last 7 days"
            value={totals.signedInLast7d}
          />
          <Stat icon={<Eye className="h-4 w-4" />} label="Page views" value={totals.views} />
          <Stat
            icon={<Clock className="h-4 w-4" />}
            label="Tracked hours"
            value={totals.trackedHours}
          />
        </section>

        {/* Section popularity */}
        <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-c-text)]">
            <BarChart3 className="h-4 w-4 text-[var(--color-c-lime)]" />
            Most used sections
          </h2>

          {sections.length === 0 ? (
            <EmptyNote>
              No page views recorded yet. Tracking starts from the moment this
              is deployed, so this fills as people browse.
            </EmptyNote>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5">
              {sections.map((s) => (
                <div key={s.section} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-[12px] font-medium text-[var(--color-c-text-4)]">
                    {SECTION_LABELS[s.section] ?? s.section}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-c-track)]">
                    <span
                      className="block h-full rounded-full bg-[var(--color-c-lime)]"
                      style={{ width: `${Math.max(2, (s.views / maxViews) * 100)}%` }}
                    />
                  </span>
                  <span className="w-16 shrink-0 text-right text-[11px] font-semibold text-[var(--color-c-text)]">
                    {s.views.toLocaleString("en-IN")}
                  </span>
                  <span className="hidden w-20 shrink-0 text-right text-[11px] text-[var(--color-c-dim)] sm:block">
                    {duration(s.totalSeconds)}
                  </span>
                  <span className="hidden w-16 shrink-0 text-right text-[11px] text-[var(--color-c-dim)] md:block">
                    {s.uniqueUsers} {s.uniqueUsers === 1 ? "user" : "users"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <AdminFeedback initial={(feedback.data ?? []) as FeedbackItem[]} ready={!feedback.error} />

        {/* AI usage and cost */}
        <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-c-text)]">
            <Sparkles className="h-4 w-4 text-[var(--color-c-lime)]" />
            AI usage &amp; cost
            <span className="text-[11px] font-normal text-[var(--color-c-dim)]">
              estimated from logged tokens at ₹{USD_TO_INR}/$
            </span>
          </h2>

          {!ai.ready ? (
            <EmptyNote>
              The ai_usage table does not exist yet. Run
              supabase/migrations/0008_cover_letters.sql in the Supabase SQL
              editor and this section will start filling.
            </EmptyNote>
          ) : ai.totals.calls === 0 ? (
            <EmptyNote>No AI calls yet. Every cover letter generation and edit will show up here.</EmptyNote>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Total cost"
                  value={inr(ai.totals.costUsd)}
                  sub={usdText(ai.totals.costUsd)}
                />
                <Stat
                  icon={<Clock className="h-4 w-4" />}
                  label="Last 24 hours"
                  value={inr(ai.last24h.costUsd)}
                  sub={`${ai.last24h.calls} calls`}
                />
                <Stat
                  icon={<Activity className="h-4 w-4" />}
                  label="AI calls"
                  value={ai.totals.calls}
                  sub={`avg ${inr(ai.totals.costUsd / ai.totals.calls)} each`}
                />
                <Stat
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Tokens"
                  value={tokens(ai.totals.input + ai.totals.output + ai.totals.thinking)}
                  sub={`${tokens(ai.totals.input)} in · ${tokens(ai.totals.output + ai.totals.thinking)} out`}
                />
              </div>

              {/* By feature */}
              <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
                By feature
              </h3>
              <div className="mt-2 flex flex-col gap-2">
                {ai.byKind.map((k) => (
                  <div key={k.kind} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px]">
                    <span className="min-w-0 flex-1 truncate font-medium text-[var(--color-c-text-4)]">
                      {KIND_LABELS[k.kind] ?? k.kind}
                    </span>
                    <span className="text-[var(--color-c-dim)]">{k.calls} calls</span>
                    <span className="text-[var(--color-c-dim)]">
                      {k.users} {k.users === 1 ? "user" : "users"}
                    </span>
                    <span className="text-[var(--color-c-dim)]">
                      {tokens(k.input)} in · {tokens(k.output + k.thinking)} out
                    </span>
                    <span className="w-16 text-right font-semibold text-[var(--color-c-lime)]">
                      {inr(k.costUsd)}
                    </span>
                  </div>
                ))}
              </div>

              {/* By user */}
              <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
                By user · highest cost first
              </h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[var(--color-c-border)] text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
                      <th className="py-2 pr-3 font-semibold">User</th>
                      <th className="py-2 pr-3 text-right font-semibold">Calls</th>
                      <th className="py-2 pr-3 text-right font-semibold">Input</th>
                      <th className="py-2 pr-3 text-right font-semibold">Output</th>
                      <th className="py-2 pr-3 text-right font-semibold">Thinking</th>
                      <th className="py-2 pr-3 text-right font-semibold">Cost</th>
                      <th className="py-2 pr-3 text-right font-semibold">Per call</th>
                      <th className="py-2 text-right font-semibold">Last call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiUsers.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--color-c-border)] last:border-0">
                        <td className="max-w-[220px] py-2.5 pr-3">
                          <p className="truncate font-semibold text-[var(--color-c-text)]">
                            {u.fullName ?? u.email.split("@")[0]}
                          </p>
                          <p className="truncate text-[10px] text-[var(--color-c-dim)]">{u.email}</p>
                        </td>
                        <td className="py-2.5 pr-3 text-right text-[var(--color-c-text-4)]">{u.ai.calls}</td>
                        <td className="py-2.5 pr-3 text-right text-[var(--color-c-text-4)]">{tokens(u.ai.input)}</td>
                        <td className="py-2.5 pr-3 text-right text-[var(--color-c-text-4)]">{tokens(u.ai.output)}</td>
                        <td className="py-2.5 pr-3 text-right text-[var(--color-c-text-4)]">{tokens(u.ai.thinking)}</td>
                        <td className="py-2.5 pr-3 text-right">
                          <span className="font-bold text-[var(--color-c-lime)]">{inr(u.ai.costUsd)}</span>
                          <span className="block text-[10px] text-[var(--color-c-dim)]">{usdText(u.ai.costUsd)}</span>
                        </td>
                        <td className="py-2.5 pr-3 text-right text-[var(--color-c-text-4)]">
                          {inr(u.ai.costUsd / u.ai.calls)}
                        </td>
                        <td className="py-2.5 text-right text-[var(--color-c-dim)]">{ago(u.ai.lastCallAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Users */}
        <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-[var(--color-c-text)]">
            <Users className="h-4 w-4 text-[var(--color-c-lime)]" />
            Users
            <span className="text-[11px] font-normal text-[var(--color-c-dim)]">
              most recently active first
            </span>
          </h2>

          <div className="mt-4 flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] p-4"
              >
                {/* Identity and headline numbers */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-c-lime)] text-[13px] font-bold text-black">
                      {(u.fullName ?? u.email).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[var(--color-c-text)]">
                        {u.fullName ?? u.email.split("@")[0]}
                        {u.hasResume && (
                          <span className="ml-2 inline-flex items-center gap-1 align-middle text-[10px] font-normal text-[var(--color-c-lime)]">
                            <FileText className="h-3 w-3" />
                            resume
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-[var(--color-c-dim)]">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px]">
                    <Field label="Total time" value={duration(u.totalSeconds)} strong />
                    <Field label="Page views" value={u.pageViews ? String(u.pageViews) : "—"} />
                    <Field label="Last active" value={ago(u.lastSeenAt ?? u.lastSignInAt)} />
                    <Field label="Last login" value={ago(u.lastSignInAt)} />
                    <Field label="Joined" value={ago(u.createdAt)} />
                    {u.ai.calls > 0 && (
                      <Field label="AI cost" value={`${inr(u.ai.costUsd)} · ${u.ai.calls} calls`} strong />
                    )}
                  </div>
                </div>

                {/* What this person actually uses */}
                {u.sections.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--color-c-border)] pt-3">
                    {u.sections.map((sec) => (
                      <span
                        key={sec.section}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] px-2.5 py-1 text-[11px]"
                      >
                        <span className="font-semibold text-[var(--color-c-text-4)]">
                          {SECTION_LABELS[sec.section] ?? sec.section}
                        </span>
                        <span className="text-[var(--color-c-dim)]">
                          {sec.views}&nbsp;{sec.views === 1 ? "visit" : "visits"}
                        </span>
                        {sec.seconds > 0 && (
                          <span className="font-medium text-[var(--color-c-lime)]">
                            {duration(sec.seconds)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 border-t border-[var(--color-c-border)] pt-3 text-[11px] text-[var(--color-c-dim)]">
                    No page views recorded for this account yet.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <p className="text-[11px] leading-relaxed text-[var(--color-c-dim)]">
          Last login comes from Supabase auth and is accurate from the day each
          account was created. Time on platform and section usage are measured
          only while a tab is actually visible — a page left open in a
          background tab does not count — and only from when analytics was
          added, so activity before that was never recorded.
        </p>
      </div>
    </DashboardShell>
  );
}

function Field({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <span className="flex flex-col">
      <span className="text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
        {label}
      </span>
      <span
        className={
          strong
            ? "text-[12px] font-bold text-[var(--color-c-lime)]"
            : "text-[12px] text-[var(--color-c-text-4)]"
        }
      >
        {value}
      </span>
    </span>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-4">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
        <span className="text-[var(--color-c-lime)]">{icon}</span>
        {label}
      </span>
      <p className="mt-1.5 text-[24px] font-bold leading-none text-[var(--color-c-text)]">
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-[var(--color-c-dim)]">{sub}</p>}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-lg border border-[var(--color-c-border)] bg-[var(--color-c-surface-2)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--color-c-muted)]">
      {children}
    </p>
  );
}
