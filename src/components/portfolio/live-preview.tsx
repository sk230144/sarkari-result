import { Globe, Smartphone, RefreshCw, CircleDollarSign } from "lucide-react";

const POINTS = [
  { icon: Globe, tint: "text-[var(--color-c-lime)]", text: "Shareable at devsunite.com/u/yourname" },
  { icon: Smartphone, tint: "text-[var(--color-c-blue)]", text: "Looks great on every device" },
  { icon: RefreshCw, tint: "text-[var(--color-c-violet)]", text: "Updates automatically when you edit your profile" },
  { icon: CircleDollarSign, tint: "text-[var(--color-c-amber)]", text: "Zero hosting fees. Zero maintenance. Forever." },
];

const SKILLS = [
  "React", "TypeScript", "Node.js", "Python", "Next.js",
  "MongoDB", "AWS", "Docker", "GraphQL",
];

export function LivePreview() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
            <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
            Live Preview
          </span>
          <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-[var(--color-c-text)]">
            Your portfolio
            <br />
            <span className="text-[var(--color-c-lime)]">looks like this.</span>
          </h2>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-[var(--color-c-muted)]">
            A clean, dark, professional portfolio that shows recruiters exactly
            what they need, nothing more. Your story, pulled straight from your
            resume.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map(({ icon: Icon, tint, text }) => (
              <li key={text} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                  <Icon className={`h-3.5 w-3.5 ${tint}`} />
                </span>
                <span className="text-[12px] text-[var(--color-c-text-4)]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Browser mockup */}
        <div className="overflow-hidden rounded-xl border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-1b)] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[var(--color-c-neutral-2)] px-3 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--color-c-border-strong)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-c-border-strong)]" />
              <span className="h-2 w-2 rounded-full bg-[var(--color-c-border-strong)]" />
            </span>
            <span className="flex-1 rounded-md border border-[var(--color-c-neutral-2)] bg-[var(--color-c-canvas)] px-2 py-1 text-center font-mono text-[9px] text-[var(--color-c-muted)]">
              devsunite.com/u/rahuls
            </span>
          </div>

          <div className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-c-olive)] text-[13px] font-bold text-[var(--color-c-lime)]">
                R
                <span className="blink absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-c-surface-1b)] bg-[var(--color-c-lime)]" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-[var(--color-c-text)]">Rahul Sharma</p>
                <p className="text-[10px] text-[var(--color-c-muted)]">
                  Full Stack Developer · Mumbai, IN
                </p>
                <span className="mt-1 inline-block rounded border border-[var(--color-c-olive)] bg-[var(--color-c-chip-easy)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-c-lime)]">
                  devsunite.com/u/rahuls
                </span>
              </div>
            </div>

            <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
              <span className="blink h-1 w-1 rounded-full bg-[var(--color-c-lime)]" />
              Core Skills
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-[var(--color-c-neutral-2)] bg-[var(--color-c-surface-7b)] px-2 py-0.5 text-[10px] text-[var(--color-c-text-4)]"
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
              ▪ Experience
            </p>
            <div className="mb-4 space-y-2 border-l border-[var(--color-c-olive)] pl-3">
              {[
                ["Software Engineer", "TechCorp India · Jan 2024 — Present"],
                ["Frontend Developer", "StartupXYZ · Jun 2022 — Dec 2023"],
              ].map(([role, meta]) => (
                <div key={role}>
                  <p className="text-[11px] font-bold text-[var(--color-c-text)]">{role}</p>
                  <p className="text-[9px] text-[var(--color-c-muted)]">{meta}</p>
                </div>
              ))}
            </div>

            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[var(--color-c-dim)]">
              ▪ Projects
            </p>
            <div className="space-y-1.5">
              {[
                ["AI Resume Parser", "React · FastAPI"],
                ["DevCollab Platform", "Next.js · Prisma"],
              ].map(([name, stack]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--color-c-text)]">
                    {name}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-c-dim)]">
                    {stack}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
