"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Code2,
  Compass,
  Headphones,
  Keyboard,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  Play,
  Send,
  Timer,
  Volume2,
  VolumeX,
} from "lucide-react";
import { EASE } from "@/components/resume-analysis/motion";
import { Modal } from "@/components/cover-letter/modal";
import {
  ANSWER_MAX_CHARS,
  LEVELS,
  isAnswered,
  ordered,
  type Answer,
  type CodeLanguage,
  type Interview,
  type Question,
} from "@/lib/interview/types";
import { useDictation, useSpeaker } from "./use-speech";
import { useLevel, useMicSettings } from "./mic";
import { MicButton, MicPanel } from "./mic-panel";
import { CodePanel } from "./code-panel";
import { Evaluating } from "./evaluating";
import { InterviewResults } from "./results";

type Load = { state: "loading" } | { state: "error"; message: string; login?: boolean } | { state: "ready"; iv: Interview };

function clock(s: number) {
  const v = Math.max(0, Math.floor(s));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const sec = v % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const minutesLabel = (m: number) => (m < 1 ? `${Math.round(m * 60)} sec` : Number.isInteger(m) ? `${m} min` : `${m.toFixed(1)} min`);

export function InterviewSession({ id }: { id: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });

  const fetchIv = useCallback(async () => {
    try {
      const res = await fetch(`/api/mock-interview/${id}`, { cache: "no-store" });
      const j = await res.json();
      if (res.status === 401) return setLoad({ state: "error", message: "Sign in to open this interview.", login: true });
      if (!res.ok) return setLoad({ state: "error", message: j.error ?? "Couldn't load this interview." });
      setLoad({ state: "ready", iv: j as Interview });
    } catch {
      setLoad({ state: "error", message: "Network error. Check your connection and reload." });
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    fetchIv();
  }, [fetchIv]);

  if (load.state === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-c-lime)]" />
      </div>
    );
  }
  if (load.state === "error") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-300" />
        <p className="text-[15px] font-semibold text-[var(--color-c-text)]">{load.message}</p>
        <Link
          href={load.login ? `/login?next=/mock-interview/${id}` : "/mock-interview#generate"}
          className="rounded-xl bg-[var(--color-c-lime)] px-5 py-2.5 text-[13px] font-bold text-black"
        >
          {load.login ? "Sign in" : "Start a new interview"}
        </Link>
      </div>
    );
  }
  if (load.state === "ready" && load.iv.status === "completed") return <InterviewResults iv={load.iv} />;
  return <LiveSession iv={load.iv} onDone={(iv) => setLoad({ state: "ready", iv })} onReload={fetchIv} />;
}

/* ================================================================ live session */

