import { Briefcase, Users, Zap, Mail } from "lucide-react";
import { CountUp, FlipGroup, FlipItem, Float, Reveal3D } from "./motion-kit";

const METRICS = [
  { value: "50,000+", label: "Jobs listed", icon: Briefcase },
  { value: "100K+", label: "Developers trust us", icon: Users },
  { value: "60%", label: "Faster time to interviews", icon: Zap },
  { value: "2x", label: "More job offers", icon: Mail },
];

export function BottomCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Reveal3D>
        <div className="dot-grid relative overflow-hidden rounded-[36px] border border-[var(--color-c-forest-23)] bg-[var(--color-c-forest-2)] p-10 shadow-2xl sm:p-16">
          <Float distance={24} duration={7} className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-c-green)]/15 blur-3xl">
            <span />
          </Float>
          <Float distance={18} duration={9} delay={1.5} className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[var(--color-c-green)]/10 blur-3xl">
            <span />
          </Float>
          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 className="mb-2 text-4xl font-bold leading-tight tracking-tight text-[var(--color-c-text)] sm:text-6xl">
                Stop guessing. <br />
                <span className="text-[var(--color-c-green)]">Start getting hired.</span>
              </h2>
              <p className="mb-8 text-sm text-[var(--color-c-text-muted-2)] sm:text-base">
                More interviews, offers, and a faster path to your next role.
              </p>
              <a
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-c-green)] px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all hover:bg-[var(--color-c-emerald-2)]"
              >
                <span>Search jobs →</span>
              </a>
            </div>

            <FlipGroup className="grid grid-cols-2 gap-8 lg:col-span-6">
              {METRICS.map(({ value, label, icon: Icon }) => (
                <FlipItem key={label}>
                  <span className="mb-1 block text-3xl font-extrabold text-[var(--color-c-text)] sm:text-4xl">
                    <CountUp value={value} />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-c-text-muted-2)]">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </FlipItem>
              ))}
            </FlipGroup>
          </div>
        </div>
      </Reveal3D>
    </section>
  );
}
