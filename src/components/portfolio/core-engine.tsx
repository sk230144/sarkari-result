import {
  Settings,
  GitBranch,
  Users,
  Code2,
  RefreshCw,
  Linkedin,
  Mail,
  Github,
  Twitter,
  Globe,
  ArrowRight,
} from "lucide-react";

function Kicker({
  icon: Icon,
  label,
  tint,
  dot,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tint: string;
  dot: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
        <Icon className={`h-3.5 w-3.5 ${tint}`} />
      </div>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${dot}`}
      >
        <span className="blink h-1 w-1 rounded-full bg-current" />
        {label}
      </span>
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/** Deterministic contribution grid so server and client markup match. */
const CONTRIB = Array.from({ length: 105 }, (_, i) => (i * 37) % 10);

export function CoreEngine() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
            <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
            Core Engine
          </span>
          <h2 className="mt-4 text-[26px] font-bold tracking-tight text-[var(--color-c-text)]">
            Resume in. <span className="text-[var(--color-c-text-4)]">Portfolio out.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-[var(--color-c-muted)]">
            Three steps. Sixty seconds. Our language model extracts your story
            and deploys a professional portfolio instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* AI Engine */}
          <Card>
            <Kicker
              icon={Settings}
              label="AI Engine"
              tint="text-[var(--color-c-lime)]"
              dot="border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] text-[var(--color-c-lime)]"
            />
            <div className="mb-4 rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] p-3 font-mono text-[10px] leading-relaxed">
              {[
                ["name", '"Rahul Sharma"', "#a3e635"],
                ["role", '"Full Stack Developer"', "#a3e635"],
                ["skills", '["React", "TypeScript"...]', "#a3e635"],
                ["experience", "2 positions found", "#fbbf24"],
                ["projects", "4 repos extracted", "#fbbf24"],
                ["status", '"portfolio_ready"', "#a3e635"],
              ].map(([k, v, color], i) => (
                <p
                  key={k}
                  className="line-in"
                  style={{ animationDelay: `${i * 0.18}s` }}
                >
                  <span className="text-[var(--color-c-sky-2)]">&quot;{k}&quot;</span>:{" "}
                  <span style={{ color }}>{v}</span>
                </p>
              ))}
              <p
                className="line-in mt-2 flex items-center gap-1 text-[var(--color-c-lime)]"
                style={{ animationDelay: "1.15s" }}
              >
                <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
                Portfolio deployed successfully
              </p>
            </div>
            <h3 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
              Smart AI Extraction
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              We parse your PDF and map every skill, role, and project to your
              live portfolio, structured perfectly for recruiters.
            </p>
          </Card>

          {/* GitHub activity */}
          <Card>
            <Kicker
              icon={GitBranch}
              label="GitHub Activity"
              tint="text-[var(--color-c-blue)]"
              dot="border-[var(--color-c-blue-raised)] bg-[var(--color-c-blue-dim-2)] text-[var(--color-c-blue)]"
            />
            <div className="mb-4 rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] p-3">
              <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
                847 contributions this year
              </p>
              <div className="mb-3 grid grid-cols-[repeat(21,1fr)] gap-[2px]">
                {CONTRIB.map((v, i) => (
                  <span
                    key={i}
                    className="cell-pop aspect-square rounded-[1px]"
                    style={{
                      backgroundColor:
                        v > 7
                          ? "#a3e635"
                          : v > 5
                            ? "#65a30d"
                            : v > 3
                              ? "#3f6212"
                              : "#1a2417",
                      animationDelay: `${(i % 21) * 0.03 + Math.floor(i / 21) * 0.08}s`,
                    }}
                  />
                ))}
              </div>
              <div className="flex items-end justify-between">
                {[
                  ["23", "Repos"],
                  ["847", "Commits"],
                  ["6", "Languages"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-[13px] font-bold text-[var(--color-c-text)]">{n}</p>
                    <p className="text-[8px] uppercase tracking-wider text-[var(--color-c-dim)]">
                      {l}
                    </p>
                  </div>
                ))}
                <span className="font-mono text-[9px] text-[var(--color-c-lime)]">
                  auto-synced
                </span>
              </div>
            </div>
            <h3 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
              GitHub Activity
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              Your GitHub contribution graph and repo stats are pulled in
              automatically and displayed on your portfolio.
            </p>
          </Card>

          {/* Community */}
          <Card>
            <Kicker
              icon={Users}
              label="Community"
              tint="text-[var(--color-c-amber)]"
              dot="border-[var(--color-c-amber-border-2)] bg-[var(--color-c-amber-dim-4)] text-[var(--color-c-amber)]"
            />
            <div className="mb-4 flex h-[176px] items-center justify-center rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)]">
              <div className="relative h-32 w-32">
                <span
                  aria-hidden
                  className="ripple absolute inset-0 rounded-full border border-[var(--color-c-lime)]/30"
                />
                <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
                <div className="absolute inset-5 rounded-full border border-dashed border-white/[0.07]" />

                {/* Ring spins; each avatar counter-rotates to stay upright */}
                <div className="orbit absolute inset-0">
                  {[
                    { cls: "left-1/2 top-0 -translate-x-1/2", bg: "bg-[var(--color-c-red)]" },
                    { cls: "right-0 top-1/3", bg: "bg-[var(--color-c-blue)]" },
                    { cls: "bottom-2 right-4", bg: "bg-[var(--color-c-amber)]" },
                    { cls: "bottom-2 left-4", bg: "bg-[var(--color-c-violet)]" },
                    { cls: "left-0 top-1/3", bg: "bg-[var(--color-c-emerald-2)]" },
                  ].map(({ cls, bg }, i) => (
                    <span
                      key={i}
                      className={`absolute h-7 w-7 rounded-full border-2 border-[var(--color-c-canvas)] ${cls}`}
                    >
                      <span
                        className={`orbit-fix block h-full w-full rounded-full ${bg}`}
                      />
                    </span>
                  ))}
                </div>

                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="pulse-soft flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--color-c-canvas)] bg-white text-[11px] font-bold text-black">
                    C
                  </span>
                </span>
              </div>
            </div>
            <h3 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
              Loved by Top Engineers
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              Join developers from top tech companies who host their portfolios
              with us.
            </p>
          </Card>

          {/* Share */}
          <Card>
            <Kicker
              icon={Code2}
              label="Share"
              tint="text-[var(--color-c-violet)]"
              dot="border-[var(--color-c-violet-border)] bg-[var(--color-c-violet-dim)] text-[var(--color-c-violet)]"
            />
            <div className="mb-4 flex h-[176px] items-center justify-center rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)]">
              <div className="relative h-32 w-40">
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="pulse-soft flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-c-indigo)]">
                    <Globe className="h-5 w-5 text-[var(--color-c-text)]" />
                  </span>
                </span>
                {[
                  { icon: Linkedin, label: "LinkedIn", bg: "bg-[#0a66c2]", cls: "left-0 top-0" },
                  { icon: Mail, label: "Email", bg: "bg-[var(--color-c-red-2)]", cls: "right-0 top-0" },
                  { icon: Github, label: "GitHub", bg: "bg-[var(--color-c-surface-cool-2)]", cls: "bottom-0 left-2" },
                  { icon: Twitter, label: "Twitter", bg: "bg-[#1d9bf0]", cls: "bottom-0 right-2" },
                ].map(({ icon: Icon, label, bg, cls }, i) => (
                  <div key={label} className={`absolute flex flex-col items-center gap-1 ${cls}`}>
                    <span
                      className={`pulse-soft flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
                      style={{ animationDelay: `${i * 0.35}s` }}
                    >
                      <Icon className="h-4 w-4 text-[var(--color-c-text)]" />
                    </span>
                    <span className="text-[8px] text-[var(--color-c-dim)]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <h3 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
              One Link for Everything
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              Drop it in job applications, LinkedIn, cold emails. One URL that
              works perfectly everywhere.
            </p>
          </Card>

          {/* Live sync — spans two columns */}
          <Card className="md:col-span-2">
            <Kicker
              icon={RefreshCw}
              label="Live Sync"
              tint="text-[var(--color-c-emerald-2)]"
              dot="border-[var(--color-c-teal-border)] bg-[var(--color-c-teal-dim)] text-[var(--color-c-emerald-2)]"
            />
            <div className="mb-4 flex flex-col items-stretch gap-3 rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] p-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-lg border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-1b)] p-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
                  Profile Editor
                </p>
                {[
                  ["Role", "Senior Dev", true],
                  ["Skills", "+ GraphQL added", false],
                  ["Projects", "3 synced", false],
                ].map(([label, value, active]) => (
                  <div key={label as string} className="mb-1.5 flex items-center gap-2">
                    <span className="w-14 shrink-0 text-[9px] text-[var(--color-c-dim)]">
                      {label as string}
                    </span>
                    <span
                      className={`flex-1 rounded border px-2 py-1 font-mono text-[9px] ${
                        active
                          ? "border-[var(--color-c-lime)]/50 bg-[var(--color-c-surface-5c)] text-[var(--color-c-lime)]"
                          : "border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] text-[var(--color-c-text-dim)]"
                      }`}
                    >
                      {value as string}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-1 px-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-c-lime)]">
                  <ArrowRight className="nudge-x h-3.5 w-3.5 text-black" />
                </span>
                <span className="font-mono text-[8px] uppercase tracking-wider text-[var(--color-c-dim)]">
                  Sync
                </span>
              </div>

              <div className="flex-1 rounded-lg border border-[var(--color-c-teal-border)] bg-[var(--color-c-surface-02)] p-3">
                <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-emerald-2)]">
                  <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-emerald-2)]" />
                  Live Portfolio
                </p>
                <p className="mb-2 text-[11px] font-bold text-[var(--color-c-text)]">
                  Senior Dev · TechCorp
                </p>
                <div className="mb-2 flex flex-wrap gap-1">
                  {["React", "GraphQL", "Node"].map((s) => (
                    <span
                      key={s}
                      className="rounded bg-white/[0.07] px-1.5 py-0.5 text-[9px] text-[var(--color-c-text-4)]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--color-c-dim)]">3 projects synced</p>
              </div>
            </div>
            <h3 className="mb-1 text-[13px] font-bold text-[var(--color-c-text)]">
              Real-time Sync
            </h3>
            <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
              Update your profile and your live portfolio syncs instantly. No
              re-uploads. No deployments. No friction.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
