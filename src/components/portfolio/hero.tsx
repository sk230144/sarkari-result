import { Sparkles, Zap, Globe, Star } from "lucide-react";
import { BuildCta } from "./build-cta";

function MiniProfile({
  initial,
  name,
  role,
  tags,
  status,
  accent,
}: {
  initial: string;
  name: string;
  role: string;
  tags: string[];
  status: string;
  accent: string;
}) {
  return (
    <div className="relative z-20 w-[190px] cursor-default select-none rounded-2xl border border-white/10 bg-[#1a1d1a]/95 p-3 shadow-2xl backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-black ${accent}`}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold text-white">{name}</p>
          <p className="truncate text-[10px] text-[#9ca3af]">{role}</p>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[9px] font-medium text-[#d1d5db]"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="flex items-center gap-1 font-mono text-[9px] text-[#a3e635]">
        <span className="h-1 w-1 rounded-full bg-[#a3e635]" />
        {status}
      </p>
    </div>
  );
}

export function PortfolioHero() {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[800px] max-w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(163,230,53,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Display headline */}
        <div className="relative text-center">
          <h1 className="select-none font-extrabold uppercase leading-[0.85] tracking-tight">
            <span className="block text-[clamp(2.75rem,9vw,6.5rem)] text-[#a3e635]">
              Resume
            </span>
            <span className="block text-[clamp(3.25rem,12vw,9rem)] text-[#f5f5f0]">
              Portfolio
            </span>
            <span className="block text-[clamp(1.75rem,5.5vw,4rem)] text-[#6b7280]">
              60 Seconds
            </span>
          </h1>

          {/* Floating card — top right */}
          <div
            className="float-card absolute -top-2 right-0 hidden lg:block"
            style={{ ["--tilt" as string]: "8deg" }}
          >
            <MiniProfile
              initial="P"
              name="Priya Mehta"
              role="Frontend Dev"
              tags={["Next.js", "TypeScript", "Figma"]}
              status="Built in 58s"
              accent="bg-[#60a5fa]"
            />
          </div>

          {/* Floating card — bottom left */}
          <div
            className="float-card absolute bottom-6 left-0 hidden lg:block"
            style={{ ["--tilt" as string]: "-6deg", animationDelay: "-3s" }}
          >
            <MiniProfile
              initial="R"
              name="Rahul Sharma"
              role="Full Stack Dev"
              tags={["React", "Node.js", "AWS"]}
              status="Portfolio live"
              accent="bg-[#a3e635]"
            />
          </div>

          {/* Hand-drawn arrows */}
          <svg
            aria-hidden
            viewBox="0 0 60 60"
            className="pointer-events-none absolute right-[20%] top-2 hidden h-14 w-14 text-[#a3e635] lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M10 6c14 4 22 16 16 30" />
            <path d="M20 30l6 8 9-5" />
          </svg>
          <svg
            aria-hidden
            viewBox="0 0 80 40"
            className="pointer-events-none absolute bottom-10 left-[22%] hidden h-12 w-20 text-[#a3e635] lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M4 8c22 26 48 26 70 10" />
            <path d="M62 24l12-6-4 13" />
          </svg>

          {/* Rotating badge */}
          <div className="pointer-events-none absolute -right-2 bottom-2 hidden h-[88px] w-[88px] place-items-center lg:grid">
            <div className="absolute inset-0 rounded-full bg-[#a3e635] shadow-[0_0_30px_rgba(163,230,53,0.45)]" />
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 h-full w-full animate-[spin_12s_linear_infinite]"
              aria-hidden
            >
              <defs>
                <path
                  id="badge-arc"
                  d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0"
                />
              </defs>
              <text className="fill-black text-[11px] font-bold tracking-[0.22em]">
                <textPath href="#badge-arc" startOffset="0%">
                  BUILD FREE · BUILD FREE ·
                </textPath>
              </text>
            </svg>
            <Sparkles className="relative h-6 w-6 text-black" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="mx-auto mt-14 max-w-md text-center text-[13px] leading-relaxed text-[#9ca3af]">
          Upload your resume PDF. Our AI extracts skills, experience, and
          projects, and deploys your developer portfolio in seconds.
        </p>

        {/* CTA */}
        <div className="mt-7 flex justify-center">
          <BuildCta />
        </div>

        {/* Stat bar */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 overflow-hidden rounded-xl border border-[#242a22] bg-[#101310]">
          {[
            { icon: Zap, tint: "text-[#a3e635]", value: "60s", label: "To go live" },
            { icon: Globe, tint: "text-[#60a5fa]", value: "Zero", label: "Configuration" },
            { icon: Star, tint: "text-[#fbbf24]", value: "100%", label: "Free forever" },
          ].map(({ icon: Icon, tint, value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 px-4 py-5 ${
                i < 2 ? "border-r border-[#242a22]" : ""
              }`}
            >
              <Icon className={`h-4 w-4 ${tint}`} />
              <span className="text-[15px] font-bold text-white">{value}</span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