function LiveSession({ iv, onDone, onReload }: { iv: Interview; onDone: (iv: Interview) => void; onReload: () => void }) {
  const reduce = useReducedMotion();
  const qs = useMemo(() => ordered(iv.questions), [iv.questions]);
  const level = LEVELS.find((l) => l.key === iv.level)!;
  const [answers, setAnswers] = useState<Record<string, Answer>>(iv.answers ?? {});
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [index, setIndex] = useState(() => {
    // Resume at the first unanswered question.
    const i = qs.findIndex((q) => !isAnswered(q, iv.answers?.[q.id]));
    return i === -1 ? 0 : i;
  });
  // The clock counts time spent in the interview, so it pauses while the candidate is away.
  const [elapsed, setElapsed] = useState(() => qs.reduce((n, x) => n + (iv.answers?.[x.id]?.seconds ?? 0), 0));
  const [evaluating, setEvaluating] = useState(iv.status === "evaluating");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");

  const q = qs[index];
  const answer = answers[q.id];
  const spent = useRef<Record<string, number>>(Object.fromEntries(qs.map((x) => [x.id, iv.answers?.[x.id]?.seconds ?? 0])));
  const dirty = useRef(false);
  const answersRef = useRef(answers);
  const currentId = useRef(q.id);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    currentId.current = q.id;
  }, [q.id]);

  const speaker = useSpeaker();
  const appendSpeech = useCallback((text: string) => {
    if (!text) return;
    const qid = currentId.current;
    setAnswers((prev) => {
      const cur = prev[qid] ?? { text: "", seconds: 0 };
      const joined = (cur.text.trim() ? `${cur.text.trimEnd()} ` : "") + text;
      dirty.current = true;
      return { ...prev, [qid]: { ...cur, text: joined.slice(0, ANSWER_MAX_CHARS) } };
    });
  }, []);
  const [mic] = useMicSettings();
  const dictation = useDictation(appendSpeech, mic);

  /* ---- timing ---- */
  const remaining = Math.max(0, iv.timeLimitS - elapsed);
  const resuming = elapsed > 0 || Object.keys(iv.answers ?? {}).length > 0;

  useEffect(() => {
    if (!started || evaluating) return;
    const t = setInterval(() => {
      spent.current[currentId.current] = (spent.current[currentId.current] ?? 0) + 1;
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [started, evaluating]);

  /* ---- saving ---- */
  const merged = useCallback(() => {
    const out: Record<string, Answer> = {};
    for (const x of qs) {
      const a = answersRef.current[x.id];
      const s = Math.round(spent.current[x.id] ?? 0);
      if (a || s > 0) out[x.id] = { ...(a ?? { text: "" }), seconds: s };
    }
    return out;
  }, [qs]);

  const save = useCallback(
    async (keepalive = false) => {
      dirty.current = false;
      setSaveState("saving");
      try {
        const res = await fetch(`/api/mock-interview/${iv.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: merged() }),
          keepalive,
        });
        setSaveState(res.ok ? "saved" : "error");
        if (!res.ok) dirty.current = true;
      } catch {
        setSaveState("error");
        dirty.current = true;
      }
    },
    [iv.id, merged],
  );

  useEffect(() => {
    if (!started || evaluating || !dirty.current) return;
    const t = setTimeout(() => save(), 800);
    return () => clearTimeout(t);
  }, [answers, started, evaluating, save]);

  // Time spent is saved every 15s even without typing, and whenever the
  // candidate leaves: tab hidden or closed, or navigating away in the app.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    if (!started || evaluating) return;
    const t = setInterval(() => save(), 15_000);
    const onHide = () => document.visibilityState === "hidden" && save(true);
    const onLeave = () => save(true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onLeave);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onLeave);
    };
  }, [started, evaluating, save]);
  const liveRef = useRef(false);
  useEffect(() => {
    liveRef.current = started && !evaluating;
  }, [started, evaluating]);
  useEffect(
    () => () => {
      if (liveRef.current) saveRef.current(true);
    },
    [],
  );

  /* ---- speech per question ---- */
  const speakText = (x: Question) =>
    x.kind === "coding" && x.coding ? `Coding question. ${x.coding.title}. ${x.coding.prompt}` : x.text;

  useEffect(() => {
    if (!started || evaluating) return;
    speaker.speak(speakText(q));
    // Only when the question changes, not when mute toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id, started, evaluating]);

  function go(i: number) {
    if (i < 0 || i >= qs.length) return;
    dictation.stop();
    setIndex(i);
    if (dirty.current) save();
  }

  function update(patch: Partial<Answer>) {
    dirty.current = true;
    setAnswers((prev) => ({ ...prev, [q.id]: { ...(prev[q.id] ?? { text: "", seconds: 0 }), ...patch } }));
  }

  async function start() {
    if (resuming) {
      setStarted(true);
      return;
    }
    setStarting(true);
    try {
      const res = await fetch(`/api/mock-interview/${iv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: true }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setStarted(true);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't start. Try again.");
    } finally {
      setStarting(false);
    }
  }

  /* ---- evaluation ---- */
  const submit = useCallback(async () => {
    setConfirm(false);
    dictation.stop();
    speaker.stop();
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch(`/api/mock-interview/${iv.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: merged() }),
      });
      const j = await res.json();
      if (res.ok) return onDone(j as Interview);
      if (res.status === 409 && j.evaluating) return; // another tab is grading; the poll below picks it up
      throw new Error(j.error);
    } catch (e) {
      setEvaluating(false);
      setError(e instanceof Error && e.message ? e.message : "Couldn't evaluate your interview. Please try again.");
    }
  }, [dictation, speaker, iv.id, merged, onDone]);

  // While evaluating (including after a reload mid-grade), check for the result.
  useEffect(() => {
    if (!evaluating) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/mock-interview/${iv.id}`, { cache: "no-store" });
        const j = (await res.json()) as Interview;
        if (res.ok && j.status === "completed") onDone(j);
        else if (res.ok && j.status === "in_progress" && iv.status === "evaluating") onReload();
      } catch {
        /* keep polling */
      }
    }, 5000);
    return () => clearInterval(t);
  }, [evaluating, iv.id, iv.status, onDone, onReload]);

  // Time's up: submit whatever is there.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (started && !evaluating && remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submit();
    }
  }, [started, evaluating, remaining, submit]);

  const answeredCount = qs.filter((x) => isAnswered(x, answers[x.id])).length;
  const unanswered = qs.length - answeredCount;

  if (evaluating) return <Evaluating answered={answeredCount} total={qs.length} />;
  if (!started) return (
      <StartScreen
        iv={iv}
        level={level}
        starting={starting}
        error={error}
        speaker={speaker}
        resume={resuming ? { answered: answeredCount, remaining } : null}
        onStart={start}
      />
    );

  const phaseTabs = [
    { key: "tech" as const, label: "Phase 1: Tech Depth", first: qs.findIndex((x) => x.phase === "tech") },
    { key: "hr" as const, label: "Phase 2: Culture Fit", first: qs.findIndex((x) => x.phase === "hr" && x.kind !== "intro") },
  ];
  const activeTab = q.kind === "intro" ? null : q.phase;
  const low = remaining < 120;
  const qSpent = spent.current[q.id] ?? 0;
  const over = qSpent > q.minutes * 60;

  const groups: { title: string; items: { q: Question; i: number }[] }[] = [
    { title: "Warm-up", items: qs.map((x, i) => ({ q: x, i })).filter(({ q: x }) => x.kind === "intro") },
    { title: "Phase 1 · Tech depth", items: qs.map((x, i) => ({ q: x, i })).filter(({ q: x }) => x.phase === "tech") },
    { title: "Phase 2 · Culture fit", items: qs.map((x, i) => ({ q: x, i })).filter(({ q: x }) => x.phase === "hr" && x.kind !== "intro") },
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      {/* ---------- top bar ---------- */}
      <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-white/[0.06] bg-[var(--color-c-obsidian)]/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold tracking-tight text-[var(--color-c-text)]">{iv.role}</p>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-c-dim)]">
              {level.label} · {level.sub} · {answeredCount}/{qs.length} recorded
            </p>
          </div>

          <div className="order-3 flex w-full rounded-xl border border-white/[0.07] bg-[#131612] p-1 md:order-none md:mx-auto md:w-auto">
            {phaseTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => go(t.first)}
                className={`relative flex-1 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors md:flex-none md:px-4 ${
                  activeTab === t.key ? "text-black" : "text-[var(--color-c-muted)] hover:text-[var(--color-c-text)]"
                }`}
              >
                {activeTab === t.key && (
                  <motion.span layoutId="phase-tab" className="absolute inset-0 rounded-lg bg-[var(--color-c-lime)]" transition={{ duration: 0.3, ease: EASE }} />
                )}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span
              title="Time left for the whole interview"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-[14px] font-bold tabular-nums ${
                low ? "animate-pulse border-red-500/40 bg-red-500/10 text-red-300" : "border-white/10 bg-[#131612] text-[var(--color-c-text)]"
              }`}
            >
              <Timer className="h-4 w-4" />
              {clock(remaining)}
            </span>
            <MicButton />
            {speaker.supported && (
              <button
                type="button"
                onClick={() => speaker.setMuted(!speaker.muted)}
                title={speaker.muted ? "Unmute question audio" : "Mute question audio"}
                aria-pressed={speaker.muted}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#131612] text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
              >
                {speaker.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => (unanswered ? setConfirm(true) : submit())}
              className="cl-glow inline-flex items-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-2 text-[13px] font-bold text-black transition-transform hover:-translate-y-0.5"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluate interview</span>
              <span className="sm:hidden">Evaluate</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-2.5 text-[13px] text-red-300">
          {error}
        </p>
      )}

      {/* mobile question strip */}
      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:hidden">
        {qs.map((x, i) => {
          const done = isAnswered(x, answers[x.id]);
          return (
            <button
              key={x.id}
              type="button"
              onClick={() => go(i)}
              className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border px-2 font-mono text-[12px] font-bold transition-colors ${
                i === index
                  ? "border-[var(--color-c-lime)] bg-[var(--color-c-lime)] text-black"
                  : done
                    ? "border-[var(--color-c-lime)]/30 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
                    : "border-white/10 text-[var(--color-c-dim)]"
              }`}
            >
              {x.kind === "coding" ? <Code2 className="h-3.5 w-3.5" /> : i + 1}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* ---------- question list ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-[140px] max-h-[calc(100vh-160px)] space-y-5 overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="mb-2 px-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">{g.title}</p>
                <div className="space-y-1">
                  {g.items.map(({ q: x, i }) => {
                    const done = isAnswered(x, answers[x.id]);
                    const cur = i === index;
                    return (
                      <button
                        key={x.id}
                        type="button"
                        onClick={() => go(i)}
                        className={`group relative flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                          cur ? "border-[var(--color-c-lime)]/40 bg-[var(--color-c-lime)]/[0.06]" : "border-transparent hover:border-white/10 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className={`mt-0.5 font-mono text-[11px] font-bold ${cur ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-dim)]"}`}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`line-clamp-2 text-[12px] font-semibold leading-snug ${cur ? "text-[var(--color-c-text)]" : "text-[var(--color-c-text-4)]"}`}>
                            {x.kind === "coding" && <Code2 className="mr-1 inline h-3 w-3 text-[var(--color-c-lime)]" />}
                            {x.coding?.title ?? x.text}
                          </span>
                          <span
                            className={`mt-1 inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
                              done ? "text-[var(--color-c-lime)]" : "text-[var(--color-c-dim)]"
                            }`}
                          >
                            {done ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
                            {done ? "Recorded" : "Pending"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ---------- current question ---------- */}
        <main className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-4"
            >
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-[#181c16] to-[#121510] p-5 sm:p-7">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-64 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.09) 0%, transparent 70%)" }} />
                <div className="relative flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[var(--color-c-lime)]/12 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-lime)]">
                    Question {index + 1} of {qs.length}
                  </span>
                  <span className="rounded-lg border border-white/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-muted)]">
                    {q.kind === "coding" ? "Coding round" : q.kind === "technical" ? "Technical" : q.kind === "intro" ? "Introduction" : q.kind === "closing" ? "Closing" : "Behavioural"}
                  </span>
                  <span
                    className={`ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider ${over ? "text-amber-300" : "text-[var(--color-c-dim)]"}`}
                    title="Time spent on this question / suggested time"
                  >
                    <Clock className="h-3 w-3" />
                    {clock(qSpent)} / {minutesLabel(q.minutes)}
                  </span>
                </div>

                <div className="relative mt-4 flex items-start gap-3">
                  <h2 className="flex-1 text-[clamp(1.1rem,2.4vw,1.45rem)] font-bold leading-snug tracking-[-0.02em] text-[var(--color-c-text)]">
                    {q.coding?.title ?? q.text}
                  </h2>
                  {speaker.supported && (
                    <button
                      type="button"
                      onClick={() => (speaker.speaking ? speaker.stop() : speaker.speak(speakText(q), true))}
                      title={speaker.speaking ? "Stop reading" : "Read the question aloud"}
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        speaker.speaking
                          ? "border-[var(--color-c-lime)]/50 bg-[var(--color-c-lime)]/10 text-[var(--color-c-lime)]"
                          : "border-white/10 text-[var(--color-c-text-4)] hover:border-white/25 hover:text-[var(--color-c-text)]"
                      }`}
                    >
                      {speaker.speaking && <span className="ripple absolute inset-0 rounded-xl border border-[var(--color-c-lime)]/40" />}
                      <Headphones className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {q.kind === "coding" && q.coding && (
                  <div className="relative mt-4 space-y-4">
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-c-text-4)]">{q.coding.prompt}</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {q.coding.examples.map((ex, k) => (
                        <div key={k} className="rounded-xl border border-white/[0.07] bg-black/30 p-3 font-mono text-[12px]">
                          <p className="mb-1.5 font-sans text-[11px] font-bold text-[var(--color-c-text-4)]">Example {k + 1}</p>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">Input</p>
                          <pre className="mb-1.5 whitespace-pre-wrap break-words text-[var(--color-c-text)]">{ex.input}</pre>
                          <p className="text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">Output</p>
                          <pre className="whitespace-pre-wrap break-words text-[var(--color-c-lime)]">{ex.output}</pre>
                          {ex.explanation && <p className="mt-1.5 font-sans text-[11px] leading-relaxed text-[var(--color-c-muted)]">{ex.explanation}</p>}
                        </div>
                      ))}
                    </div>
                    {q.coding.constraints && (
                      <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 font-mono text-[11px] leading-relaxed text-[var(--color-c-muted)]">
                        <span className="font-bold text-[var(--color-c-text-4)]">Constraints: </span>
                        {q.coding.constraints}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {q.kind === "coding" && q.coding && (
                <CodePanel
                  key={q.id}
                  spec={q.coding}
                  code={answer?.code}
                  language={answer?.language}
                  onChange={(code, language: CodeLanguage) => update({ code, language })}
                  onTests={(passed, total) => update({ tests: { passed, total } })}
                />
              )}

              <AnswerBox
                value={answer?.text ?? ""}
                coding={q.kind === "coding"}
                dictation={dictation}
                onChange={(text) => update({ text })}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <GuideCard icon={Compass} title="Context strategy" body={q.context} tone="blue" />
                <GuideCard icon={Lightbulb} title="Expert guidance" body={q.guidance} tone="lime" />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <div className="hidden flex-1 flex-wrap items-center justify-center gap-1.5 sm:flex">
              {qs.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  aria-label={`Question ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-[var(--color-c-lime)]" : isAnswered(x, answers[x.id]) ? "w-2 bg-[var(--color-c-lime)]/45" : "w-2 bg-white/15 hover:bg-white/30"
                  }`}
                />
              ))}
            </div>
            <span className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)] sm:hidden">
              {saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : "Saved"}
            </span>
            {index < qs.length - 1 ? (
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-[13px] font-bold text-[var(--color-c-text)] transition-colors hover:bg-white/[0.1]"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (unanswered ? setConfirm(true) : submit())}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-4 py-2.5 text-[13px] font-bold text-black"
              >
                Finish <Send className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-3 hidden text-center font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)] sm:block">
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Couldn't save. Retrying on your next change" : "All answers saved"}
          </p>
        </main>
      </div>

      {confirm && (
        <Modal label="Evaluate interview" onClose={() => setConfirm(false)} className="max-w-md">
          <div className="p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10">
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            </span>
            <p className="mt-4 text-[17px] font-bold text-[var(--color-c-text)]">
              {unanswered} question{unanswered === 1 ? " is" : "s are"} still pending
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-c-muted)]">
              Unanswered questions score 0. You still have {clock(remaining)} left. Once evaluated, this interview can&apos;t be edited.
            </p>
            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  const i = qs.findIndex((x) => !isAnswered(x, answers[x.id]));
                  if (i !== -1) go(i);
                }}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-[13px] font-bold text-[var(--color-c-text-4)] hover:border-white/25 hover:text-[var(--color-c-text)]"
              >
                Keep answering
              </button>
              <button type="button" onClick={submit} className="flex-1 rounded-xl bg-[var(--color-c-lime)] px-4 py-2.5 text-[13px] font-bold text-black">
                Evaluate anyway
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================================================================ pieces */

function AnswerBox({
  value,
  coding,
  dictation,
  onChange,
}: {
  value: string;
  coding: boolean;
  dictation: ReturnType<typeof useDictation>;
  onChange: (text: string) => void;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border bg-[#121510] transition-colors ${dictation.listening ? "border-red-400/40" : "border-white/[0.08] focus-within:border-[var(--color-c-lime)]/50"}`}>
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <Keyboard className="h-3.5 w-3.5 text-[var(--color-c-dim)]" />
        <p className="text-[12px] font-bold text-[var(--color-c-text-4)]">
          {coding ? "Explain your approach" : "Your answer"}
          {coding && <span className="font-normal text-[var(--color-c-dim)]"> (optional: complexity, trade-offs)</span>}
        </p>
        {dictation.supported ? (
          <button
            type="button"
            onClick={() => (dictation.listening ? dictation.stop() : dictation.start())}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-bold transition-colors ${
              dictation.listening ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-white/[0.06] text-[var(--color-c-text)] hover:bg-white/[0.1]"
            }`}
          >
            {dictation.listening ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
                </span>
                Stop
                <MicOff className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" /> Speak
              </>
            )}
          </button>
        ) : (
          <span className="ml-auto font-mono text-[10px] text-[var(--color-c-dim)]" title="Use Chrome or Edge for voice answers">
            Voice input needs Chrome or Edge
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, ANSWER_MAX_CHARS))}
        maxLength={ANSWER_MAX_CHARS}
        rows={coding ? 3 : 7}
        placeholder={coding ? "Walk through your approach, time and space complexity…" : "Type your answer, or press Speak and answer out loud…"}
        className="block w-full resize-y bg-transparent px-4 py-3.5 text-[14px] leading-relaxed text-[var(--color-c-text)] outline-none placeholder:text-[var(--color-c-dim)]"
      />
      {(dictation.listening || dictation.error) && (
        <div className={`flex items-center gap-3 border-t border-white/[0.05] px-4 py-2 text-[12px] ${dictation.error ? "text-amber-300" : "italic text-[var(--color-c-muted)]"}`}>
          {dictation.listening && !dictation.error && <LiveLevel stream={dictation.stream} />}
          <p className="min-w-0 flex-1">{dictation.error ?? (dictation.interim || "Listening… speak your answer")}</p>
        </div>
      )}
      <p className="px-4 pb-2 text-right font-mono text-[10px] text-[var(--color-c-dim)]">
        {value.length}/{ANSWER_MAX_CHARS}
      </p>
    </div>
  );
}

/** Small bouncing bars showing the mic is picking up the voice. */
function LiveLevel({ stream }: { stream: MediaStream | null }) {
  const { level } = useLevel(stream);
  return (
    <span className="flex h-4 shrink-0 items-end gap-[2px]" aria-hidden>
      {[0.5, 0.8, 1, 0.8, 0.5].map((w, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-red-400 transition-[height] duration-75"
          style={{ height: `${Math.max(20, Math.min(100, level * w * 140))}%` }}
        />
      ))}
    </span>
  );
}

function GuideCard({ icon: Icon, title, body, tone }: { icon: typeof Compass; title: string; body: string; tone: "blue" | "lime" }) {
  if (!body) return null;
  const c = tone === "blue" ? "text-blue-300 bg-blue-400/10" : "text-[var(--color-c-lime)] bg-[var(--color-c-lime)]/10";
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121510] p-5">
      <p className="flex items-center gap-2.5 text-[13px] font-bold text-[var(--color-c-text)]">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${c}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {title}
      </p>
      <p className="mt-2.5 text-[13px] leading-relaxed text-[var(--color-c-muted)]">{body}</p>
    </div>
  );
}

function StartScreen({
  iv,
  level,
  starting,
  error,
  speaker,
  resume,
  onStart,
}: {
  iv: Interview;
  level: (typeof LEVELS)[number];
  starting: boolean;
  error: string | null;
  speaker: ReturnType<typeof useSpeaker>;
  /** Set when the candidate is coming back to an interview they left. */
  resume: { answered: number; remaining: number } | null;
  onStart: () => void;
}) {
  const reduce = useReducedMotion();
  const tech = iv.questions.filter((q) => q.phase === "tech").length;
  const hr = iv.questions.length - tech;
  const coding = iv.questions.filter((q) => q.kind === "coding").length;
  const mins = Math.round(iv.timeLimitS / 60);
  const rows = [
    { icon: Headphones, text: "Each question is read aloud when it opens. Mute any time from the top bar." },
    { icon: Mic, text: "Type your answers, or press Speak and answer out loud (Chrome or Edge)." },
    { icon: Code2, text: `${coding} coding round${coding === 1 ? "" : "s"} with a built-in compiler. Run your code against the examples before moving on.` },
    { icon: Timer, text: `One clock for the whole interview: ${mins} minutes. It pauses if you leave, and submits your answers when it hits zero.` },
  ];
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col justify-center px-4 py-10 sm:px-6">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-b from-[#181c16] to-[#121510] p-6 sm:p-9"
      >
        <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-56 w-72 rounded-full" style={{ background: "radial-gradient(circle, rgba(163,230,53,0.12) 0%, transparent 70%)" }} />
        <p className="relative font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-c-lime)]">
          {resume ? "Welcome back" : "Your interview is ready"}
        </p>
        <h1 className="relative mt-2 text-[clamp(1.6rem,4vw,2.2rem)] font-extrabold tracking-[-0.04em] text-[var(--color-c-text)]">{iv.role}</h1>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {[`${level.label} · ${level.sub}`, `${iv.questions.length} questions`, `${tech} tech · ${hr} culture fit`, `${mins} min`].map((c) => (
            <span key={c} className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] font-bold text-[var(--color-c-text-4)]">
              {c}
            </span>
          ))}
        </div>

        {resume && (
          <div className="relative mt-6 rounded-2xl border border-[var(--color-c-lime)]/25 bg-[var(--color-c-lime)]/[0.05] p-4">
            <div className="flex items-center justify-between text-[13px] font-bold text-[var(--color-c-text)]">
              <span>
                {resume.answered}/{iv.questions.length} answered
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[var(--color-c-lime)]">
                <Timer className="h-3.5 w-3.5" />
                {clock(resume.remaining)} left
              </span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full rounded-full bg-[var(--color-c-lime)]" style={{ width: `${(resume.answered / iv.questions.length) * 100}%` }} />
            </div>
            <p className="mt-2.5 text-[12px] text-[var(--color-c-muted)]">Everything you typed is saved. You&apos;ll pick up at your first unanswered question.</p>
          </div>
        )}

        <ul className="relative mt-7 space-y-3.5">
          {rows.map((r, i) => (
            <motion.li
              key={i}
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.08 }}
              className="flex gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-c-lime)]/10">
                <r.icon className="h-4 w-4 text-[var(--color-c-lime)]" />
              </span>
              <span className="pt-1 text-[13px] leading-relaxed text-[var(--color-c-text-4)]">{r.text}</span>
            </motion.li>
          ))}
        </ul>

        {error && <p className="relative mt-5 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-4 py-2.5 text-[12px] text-red-300">{error}</p>}

        <details className="group relative mt-7 rounded-2xl border border-white/[0.07] bg-black/20">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-c-lime)]/10">
              <Mic className="h-4 w-4 text-[var(--color-c-lime)]" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-bold text-[var(--color-c-text)]">Check your microphone</span>
              <span className="block text-[11px] text-[var(--color-c-dim)]">Pick a mic, tune noise and echo, and hear yourself back</span>
            </span>
            <ChevronDown className="h-4 w-4 text-[var(--color-c-dim)] transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-white/[0.06] px-4 pb-4 pt-4">
            <MicPanel />
          </div>
        </details>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onStart}
            disabled={starting}
            className="cl-glow inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-c-lime)] px-6 py-3.5 text-[14px] font-bold text-black transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            {resume ? "Continue interview" : "Start interview"}
          </button>
          {speaker.supported && (
            <button
              type="button"
              onClick={() => speaker.setMuted(!speaker.muted)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3.5 text-[13px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)]"
            >
              {speaker.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {speaker.muted ? "Audio off" : "Audio on"}
            </button>
          )}
        </div>
        <p className="relative mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)]">
          Answers save automatically · you can leave and come back
        </p>
      </motion.div>
    </div>
  );
}
