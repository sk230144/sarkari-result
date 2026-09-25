import { FileText, Monitor, Target, ArrowUpRight } from "lucide-react";
import { BuildCta } from "./build-cta";

const TOOLS = [
  {
    icon: FileText,
    name: "Cover Letter",
    body: "Generate a personalized, ATS-friendly cover letter for any job in seconds.",
    href: "/cover-letter",
    tint: "text-[var(--color-c-violet)]",
    chip: "bg-[var(--color-c-violet)]/15",
    wash: "from-[var(--color-c-violet)]/[0.10]",
    link: "text-[var(--color-c-violet)]",
  },
  {
    icon: Monitor,
    name: "Mock Interview",
    body: "Practice technical & HR rounds with AI-generated, role-specific questions.",
    href: "#mock-interview",
    tint: "text-[var(--color-c-blue)]",
    chip: "bg-[var(--color-c-blue)]/15",
    wash: "from-[var(--color-c-blue)]/[0.10]",
    link: "text-[var(--color-c-blue)]",
  },
  {
    icon: Target,
    name: "Resume Analysis",
    body: "Get your ATS score, missing keywords, and a fix-it checklist instantly.",
    href: "/resume-analysis",
    tint: "text-[var(--color-c-amber)]",
    chip: "bg-[var(--color-c-amber)]/15",
    wash: "from-[var(--color-c-amber)]/[0.10]",
    link: "text-[var(--color-c-amber)]",
  },
];

export function MoreTools() {
  return (
    <>
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-c-lime)]">
            [ Complete your toolkit ]
          </p>
          <h2 className="mt-2 text-[22px] font-bold tracking-tight text-[var(--color-c-text)]">
            Discover more tools
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TOOLS.map((t) => (
              <a
                key={t.name}
                href={t.href}
                className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-2)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-c-border-cool-2)]"
              >
                {/* Abstract preview */}
                <div
                  className={`relative flex h-24 items-center justify-center border-b border-[var(--color-c-neutral-2)] bg-gradient-to-br ${t.wash} to-transparent`}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.10]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  />
                  <div className="relative flex w-full items-center gap-2 px-5">
                    <span className="flex-1 space-y-1.5">
                      <span className="block h-1.5 w-2/3 rounded-full bg-white/20" />
                      <span className="block h-1.5 w-full rounded-full bg-white/10" />
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${t.chip}`}
                    >
                      <t.icon className={`h-4 w-4 ${t.tint}`} />
                    </span>
                    <span className="flex-1 space-y-1.5">
                      <span className="block h-1.5 w-full rounded-full bg-white/10" />
                      <span className="block h-1.5 w-1/2 rounded-full bg-white/20" />
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-1 text-[12px] font-bold text-[var(--color-c-text)]">
                    {t.name}
                  </h3>
                  <p className="mb-2 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                    {t.body}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${t.link}`}
                  >
                    Learn more
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 pb-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] px-6 py-16 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] max-w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.14) 0%, transparent 70%)",
            }}
          />
          {/* Corner ticks */}
          {[
            "left-3 top-3 border-l border-t",
            "right-3 top-3 border-r border-t",
            "bottom-3 left-3 border-b border-l",
            "bottom-3 right-3 border-b border-r",
          ].map((cls) => (
            <span
              key={cls}
              aria-hidden
              className={`pointer-events-none absolute h-4 w-4 border-[var(--color-c-border-strong)] ${cls}`}
            />
          ))}

          <div className="relative">
            <h2 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold leading-tight tracking-tight text-[var(--color-c-text)]">
              Ready to build your
              <br />
              <span className="text-[var(--color-c-lime)]">developer portfolio?</span>
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-[12px] text-[var(--color-c-muted)]">
              Join 500+ engineers already sharing their portfolio with
              recruiters.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <BuildCta variant="compact" />
              <a
                href="#preview"
                className="text-[11px] text-[var(--color-c-dim)] underline-offset-4 hover:text-[var(--color-c-text-4)] hover:underline"
              >
                See what your portfolio looks like →
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
