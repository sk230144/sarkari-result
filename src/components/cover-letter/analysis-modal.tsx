"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Network,
  Building,
  TrendingUp,
  Plus,
  Route,
  Hammer,
  BadgeCheck,
  Bot,
  ChevronDown,
  Monitor,
  FileText,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Modal } from "./modal";
import { prefersReducedMotion } from "./primitives";
import type { Analysis } from "./sample-data";

function Section({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "lime";
}) {
  return (
    <section
      className={`cl-fade rounded-2xl border p-4 ${
        tone === "lime"
          ? "border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/[0.04]"
          : "border-white/[0.06] bg-white/[0.02]"
      }`}
    >
      <h3 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-text-4)]">
        <Icon className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function ResourceCard({
  icon: Icon,
  title,
  body,
  href,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="group flex flex-col rounded-xl border border-[var(--color-c-lime)]/20 bg-[#1a2115] p-4 transition-colors hover:border-[var(--color-c-lime)]/45">
      <div className="flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-lime)]/10">
          <Icon className="h-4 w-4 text-[var(--color-c-lime)]" />
        </span>
        <p className="flex-1 text-[13px] font-bold leading-snug text-[var(--color-c-text)]">
          {title}
        </p>
        <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider text-[var(--color-c-dim)]">
          Resource
        </span>
      </div>
      <p className="mt-2 flex-1 text-[12px] leading-relaxed text-[var(--color-c-muted)]">{body}</p>
      <Link
        href={href}
        className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3 py-2 text-[11px] font-bold text-black transition-transform group-hover:translate-x-0.5"
      >
        {cta}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

export function AnalysisModal({
  data,
  onClose,
  onCoverLetter,
}: {
  data: Analysis;
  onClose: () => void;
  onCoverLetter: () => void;
}) {
  // Ring and bars start empty and fill after mount, so the score animates in.
  const [filled, setFilled] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setFilled(true), prefersReducedMotion() ? 0 : 150);
    return () => clearTimeout(id);
  }, []);

  const R = 34;
  const C = 2 * Math.PI * R;
  const ringColor = data.score >= 75 ? "#a3e635" : data.score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <Modal label={`${data.role} resume analysis`} onClose={onClose} className="h-[min(92vh,900px)] max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/10">
          <FileText className="h-4 w-4 text-[var(--color-c-lime)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-[var(--color-c-text)]">{data.role}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-c-dim)]">
            AI match report
          </p>
        </div>
        <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300 sm:inline">
          Sample preview
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-c-dim)] transition-colors hover:bg-white/10 hover:text-[var(--color-c-text)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
        {/* Score */}
        <section className="cl-fade rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative mx-auto h-[92px] w-[92px] shrink-0 sm:mx-0">
              <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r={R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={filled ? C * (1 - data.score / 100) : C}
                  style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[22px] font-extrabold tracking-tight text-[var(--color-c-text)]">
                {data.score}%
              </span>
            </div>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-[15px] font-bold" style={{ color: ringColor }}>
                <AlertTriangle className="h-4 w-4" />
                {data.verdict}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-c-muted)]">{data.summary}</p>
              <div className="mt-3 space-y-2">
                {data.bars.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-[11px] text-[var(--color-c-text-4)]">{b.label}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <span
                        className="block h-full rounded-full bg-[var(--color-c-lime)]"
                        style={{
                          width: filled ? `${b.value}%` : "0%",
                          transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${0.15 + i * 0.12}s`,
                        }}
                      />
                    </span>
                    <span className="w-7 text-right font-mono text-[11px] text-[var(--color-c-text)]">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2.5 text-[12px] leading-relaxed text-amber-200/90">
            <span className="font-bold text-amber-300">Watch title match: </span>
            {data.titleWarning}
          </p>
        </section>

        {/* Matches and gaps */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Section icon={CheckCircle2} title={`Matched (${data.matched.length})`}>
            <div className="flex flex-wrap gap-1.5">
              {data.matched.map((m) => (
                <span key={m} className="rounded-lg border border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--color-c-lime)]">
                  {m}
                </span>
              ))}
            </div>
          </Section>
          <Section icon={XCircle} title={`Gaps (${data.gaps.length})`}>
            <div className="flex flex-wrap gap-1.5">
              {data.gaps.map((g) => (
                <span key={g.skill} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-c-text)]">
                  {g.skill}
                  <span
                    className={`rounded px-1 font-mono text-[8px] font-bold uppercase ${
                      g.level === "Required" ? "bg-red-500/20 text-red-300" : "bg-amber-400/20 text-amber-300"
                    }`}
                  >
                    {g.level}
                  </span>
                </span>
              ))}
            </div>
          </Section>
        </div>

        <Section icon={BookOpen} title="Helpful resources">
          <div className="grid gap-3 sm:grid-cols-2">
            <ResourceCard
              icon={Network}
              title="Strengthen your system design skills"
              body="Almost every technical interview touches system design. Learn the fundamentals recruiters expect."
              href="/system-design"
              cta="Open System Design Sheet"
            />
            <ResourceCard
              icon={Building}
              title="Practice real company interview questions"
              body="Real interview questions tagged by company, from 18 top tech companies."
              href="/faang-questions"
              cta="Open Interview Questions"
            />
          </div>
        </Section>

        <Section icon={TrendingUp} title="How you compare">
          <div className="space-y-3">
            {data.compare.map((c) => (
              <div key={c.label} className="flex gap-3">
                <span className="mt-0.5 w-20 shrink-0 font-mono text-[9px] font-bold uppercase tracking-wider text-sky-400">
                  {c.label}
                </span>
                <p className="text-[12px] leading-relaxed text-[var(--color-c-muted)]">{c.text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Plus} title="Close the gap" tone="lime">
          <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">Add skill</p>
          <p className="mt-1 text-[13px] font-bold text-[var(--color-c-text)]">{data.closeTheGap.title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-c-muted)]">{data.closeTheGap.body}</p>
        </Section>

        <Section icon={Route} title="Your path to this role">
          <p className="text-[12px] text-[var(--color-c-muted)]">{data.path.intro}</p>
          <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">Topics to learn</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {data.path.topics.map((t) => (
              <span key={t} className="rounded-lg bg-[var(--color-c-lime)] px-2.5 py-1 text-[11px] font-bold text-black">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">Projects to build</p>
          <div className="mt-1.5 space-y-2">
            {data.path.projects.map((p) => (
              <div key={p.title} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-c-text)]">
                  <Hammer className="h-3 w-3 text-[var(--color-c-lime)]" />
                  {p.title}
                </p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-c-muted)]">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-c-text-4)]">
            <Clock className="h-3.5 w-3.5 text-[var(--color-c-lime)]" />
            <span className="font-semibold">Realistic timeline:</span> {data.path.timeline}
          </p>
        </Section>

        <Section icon={Hammer} title="Keep building">
          <ResourceCard
            icon={BadgeCheck}
            title="Build a live project portfolio"
            body="A working link beats a PDF every time. Turn your existing projects into a real portfolio in minutes."
            href="/portfolio-builder"
            cta="Build My Portfolio"
          />
        </Section>

        {/* AI risk, collapsed by default */}
        <section className="cl-fade overflow-hidden rounded-2xl border border-amber-400/20 bg-amber-400/[0.03]">
          <button
            type="button"
            onClick={() => setRiskOpen((v) => !v)}
            aria-expanded={riskOpen}
            className="flex w-full items-center gap-3 p-4 text-left"
          >
            <Bot className="h-4 w-4 text-amber-400" />
            <span className="flex-1">
              <span className="block text-[13px] font-bold text-[var(--color-c-text)]">AI disruption risk</span>
              <span className="text-[11px] text-amber-300/90">
                {data.aiRisk.level} · expected timeline {data.aiRisk.timeline}
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 text-[var(--color-c-dim)] transition-transform duration-300 ${riskOpen ? "rotate-180" : ""}`} />
          </button>
          <div className={`grid transition-[grid-template-rows] duration-300 ${riskOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className="space-y-3 px-4 pb-4">
                {[
                  ["Automation risk", data.aiRisk.automation, "text-red-300"],
                  ["Human edge", data.aiRisk.edge, "text-[var(--color-c-lime)]"],
                  ["How to adapt", data.aiRisk.adapt, "text-sky-300"],
                ].map(([label, body, tint]) => (
                  <div key={label} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                    <p className={`font-mono text-[9px] font-bold uppercase tracking-wider ${tint}`}>{label}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-c-muted)]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-4 py-3">
        <button
          type="button"
          disabled
          title="Coming soon"
          className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2.5 text-[12px] font-semibold text-[var(--color-c-dim)]"
        >
          <Monitor className="h-3.5 w-3.5" />
          Mock Interview Prep
          <span className="rounded-full border border-white/10 px-1.5 font-mono text-[8px] uppercase">Soon</span>
        </button>
        <button
          type="button"
          onClick={onCoverLetter}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-c-lime)] px-4 py-2.5 text-[12px] font-bold text-black transition-transform hover:-translate-y-0.5"
        >
          <FileText className="h-3.5 w-3.5" />
          Cover Letter
        </button>
      </div>
    </Modal>
  );
}
