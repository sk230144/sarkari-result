import { Briefcase, Users, Zap, Mail } from "lucide-react";

const METRICS = [
  { value: "50,000+", label: "Jobs listed", icon: Briefcase },
  { value: "100K+", label: "Developers trust us", icon: Users },
  { value: "60%", label: "Faster time to interviews", icon: Zap },
  { value: "2x", label: "More job offers", icon: Mail },
];

export function BottomCta() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="dot-grid relative overflow-hidden rounded-[36px] border border-[#2b5933] bg-[#13331a] p-10 shadow-2xl sm:p-16">
        <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="mb-2 text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
              Stop guessing. <br />
              <span className="text-[#4ade80]">Start getting hired.</span>
            </h2>
            <p className="mb-8 text-sm text-[#a3b8a6] sm:text-base">
              More interviews, offers, and a faster path to your next role.
            </p>
            <a
              href="#jobs"
              className="inline-flex items-center gap-2 rounded-full bg-[#4ade80] px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.3)] transition-all hover:bg-[#34d399]"
            >
              <span>Search jobs →</span>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-6">
            {METRICS.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <span className="mb-1 block text-3xl font-extrabold text-white sm:text-4xl">
                  {value}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-[#a3b8a6]">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
