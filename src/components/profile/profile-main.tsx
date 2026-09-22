"use client";

import { useState } from "react";
import {
  Github,
  Globe,
  Star,
  UserRound,
  Code2,
  Plus,
  Building2,
  GraduationCap,
  FolderGit2,
  BadgeCheck,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
} from "lucide-react";

const SOCIALS = [
  { name: "LinkedIn", tint: "text-[#0a66c2]", connected: false },
  { name: "GitHub", tint: "text-[var(--color-c-text)]", connected: true },
  { name: "Twitter / X", tint: "text-[var(--color-c-text)]", connected: false },
  { name: "LeetCode", tint: "text-[#f89f1b]", connected: true },
  { name: "Codeforces", tint: "text-[#1f8acb]", connected: false },
  { name: "CodeChef", tint: "text-[var(--color-c-muted)]", connected: false },
  { name: "GeeksforGeeks", tint: "text-[var(--color-c-green-3)]", connected: false },
  { name: "Dribbble", tint: "text-[#ea4c89]", connected: false },
  { name: "Behance", tint: "text-[#1769ff]", connected: false },
  { name: "Portfolio / Other", tint: "text-[var(--color-c-text)]", connected: true },
];

const SKILL_GROUPS = [
  {
    label: "Languages",
    items: [
      ["PHP", "bg-[#8892bf]"],
      ["HTML", "bg-[#e34f26]"],
      ["CSS", "bg-[#2965f1]"],
      ["JavaScript", "bg-[#f7df1e]"],
      ["Python", "bg-[#3776ab]"],
    ],
  },
  {
    label: "Frameworks & Libraries",
    items: [
      ["React.js", "bg-[#61dafb]"],
      ["Node.js", "bg-[#539e43]"],
      ["Redux", "bg-[#764abc]"],
      ["Next.js", "bg-[#000]"],
      ["React Native", "bg-[#61dafb]"],
    ],
  },
  {
    label: "Tools & Platforms",
    items: [
      ["MySQL", "bg-[#00758f]"],
      ["Git", "bg-[#f05032]"],
    ],
  },
  {
    label: "Other",
    items: [
      ["REST APIs", "bg-[var(--color-c-accent)]"],
      ["SEO", "bg-[var(--color-c-blue-2)]"],
      ["JWT", "bg-[var(--color-c-magenta)]"],
      ["WP Bakery", "bg-[var(--color-c-sky)]"],
      ["Custom Plugin/Theme Development", "bg-[var(--color-c-teal)]"],
    ],
  },
];

const EXPERIENCE = [
  {
    initial: "T",
    role: "Associate Software Engineer",
    company: "TriventCAD Pvt Ltd",
    period: "04/2024 – Present",
    bullets: [
      "Implemented WebSocket integration using React.js to enable real-time chat and live dialer updates with Twilio.",
      "Developed Server-Sent Events (SSE) architecture using Next.js for efficient one-way live data streaming.",
    ],
  },
  {
    initial: "V",
    role: "Front End Developer",
    company: "Voomp Technology",
    period: "11/2023 – 03/2024",
    bullets: [
      "Developed responsive React.js Redux interfaces for a driver license platform.",
      "Integrated React Redux persistence to maintain application state across page reloads.",
    ],
  },
  {
    initial: "P",
    role: "Software Testing/Development",
    company: "Probtosoft Technologies",
    period: "10/2023 – 12/2023",
    bullets: [
      "Developed a Python script using PyMuPDF to extract text content from academic PDFs.",
      "Built a React Native based frontend to upload PDF files.",
    ],
  },
  {
    initial: "S",
    role: "Web Developer",
    company: "Sofodel",
    period: "04/2023 – 10/2023",
    bullets: [
      "Developed an eCommerce website using Node.js and React.js.",
      "Handled both simple and complex functionality including custom components.",
    ],
  },
];

