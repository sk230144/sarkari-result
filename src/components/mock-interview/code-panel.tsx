"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Loader2, Play, RotateCcw, Server, Terminal, X, FlaskConical } from "lucide-react";
import { CODE_LANGUAGES, CODE_MAX_CHARS, type CodeLanguage, type CodingSpec } from "@/lib/interview/types";
import { onPythonState, runCode, sameOutput, STARTERS, warmPython, type RunResult } from "./code-runner";

type CaseResult = RunResult & { expected: string; input: string; pass: boolean };

let serverCompiler: Promise<boolean> | null = null;
function hasServerCompiler() {
  serverCompiler ??= fetch("/api/code/run")
    .then((r) => r.json())
    .then((j) => Boolean(j.server))
    .catch(() => false);
  return serverCompiler;
}

export function CodePanel({
  spec,
  code,
  language,
  onChange,
  onTests,
}: {
  spec: CodingSpec;
  code: string | undefined;
  language: CodeLanguage | undefined;
  onChange: (code: string, language: CodeLanguage) => void;
  onTests: (passed: number, total: number) => void;
}) {
  const lang = language ?? "javascript";
  const value = code ?? STARTERS[lang];
  const [tab, setTab] = useState<"tests" | "custom">("tests");
  const [running, setRunning] = useState(false);
  const [cases, setCases] = useState<CaseResult[] | null>(null);
  const [customIn, setCustomIn] = useState(spec.examples[0]?.input ?? "");
  const [customOut, setCustomOut] = useState<RunResult | null>(null);
  const [server, setServer] = useState<boolean | null>(null);
  const [py, setPy] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const area = useRef<HTMLTextAreaElement>(null);
  const gutter = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    hasServerCompiler().then((s) => live && setServer(s));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => onPythonState(setPy), []);
  useEffect(() => {
    if (lang === "python") warmPython();
  }, [lang]);

  const meta = CODE_LANGUAGES.find((l) => l.key === lang)!;
  const unavailable = meta.runsIn === "server" && server === false;
  const lineCount = value.split("\n").length;

  function switchLanguage(next: CodeLanguage) {
    // Only swap in the new starter if the current code is untouched.
    const untouched = !code || code === STARTERS[lang];
    onChange(untouched ? STARTERS[next] : value, next);
    setCases(null);
    setCustomOut(null);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget;
    const { selectionStart: s, selectionEnd: end } = el;
    if (e.key === "Tab") {
      e.preventDefault();
      const next = value.slice(0, s) + "    " + value.slice(end);
      onChange(next, lang);
      requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
    } else if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      // Keep the current line's indentation.
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const indent = value.slice(lineStart, s).match(/^[\t ]*/)?.[0] ?? "";
      const extra = /[{:([]\s*$/.test(value.slice(lineStart, s)) ? "    " : "";
      e.preventDefault();
      const ins = "\n" + indent + extra;
      onChange(value.slice(0, s) + ins + value.slice(end), lang);
      requestAnimationFrame(() => el.setSelectionRange(s + ins.length, s + ins.length));
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runTests();
    }
  }

  async function runTests() {
    if (running || unavailable) return;
    setTab("tests");
    setRunning(true);
    const out: CaseResult[] = [];
    for (const ex of spec.examples) {
      const r = await runCode(lang, value, ex.input);
      out.push({ ...r, input: ex.input, expected: ex.output, pass: !r.stderr && sameOutput(r.stdout, ex.output) });
      setCases([...out]);
      // A compile error will fail every case the same way.
      if (r.stderr && !r.stdout && out.length === 1 && meta.runsIn === "server") break;
    }
    setRunning(false);
    onTests(out.filter((c) => c.pass).length, spec.examples.length);
  }

  async function runCustom() {
    if (running || unavailable) return;
    setTab("custom");
    setRunning(true);
    setCustomOut(await runCode(lang, value, customIn));
    setRunning(false);
  }

  const passed = cases?.filter((c) => c.pass).length ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f0c]">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] bg-[#121510] px-3 py-2">
        <div className="relative">
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => switchLanguage(e.target.value as CodeLanguage)}
            className="h-8 cursor-pointer appearance-none rounded-lg border border-white/10 bg-[#1a1d18] pl-3 pr-8 font-mono text-[12px] font-bold text-[var(--color-c-text)] focus:border-[var(--color-c-lime)]/60 focus:outline-none"
          >
            {CODE_LANGUAGES.map((l) => (
              <option key={l.key} value={l.key} className="bg-[#1a1d18]">
                {l.label}
                {l.runsIn === "server" && server === false ? " (not available)" : ""}
              </option>
            ))}
          </select>
          <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-c-dim)]" />
        </div>
        <span className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--color-c-dim)] sm:inline-flex">
          {meta.runsIn === "browser" ? <Terminal className="h-3 w-3" /> : <Server className="h-3 w-3" />}
          {meta.runsIn === "browser" ? "Runs in your browser" : "Server compiler"}
          {lang === "python" && py === "loading" && " · loading Python…"}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            title="Reset to starter code"
            onClick={() => {
              onChange(STARTERS[lang], lang);
              setCases(null);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-c-dim)] transition-colors hover:bg-white/10 hover:text-[var(--color-c-text)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={runCustom}
            disabled={running || unavailable}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[12px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Custom input
          </button>
          <button
            type="button"
            onClick={runTests}
            disabled={running || unavailable}
            title="Run against the examples (Ctrl + Enter)"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--color-c-lime)] px-3.5 text-[12px] font-bold text-black transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            Run tests
          </button>
        </div>
      </div>

      {/* editor */}
      <div className="relative flex h-[340px] font-mono text-[13px] leading-[20px]">
        <div
          ref={gutter}
          aria-hidden
          className="w-11 shrink-0 select-none overflow-hidden border-r border-white/[0.05] bg-[#0b0d0a] py-3 pr-2 text-right text-[var(--color-c-dim)]/70"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={area}
          aria-label="Code editor"
          value={value}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          maxLength={CODE_MAX_CHARS}
          onChange={(e) => onChange(e.target.value, lang)}
          onKeyDown={onKeyDown}
          onScroll={(e) => {
            if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
          }}
          className="h-full flex-1 resize-none whitespace-pre bg-transparent px-4 py-3 text-[#e6f0da] caret-[var(--color-c-lime)] outline-none [tab-size:4] selection:bg-[var(--color-c-lime)]/25"
        />
      </div>

      {unavailable && (
        <p className="border-t border-white/[0.06] bg-amber-500/[0.06] px-4 py-2.5 text-[12px] text-amber-300">
          {meta.label} needs the server compiler, which isn&apos;t switched on yet. Switch to JavaScript or Python to run your code.
          You can still write and submit {meta.label} and it will be reviewed.
        </p>
      )}

      {/* console */}
      <div className="border-t border-white/[0.06] bg-[#111410]">
        <div className="flex items-center gap-1 border-b border-white/[0.05] px-3">
          {(["tests", "custom"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative px-3 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors ${
                tab === t ? "text-[var(--color-c-text)]" : "text-[var(--color-c-dim)] hover:text-[var(--color-c-text-4)]"
              }`}
            >
              {t === "tests" ? "Test results" : "Custom input"}
              {tab === t && <motion.span layoutId="code-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--color-c-lime)]" />}
            </button>
          ))}
          {cases && !running && (
            <span
              className={`ml-auto rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                passed === spec.examples.length ? "bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]" : "bg-red-500/15 text-red-300"
              }`}
            >
              {passed}/{spec.examples.length} passed
            </span>
          )}
        </div>

        <div className="max-h-[260px] overflow-y-auto p-3">
          {tab === "tests" ? (
            !cases ? (
              <p className="py-4 text-center text-[12px] text-[var(--color-c-dim)]">
                Run your code against the {spec.examples.length} example{spec.examples.length === 1 ? "" : "s"}. Read input from stdin and print to stdout.
              </p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {cases.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl border p-3 ${c.pass ? "border-[var(--color-c-lime)]/20 bg-[var(--color-c-lime)]/[0.04]" : "border-red-500/20 bg-red-500/[0.04]"}`}
                    >
                      <p className="mb-2 flex items-center gap-2 text-[12px] font-bold">
                        {c.pass ? <Check className="h-3.5 w-3.5 text-[var(--color-c-lime)]" /> : <X className="h-3.5 w-3.5 text-red-400" />}
                        <span className={c.pass ? "text-[var(--color-c-lime)]" : "text-red-300"}>Example {i + 1}</span>
                        {c.timeMs !== null && <span className="ml-auto font-mono text-[10px] text-[var(--color-c-dim)]">{c.timeMs} ms</span>}
                      </p>
                      <div className="grid gap-2 font-mono text-[11px] sm:grid-cols-3">
                        <IO label="Input" value={c.input} />
                        <IO label="Expected" value={c.expected} />
                        <IO label="Your output" value={c.stdout || (c.stderr ? "" : "(no output)")} tone={c.pass ? "ok" : "bad"} />
                      </div>
                      {c.stderr && <pre className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-red-500/[0.08] p-2 font-mono text-[11px] text-red-300">{c.stderr}</pre>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">stdin</span>
                <textarea
                  value={customIn}
                  onChange={(e) => setCustomIn(e.target.value.slice(0, 10_000))}
                  rows={5}
                  spellCheck={false}
                  className="w-full resize-y rounded-lg border border-white/10 bg-[#0b0d0a] p-2 font-mono text-[12px] text-[var(--color-c-text)] outline-none focus:border-[var(--color-c-lime)]/50"
                />
              </label>
              <div>
                <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">
                  stdout {customOut?.timeMs != null && `· ${customOut.timeMs} ms`}
                </span>
                <pre className="min-h-[118px] whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-[#0b0d0a] p-2 font-mono text-[12px] text-[var(--color-c-text)]">
                  {running && tab === "custom" ? "Running…" : customOut ? customOut.stdout || (customOut.stderr ? "" : "(no output)") : "Press Custom input to run."}
                  {customOut?.stderr && <span className="text-red-300">{(customOut.stdout ? "\n" : "") + customOut.stderr}</span>}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IO({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[var(--color-c-dim)]">{label}</p>
      <pre
        className={`max-h-24 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-black/40 p-2 ${
          tone === "ok" ? "text-[var(--color-c-lime)]" : tone === "bad" ? "text-red-200" : "text-[var(--color-c-text-4)]"
        }`}
      >
        {value}
      </pre>
    </div>
  );
}
