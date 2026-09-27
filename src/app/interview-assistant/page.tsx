import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Camera, Crown, Download as DownloadIcon, EyeOff, KeyRound, Mic, PlayCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { SiteFooter } from "@/components/landing/site-footer";
import { FlipGroup, FlipItem, Float, Reveal3D, Sweep, Tilt, Typewriter } from "@/components/landing/motion-kit";
import { HudDemo } from "@/components/interview-assistant/hud-demo";
import { DownloadCards, Faq, HeroDownloads, ProofVideo } from "@/components/interview-assistant/parts";
import { APP_NAME, APP_VERSION } from "@/lib/desktop-app";

export const metadata: Metadata = pageMetadata("/interview-assistant", {
  title: "AI Interview Assistant — Job Alert 24",
  description:
    "A desktop AI assistant for Windows and Mac that stays hidden from screen share, listens to interview questions and answers them, and solves coding questions from a screenshot.",
});

const FEATURES = [
  {
    icon: EyeOff,
    title: "Hidden from screen share",
    tag: "Stays private",
    body: "The app window is excluded from screen capture. Share your whole screen on Google Meet and the other side sees your screen without the assistant on it.",
  },
  {
    icon: Mic,
    title: "Hears the question for you",
    tag: "No typing",
    body: "It listens to your computer's audio, turns the interviewer's question into text, and answers it. Speech is transcribed on your own computer.",
  },
  {
    icon: Camera,
    title: "Solve from a screenshot",
    tag: "Coding rounds",
    body: "Stuck on a LeetCode or coding question? Take a screenshot in the app and get an explained solution with code.",
  },
  {
    icon: Sparkles,
    title: "Answers you can say out loud",
    tag: "Powered by Gemini",
    body: "Short, clear points instead of long essays, so you can glance and speak naturally. Edit the prompt to change the style.",
  },
];

const PROOFS = [
  {
    src: "/interview-assistant/screen-share.mp4",
    poster: "/interview-assistant/screen-share.jpg",
    tag: "Screen share",
    title: "Invisible when you share your screen",
    body: "Recorded during a Google Meet screen share. The assistant is open on the laptop, but it doesn't appear in what the other person sees.",
  },
  {
    src: "/interview-assistant/screenshot-solve.mp4",
    poster: "/interview-assistant/screenshot-solve.jpg",
    tag: "Screenshot",
    title: "Screenshot any coding question, get the answer",
    body: "Take a screenshot of the LeetCode or coding question you're facing, and the assistant reads it and writes the solution.",
  },
  {
    src: "/interview-assistant/audio-capture.mp4",
    poster: "/interview-assistant/audio-capture.jpg",
    tag: "Auto listen",
    title: "Hears the question and answers automatically",
    body: "It picks up the interviewer's voice from your computer's audio, transcribes it live and gives you the answer, with no typing.",
  },
];

const STEPS = [
  { title: "Download and install", body: "Pick your computer above and run the installer." },
  { title: "Enter your access key", body: "Open your profile on Job Alert 24, copy your access key and paste it into the app." },
  { title: "Join your call", body: "Start your meeting. The assistant listens, and you can screenshot coding questions any time." },
];

const FAQ = [
  {
    q: "Will the other person see the assistant when I share my screen?",
    a: (
      <>
        No. The app turns on the operating system&apos;s screen-capture protection, so screen shares and recordings leave it out. You can
        see it in the first video above. On Windows this needs Windows 10 (version 2004) or later.
      </>
    ),
  },
  {
    q: "What do I need to use it?",
    a: (
      <>
        A <Link href="/pricing" className="text-[var(--color-c-green)] underline underline-offset-4">PRO+ plan</Link>. After you sign in, your
        access key is on your <Link href="/profile" className="text-[var(--color-c-green)] underline underline-offset-4">profile</Link>. Keys change
        every 12 hours for safety, so copy the current one when the app asks.
      </>
    ),
  },
  {
    q: "Is my audio uploaded anywhere?",
    a: (
      <>
        No. Speech is turned into text on your own computer. Only the text of your question, and any screenshot you choose to send, goes to our
        server to get an answer. Answers are kept for up to 48 hours so a dropped connection doesn&apos;t cost you a second request, then
        they&apos;re deleted.
      </>
    ),
  },
  {
    q: "Windows or macOS shows a warning when I open it. Is that normal?",
    a: (
      <>
        Yes, the app isn&apos;t code-signed yet. On Windows, click <strong>More info</strong>, then <strong>Run anyway</strong>. On a Mac, open{" "}
        <strong>System Settings → Privacy &amp; Security</strong> and click <strong>Open Anyway</strong>.
      </>
    ),
  },
];