const PROJECTS = [
  {
    name: "Talent IQ",
    wash: "from-[var(--color-c-blue-2)] to-[var(--color-c-blue)]",
    body: "Created a Stream.io-powered real-time interview platform using MERN Stack.",
  },
  {
    name: "3d Room Deginer",
    wash: "from-[var(--color-c-red-2)] to-[var(--color-c-red)]",
    body: "Built and deployed Roomify, an AI SaaS converting 2D floor plans to 3D designs.",
  },
  {
    name: "Apple Mac Store",
    wash: "from-[var(--color-c-violet-4)] to-[var(--color-c-violet)]",
    body: "Built a 3D Apple MacBook website using React.js, Tailwind CSS, GSAP, and Three.js.",
  },
];

function Panel({
  icon: Icon,
  tint,
  title,
  action,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-c-border)] bg-[var(--color-c-surface-1)] p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-[var(--color-c-text)]">
          <Icon className={`h-4 w-4 ${tint}`} />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AddButton({ label = "Add" }: { label?: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2 py-1 text-[11px] font-medium text-[var(--color-c-text-4)] transition-colors hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text)]"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

function RowActions() {
  return (
    <div className="flex items-center gap-1.5 text-[var(--color-c-dim)]">
      <Eye className="h-3.5 w-3.5 cursor-pointer hover:text-[var(--color-c-text)]" />
      <Pencil className="h-3.5 w-3.5 cursor-pointer hover:text-[var(--color-c-text)]" />
      <Trash2 className="h-3.5 w-3.5 cursor-pointer hover:text-[var(--color-c-red)]" />
    </div>
  );
}

