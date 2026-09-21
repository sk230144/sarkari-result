import { Globe, Smartphone, RefreshCw, CircleDollarSign } from "lucide-react";

const POINTS = [
  { icon: Globe, tint: "text-[#a3e635]", text: "Shareable at devsunite.com/u/yourname" },
  { icon: Smartphone, tint: "text-[#60a5fa]", text: "Looks great on every device" },
  { icon: RefreshCw, tint: "text-[#a78bfa]", text: "Updates automatically when you edit your profile" },
  { icon: CircleDollarSign, tint: "text-[#fbbf24]", text: "Zero hosting fees. Zero maintenance. Forever." },
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2f4a25] bg-[#16210f] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#a3e635]">
            <span className="blink h-1 w-1 rounded-full bg-[#a3e635]" />
            Live Preview
          </span>
          <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-white">
            Your portfolio
            <br />
            <span className="text-[#a3e635]">looks like this.</span>
          </h2>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-[#8c9c90]">
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
                <span className="text-[12px] text-[#d1d5db]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Browser mockup */}
        <div className="overflow-hidden rounded-xl border border-[#242a22] bg-[#101310] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#242a22] px-3 py-2.5">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#3f4740]" />
              <span className="h-2 w-2 rounded-full bg-[#3f4740]" />
              <span className="h-2 w-2 rounded-full bg-[#3f4740]" />
            </span>
            <span className="flex-1 rounded-md border border-[#242a22] bg-[#0b0e0b] px-2 py-1 text-center font-mono text-[9px] text-[#8c9c90]">
              devsunite.com/u/rahuls
            </span>
          </div>

          <div className="p-4">
            <div className="mb-4 flex items-center gap-3">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2f4a25] text-[13px] font-bold text-[#a3e635]">
                R
                <span className="blink absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#101310] bg-[#a3e635]" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-white">Rahul Sharma</p>
                <p className="text-[10px] text-[#8c9c90]">
                  Full Stack Developer · Mumbai, IN
                </p>
                <span className="mt-1 inline-block rounded border border-[#2f4a25] bg-[#16210f] px-1.5 py-0.5 font-mono text-[9px] text-[#a3e635]">
                  devsunite.com/u/rahuls
                </span>
              </div>
            </div>

            <p className="mb-2 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-[#6b7280]">
              <span className="blink h-1 w-1 rounded-full bg-[#a3e635]" />
              Core Skills
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {SKILLS.map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-[#242a22] bg-[#161a16] px-2 py-0.5 text-[10px] text-[#d1d5db]"
                >
                  {s}
                </span>
              ))}
            </div>

            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[#6b7280]">
              ▪ Experience
            </p>
            <div className="mb-4 space-y-2 border-l border-[#2f4a25] pl-3">
              {[
                ["Software Engineer", "TechCorp India · Jan 2024 — Present"],
                ["Frontend Developer", "StartupXYZ · Jun 2022 — Dec 2023"],
              ].map(([role, meta]) => (
                <div key={role}>
                  <p className="text-[11px] font-bold text-white">{role}</p>
                  <p className="text-[9px] text-[#8c9c90]">{meta}</p>
                </div>
              ))}
            </div>

            <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[#6b7280]">
              ▪ Projects
            </p>
            <div className="space-y-1.5">
              {[
                ["AI Resume Parser", "React · FastAPI"],
                ["DevCollab Platform", "Next.js · Prisma"],
              ].map(([name, stack]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white">
                    {name}
                  </span>
                  <span className="font-mono text-[9px] text-[#6b7280]">
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
