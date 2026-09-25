import { Target, ShieldCheck, RefreshCw } from "lucide-react";
import { GenerateCta, Kicker, Reveal } from "./primitives";

const GRID = {
  backgroundImage:
    "linear-gradient(rgba(163,230,53,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.09) 1px,transparent 1px)",
  backgroundSize: "16px 16px",
};

function Preview({ kind }: { kind: "target" | "shield" | "refresh" }) {
  const Icon = kind === "target" ? Target : kind === "shield" ? ShieldCheck : RefreshCw;
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--color-c-lime)]/20 bg-gradient-to-br from-[var(--color-c-lime)]/[0.07] to-transparent">
      <div aria-hidden className="absolute inset-0" style={GRID} />

      <div className="absolute left-4 right-4 top-4 space-y-2">
        <span className="block h-1.5 w-2/3 rounded-full bg-[var(--color-c-lime)]/45 transition-all duration-500 group-hover:w-[85%]" />
        <span className="block h-1.5 w-1/3 rounded-full bg-white/10 transition-all duration-500 group-hover:w-1/2" />
      </div>

      {kind === "shield" && (
        <span
          aria-hidden
          className="cl-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-c-lime)]/70 to-transparent"
        />
      )}

      <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2">
        {kind === "target" && (
          <span
            aria-hidden
            className="ripple absolute inset-0 rounded-xl border border-[var(--color-c-lime)]/50"
          />
        )}
        <span
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/30 bg-[#1b2613] shadow-[0_0_24px_rgba(163,230,53,0.15)] transition-transform duration-300 group-hover:scale-110 ${
            kind === "shield" ? "pulse-soft" : ""
          }`}
        >
          <Icon
            className={`h-5 w-5 text-[var(--color-c-lime)] ${
              kind === "refresh" ? "cl-spin-slow" : ""
            }`}
          />
        </span>
      </span>
    </div>
  );
}

const REASONS = [
  {
    kind: "target" as const,
    title: "Tailored to the exact JD",
    body: "Every letter is generated fresh from your resume and the specific job description you paste, never a fill-in-the-blank template.",
  },
  {
    kind: "shield" as const,
    title: "ATS-friendly formatting",
    body: "Clean structure and phrasing built to pass automated resume screening, not just look good to a human reader.",
  },
  {
    kind: "refresh" as const,
    title: "Regenerate instantly",
    body: "Applying to five companies? Paste a new JD and get a new, tailored letter in seconds, at no extra cost.",
  },
];

export function WhyItWorks() {
  return (
    <section className="px-6 py-16 lg:px-8">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/[0.05] bg-gradient-to-b from-[#1a2414] to-[#131711] px-5 py-16 sm:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-80 w-[720px] max-w-[140vw] -translate-x-1/2 -translate-y-1/3 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(163,230,53,0.16) 0%, transparent 65%)",
            }}
          />

          <div className="relative text-center">
            <Kicker solid>Why it works</Kicker>
            <h2 className="mx-auto mt-5 max-w-xl text-[clamp(1.9rem,4.4vw,2.9rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--color-c-text)]">
              Why job seekers love Job Alert 24&apos;s{" "}
              <span className="text-[var(--color-c-lime)]">Cover Letter Generator</span>
            </h2>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {REASONS.map((r, i) => (
              <Reveal key={r.title} delay={i * 110}>
                <article className="group h-full rounded-2xl border border-white/[0.06] bg-[#171a15] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-c-lime)]/30 hover:shadow-[0_20px_40px_-20px_rgba(163,230,53,0.25)]">
                  <Preview kind={r.kind} />
                  <h3 className="mt-5 px-1 text-[15px] font-bold tracking-tight text-[var(--color-c-text)]">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 px-1 pb-1 text-[13px] leading-relaxed text-[var(--color-c-muted)]">
                    {r.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          <div className="relative mt-12 flex justify-center">
            <GenerateCta size="md" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