function Eyebrow({ icon: I, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-c-green-dim-5)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-c-green)]">
      <I className="h-3.5 w-3.5" />
      {children}
    </div>
  );
}

export default function InterviewAssistantPage() {
  return (
    <>
      <Navbar />
      <main className="w-full overflow-x-clip pt-20">
        {/* Hero */}
        <section className="relative px-6 pb-16 pt-16 text-center sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[540px] w-[900px] max-w-[160vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-[var(--color-c-green)]/20 via-emerald-500/10 to-transparent blur-[140px]"
          />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center">
            <Reveal3D>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-c-forest-7)] bg-[var(--color-c-surface-3)]/90 px-4 py-1.5 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-c-green)] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-c-green)]" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-c-green)]">New</span>
                <span className="text-xs text-[var(--color-c-text-dim)]">Desktop app for Windows &amp; Mac</span>
              </div>
            </Reveal3D>

            <Reveal3D delay={0.08}>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--color-c-text)] sm:text-6xl">
                Ace every tech interview with your
                <br />
                <span className="mt-3 inline-block rounded-full border-2 border-[var(--color-c-green)]/80 bg-[var(--color-c-green-dim-7)]/95 px-6 py-1.5 text-[var(--color-c-green)] shadow-[0_0_40px_rgba(74,222,128,0.35)]">
                  invisible AI assistant.
                </span>
              </h1>
            </Reveal3D>

            <Reveal3D delay={0.16}>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-[var(--color-c-text-dim)] sm:text-lg">
                A desktop app that stays hidden when you share your screen, listens to the interviewer&apos;s question and answers it for you, and
                solves coding questions from a single screenshot.
              </p>
            </Reveal3D>

            <Reveal3D delay={0.24} className="mt-9 w-full sm:w-auto">
              <HeroDownloads />
            </Reveal3D>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[var(--color-c-text-dim)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[var(--color-c-green)]" />
                Version {APP_VERSION}
              </span>
              <span aria-hidden>•</span>
              <span className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-[var(--color-c-green)]" />
                Included with PRO+
              </span>
              <span aria-hidden>•</span>
              <a href="#proof" className="text-[var(--color-c-green)] underline-offset-4 hover:underline">
                Watch it work
              </a>
            </div>
          </div>

          <Reveal3D className="relative mx-auto mt-14 max-w-6xl" delay={0.1}>
            <Tilt max={4} glare={false}>
              <HudDemo />
            </Tilt>
          </Reveal3D>
        </section>

        {/* App tour */}
        <section className="border-y border-[var(--color-c-surface-12b)] bg-[var(--color-c-canvas-alt)]/60 px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal3D from="left" className="lg:col-span-8">
              <Float distance={6} duration={6}>
                <Tilt className="rounded-[28px]" max={6}>
                  <Sweep className="rounded-[28px] border border-[var(--color-c-forest-16)] bg-black shadow-[0_40px_120px_-30px_rgba(16,185,129,0.35)]">
                    <Image
                      src="/interview-assistant/app-tour.webp"
                      alt="Annotated tour of the Job 24 Alert interview assistant controls"
                      width={1457}
                      height={1079}
                      sizes="(min-width: 1024px) 760px, calc(100vw - 48px)"
                      className="h-auto w-full"
                    />
                  </Sweep>
                </Tilt>
              </Float>
            </Reveal3D>

            <Reveal3D from="right" delay={0.1} className="lg:col-span-4">
              <Eyebrow icon={PlayCircle}>App tour</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-4xl">
                <Typewriter text="This is how our app works" />
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">
                Use the labeled controls to choose when the assistant is visible, capture meeting audio, take a screenshot, and send your question for an answer.
              </p>
            </Reveal3D>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow icon={Zap}>What it does</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-5xl">Built for the moment it matters</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURES.map((f, i) => (
              <Reveal3D key={f.title} className="h-full" delay={(i % 2) * 0.1}>
                <Tilt className="h-full rounded-[28px]" max={8}>
                  <div className="group flex h-full flex-col rounded-[28px] border border-[var(--color-c-forest-8)] bg-[var(--color-c-surface-4)] p-7 transition-colors hover:border-[var(--color-c-green)]/40 sm:p-8">
                    <Float distance={5} duration={4} delay={i * 0.4} className="w-fit">
                      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-c-surface-7)] transition-colors group-hover:bg-[var(--color-c-green-dim-5)]">
                        <f.icon className="h-6 w-6 text-[var(--color-c-green)]" />
                      </span>
                    </Float>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-bold text-[var(--color-c-text)]">{f.title}</h3>
                      <span className="rounded-full bg-[var(--color-c-green-dim-5)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-c-green)]">{f.tag}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-c-text-dim)]">{f.body}</p>
                  </div>
                </Tilt>
              </Reveal3D>
            ))}
          </div>
        </section>

        {/* Proof */}
        <section id="proof" className="scroll-mt-24 border-y border-[var(--color-c-surface-12b)] bg-[var(--color-c-canvas-alt)]/60 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow icon={PlayCircle}>See the proof</Eyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-5xl">See it in action</h2>
              <p className="mt-3 text-sm text-[var(--color-c-text-dim)] sm:text-base">Filmed with a phone on a real laptop.</p>
            </div>
            <div className="space-y-14">
              {PROOFS.map((p, i) => (
                <div key={p.src} className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                  <Reveal3D from={i % 2 ? "right" : "left"} className={`lg:col-span-7 ${i % 2 ? "lg:order-2" : ""}`}>
                    <ProofVideo src={p.src} poster={p.poster} label={p.title} />
                  </Reveal3D>
                  <Reveal3D from={i % 2 ? "left" : "right"} delay={0.1} className="lg:col-span-5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-c-green)]">
                      Proof {i + 1} · {p.tag}
                    </span>
                    <h3 className="mt-2 text-2xl font-bold text-[var(--color-c-text)] sm:text-3xl">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-c-text-dim)] sm:text-base">{p.body}</p>
                  </Reveal3D>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Download */}
        <section id="download" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow icon={DownloadIcon}>Download</Eyebrow>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-5xl">Get {APP_NAME}</h2>
            <p className="mt-3 text-sm text-[var(--color-c-text-dim)] sm:text-base">Choose your computer. Everything it needs is inside the installer.</p>
          </div>
          <DownloadCards />

          <div className="mt-10 rounded-[28px] border border-[var(--color-c-forest-8)] bg-[var(--color-c-canvas-deep)] p-7 sm:p-10">
            <div className="mb-8 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-c-green)]">Quick setup</span>
              <h3 className="mt-2 text-2xl font-bold text-[var(--color-c-text)]">Ready in 3 steps</h3>
            </div>
            <FlipGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <FlipItem key={s.title} className="h-full">
                  <div className="h-full rounded-2xl bg-[var(--color-c-surface-4)] p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-c-green-dim-5)] text-base font-bold text-[var(--color-c-green)]">
                      {i + 1}
                    </span>
                    <h4 className="mt-4 font-semibold text-[var(--color-c-text)]">{s.title}</h4>
                    <p className="mt-1.5 text-sm text-[var(--color-c-text-dim)]">{s.body}</p>
                  </div>
                </FlipItem>
              ))}
            </FlipGroup>
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[var(--color-c-text-dim)]">
              <KeyRound className="h-4 w-4 text-[var(--color-c-green)]" />
              Needs PRO+.{" "}
              <Link href="/pricing" className="font-semibold text-[var(--color-c-green)] underline-offset-4 hover:underline">
                See plans
              </Link>
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-4xl">Frequently asked questions</h2>
          </div>
          <Faq items={FAQ} />
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-20">
          <Reveal3D className="mx-auto max-w-6xl">
            <div className="dot-grid relative overflow-hidden rounded-[36px] border border-[var(--color-c-forest-23)] bg-[var(--color-c-forest-2)] px-8 py-14 text-center shadow-2xl sm:px-16">
              <Float distance={20} duration={7} className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-c-green)]/15 blur-3xl">
                <span />
              </Float>
              <h2 className="relative text-3xl font-bold tracking-tight text-[var(--color-c-text)] sm:text-5xl">
                Walk into your next interview <span className="text-[var(--color-c-green)]">with confidence.</span>
              </h2>
              <p className="relative mx-auto mt-4 max-w-2xl text-sm text-[var(--color-c-text-muted-2)] sm:text-base">
                Install it once, and it&apos;s there for every interview.
              </p>
              <a
                href="#download"
                className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-c-green)] px-8 py-4 text-sm font-bold text-black shadow-[0_0_35px_rgba(74,222,128,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_50px_rgba(74,222,128,0.65)]"
              >
                <DownloadIcon className="h-4 w-4" />
                Download the app
              </a>
            </div>
          </Reveal3D>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