export function ProfileMain() {
  const [github, setGithub] = useState("");

  return (
    <div className="flex flex-col gap-4">
      {/* GitHub */}
      <Panel icon={Github} tint="text-[var(--color-c-lime)]" title="GitHub Contributions">
        <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
          Connect your GitHub account to automatically generate and display your
          contribution heatmap right on your profile.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="Enter github username…"
            aria-label="GitHub username"
            className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--color-c-neutral-6)] bg-[var(--color-c-canvas)] px-3 text-[12px] text-[var(--color-c-text)] placeholder:text-[var(--color-c-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--color-c-lime)]"
          />
          <button
            type="button"
            disabled={!github.trim()}
            className="shrink-0 rounded-lg bg-[var(--color-c-lime-deep)] px-4 py-2 text-[12px] font-semibold text-[var(--color-c-text)] transition-colors hover:bg-[var(--color-c-lime-5)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Connect
          </button>
        </div>
      </Panel>

      {/* Social profiles */}
      <Panel icon={Globe} tint="text-[var(--color-c-lime)]" title="Social Profiles">
        <p className="mb-3 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
          Add your social and professional links to display on your public
          profile.
        </p>
        <div className="flex flex-wrap gap-2">
          {SOCIALS.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                s.connected
                  ? "border-[var(--color-c-border-strong)] bg-[var(--color-c-surface-8c)] text-[var(--color-c-text)]"
                  : "border-[var(--color-c-neutral-10)] bg-[var(--color-c-surface-2e)] text-[var(--color-c-dim)] hover:border-[var(--color-c-border-strong)] hover:text-[var(--color-c-text-4)]"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-c-canvas)] text-[9px] font-bold ${s.tint}`}
              >
                {s.name.charAt(0)}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      </Panel>

      {/* Endorsements */}
      <Panel icon={Star} tint="text-[var(--color-c-amber)]" title="Endorsements">
        <p className="text-[11px] leading-relaxed text-[var(--color-c-muted)]">
          No endorsements yet. Share your profile link and ask a colleague or
          manager to write one.
        </p>
      </Panel>

      {/* Professional profile */}
      <Panel icon={UserRound} tint="text-[var(--color-c-lime)]" title="Professional Profile">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
                Most Recent Role
              </p>
              <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">
                Associate Software Engineer
              </p>
              <p className="truncate text-[11px] text-[var(--color-c-muted)]">
                TriventCAD Pvt Ltd
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-olive)]">
              <Building2 className="h-4 w-4 text-[var(--color-c-lime)]" />
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--color-c-blue-raised)] bg-[var(--color-c-canvas)] p-3">
            <div className="min-w-0">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
                Highest Education
              </p>
              <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">
                Computer Science and Engineering
              </p>
              <p className="truncate text-[11px] text-[var(--color-c-muted)]">
                Rajkiya Engineering College, Sonbhadra
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-blue-border)]">
              <GraduationCap className="h-4 w-4 text-[var(--color-c-blue)]" />
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--color-c-muted)]">
              <Code2 className="h-3.5 w-3.5" />
              Skills{" "}
              <span className="text-[var(--color-c-dim)]">
                {SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0)} detected
              </span>
            </p>
            <Plus className="h-4 w-4 cursor-pointer text-[var(--color-c-dim)] hover:text-[var(--color-c-text)]" />
          </div>

          {SKILL_GROUPS.map((g) => (
            <div key={g.label} className="mb-3 last:mb-0">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-c-dim)]">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map(([name, dot]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-2 py-1 text-[11px] text-[var(--color-c-text-4)]"
                  >
                    <span className={`h-3.5 w-3.5 rounded-full ${dot}`} />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Certifications */}
      <Panel
        icon={BadgeCheck}
        tint="text-[var(--color-c-amber)]"
        title="Certifications"
        action={<AddButton />}
      >
        <p className="text-[11px] text-[var(--color-c-muted)]">
          No certifications added yet.
        </p>
      </Panel>

      {/* Experience */}
      <Panel
        icon={Building2}
        tint="text-[var(--color-c-lime)]"
        title="Experience"
        action={<AddButton />}
      >
        <div className="space-y-3">
          {EXPERIENCE.map((e) => (
            <div key={e.role} className="flex gap-2">
              <GripVertical className="mt-3 h-3.5 w-3.5 shrink-0 cursor-grab text-[var(--color-c-border-strong)]" />
              <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-c-olive)] text-[11px] font-bold text-[var(--color-c-lime)]">
                      {e.initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">
                        {e.role}
                      </p>
                      <p className="truncate text-[11px] text-[var(--color-c-muted)]">
                        {e.company}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-c-muted)]">
                    {e.period}
                  </span>
                </div>
                <ul className="space-y-1 pl-9">
                  {e.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-1.5 text-[11px] leading-relaxed text-[var(--color-c-muted)]"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-c-lime-deep)]" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Education */}
      <Panel
        icon={GraduationCap}
        tint="text-[var(--color-c-blue)]"
        title="Education"
        action={<AddButton />}
      >
        <div className="flex gap-2">
          <GripVertical className="mt-3 h-3.5 w-3.5 shrink-0 cursor-grab text-[var(--color-c-border-strong)]" />
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)] p-3">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.35) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative">
              <div className="mb-2 flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-c-olive)]">
                  <GraduationCap className="h-4 w-4 text-[var(--color-c-lime)]" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded border border-[var(--color-c-neutral-6)] bg-[var(--color-c-surface-5b)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--color-c-muted)]">
                    06/2024
                  </span>
                  <RowActions />
                </div>
              </div>
              <p className="text-[12px] font-bold text-[var(--color-c-text)]">
                Rajkiya Engineering College, Sonbhadra
              </p>
              <p className="text-[11px] text-[var(--color-c-muted)]">
                Computer Science and Engineering
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Projects */}
      <Panel
        icon={FolderGit2}
        tint="text-[var(--color-c-lime)]"
        title="Projects"
        action={<AddButton />}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PROJECTS.map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-xl border border-[var(--color-c-border)] bg-[var(--color-c-canvas)]"
            >
              <div
                className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${p.wash}`}
              >
                <span className="absolute left-2 top-2 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-black/25">
                  <GripVertical className="h-3 w-3 text-white/80" />
                </span>
                <FolderGit2 className="h-8 w-8 text-white/90" />
              </div>
              <div className="p-3">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-bold text-[var(--color-c-text)]">
                    {p.name}
                  </p>
                  <RowActions />
                </div>
                <p className="flex gap-1.5 text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-c-lime-deep)]" />
                  {p.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
