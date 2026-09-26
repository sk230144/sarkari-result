"use client";

import type { CodeLanguage } from "@/lib/interview/types";

export type RunResult = { stdout: string; stderr: string; timeMs: number | null };

const RUN_TIMEOUT_MS = 6000;
const PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/";

/* ------------------------------------------------------------ JavaScript */

// Runs in a throwaway worker: no DOM, no page state, killed on timeout.
// `require("fs").readFileSync(0)` and `process.stdout.write` behave like Node,
// so the same code runs unchanged on a real judge.
const JS_WORKER = `
self.onmessage = (e) => {
  const { code, stdin } = e.data;
  const out = [];
  let pending = "";
  const fmt = (args) => args.map((x) => (typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })())).join(" ");
  const push = (s) => { out.push(pending + s); pending = ""; };
  const con = { log: (...a) => push(fmt(a)), info: (...a) => push(fmt(a)), warn: (...a) => push(fmt(a)), error: (...a) => push(fmt(a)), debug: (...a) => push(fmt(a)) };
  const fs = { readFileSync: () => stdin };
  const req = (m) => { if (m === "fs") return fs; if (m === "readline") throw new Error("Use require('fs').readFileSync(0, 'utf8') to read input."); throw new Error("Module not available: " + m); };
  const proc = { stdout: { write: (s) => { const parts = String(s).split("\\n"); for (let i = 0; i < parts.length - 1; i++) push(parts[i]); pending += parts[parts.length - 1]; return true; } }, argv: [], env: {} };
  const t0 = performance.now();
  try {
    new Function("console", "require", "process", code)(con, req, proc);
    if (pending) out.push(pending);
    self.postMessage({ stdout: out.join("\\n"), stderr: "", timeMs: Math.round(performance.now() - t0) });
  } catch (err) {
    if (pending) out.push(pending);
    self.postMessage({ stdout: out.join("\\n"), stderr: (err && err.name ? err.name + ": " : "") + (err && err.message ? err.message : String(err)), timeMs: null });
  }
};`;

function runJs(code: string, stdin: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([JS_WORKER], { type: "text/javascript" }));
    const w = new Worker(url);
    const timer = setTimeout(() => {
      w.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: "", stderr: `Time limit exceeded (${RUN_TIMEOUT_MS / 1000}s). Check for an infinite loop.`, timeMs: null });
    }, RUN_TIMEOUT_MS);
    w.onmessage = (e) => {
      clearTimeout(timer);
      w.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data as RunResult);
    };
    w.onerror = (e) => {
      clearTimeout(timer);
      w.terminate();
      URL.revokeObjectURL(url);
      resolve({ stdout: "", stderr: e.message || "Syntax error", timeMs: null });
      e.preventDefault();
    };
    w.postMessage({ code, stdin });
  });
}

/* ---------------------------------------------------------------- Python */

// Pyodide is ~10 MB, so one worker is kept warm between runs and only
// replaced when a run has to be killed.
const PY_WORKER = `
importScripts("${PYODIDE}pyodide.js");
const ready = loadPyodide({ indexURL: "${PYODIDE}" });
self.postMessage({ type: "loading" });
ready.then(() => self.postMessage({ type: "ready" }), (e) => self.postMessage({ type: "failed", error: String(e) }));
self.onmessage = async (e) => {
  const { id, code, stdin } = e.data;
  let py;
  try { py = await ready; } catch (err) { self.postMessage({ id, stdout: "", stderr: "Couldn't load Python: " + err, timeMs: null }); return; }
  let out = "", errOut = "";
  py.setStdout({ batched: (s) => { out += s + "\\n"; } });
  py.setStderr({ batched: (s) => { errOut += s + "\\n"; } });
  const g = py.globals.get("dict")();
  g.set("__name__", "__main__");
  g.set("__stdin_text__", stdin);
  const t0 = performance.now();
  try {
    await py.runPythonAsync("import sys, io\\nsys.stdin = io.StringIO(__stdin_text__)", { globals: g });
    await py.runPythonAsync(code, { globals: g });
    self.postMessage({ id, stdout: out.replace(/\\n$/, ""), stderr: errOut.replace(/\\n$/, ""), timeMs: Math.round(performance.now() - t0) });
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    // Trim Pyodide's own frames so the student sees their traceback.
    const lines = msg.split("\\n");
    const start = lines.findIndex((l) => l.includes('File "<exec>"'));
    const trimmed = start > 0 ? ["Traceback (most recent call last):", ...lines.slice(start)].join("\\n") : msg;
    self.postMessage({ id, stdout: out.replace(/\\n$/, ""), stderr: trimmed.trim(), timeMs: null });
  } finally {
    g.destroy();
  }
};`;

let pyWorker: Worker | null = null;
let pyUrl: string | null = null;
let pyState: "idle" | "loading" | "ready" | "failed" = "idle";
const pyListeners = new Set<(s: typeof pyState) => void>();
let runSeq = 0;

function setPyState(s: typeof pyState) {
  pyState = s;
  pyListeners.forEach((f) => f(s));
}

function pythonWorker(): Worker {
  if (pyWorker) return pyWorker;
  pyUrl = URL.createObjectURL(new Blob([PY_WORKER], { type: "text/javascript" }));
  pyWorker = new Worker(pyUrl);
  setPyState("loading");
  pyWorker.addEventListener("message", (e) => {
    if (e.data?.type === "ready") setPyState("ready");
    if (e.data?.type === "failed") setPyState("failed");
  });
  pyWorker.addEventListener("error", () => setPyState("failed"));
  return pyWorker;
}

function killPython() {
  pyWorker?.terminate();
  if (pyUrl) URL.revokeObjectURL(pyUrl);
  pyWorker = null;
  pyUrl = null;
  setPyState("idle");
}

/** Starts downloading Python in the background (call when Python is picked). */
export function warmPython() {
  pythonWorker();
}

export function onPythonState(f: (s: "idle" | "loading" | "ready" | "failed") => void) {
  pyListeners.add(f);
  f(pyState);
  return () => {
    pyListeners.delete(f);
  };
}

function runPython(code: string, stdin: string): Promise<RunResult> {
  const w = pythonWorker();
  const id = ++runSeq;
  return new Promise((resolve) => {
    // First run includes the Pyodide download, so it gets a longer leash.
    const limit = pyState === "ready" ? RUN_TIMEOUT_MS : 60_000;
    const timer = setTimeout(() => {
      w.removeEventListener("message", onMsg);
      killPython();
      resolve({
        stdout: "",
        stderr: pyState === "ready" || limit === RUN_TIMEOUT_MS ? `Time limit exceeded (${RUN_TIMEOUT_MS / 1000}s). Check for an infinite loop.` : "Python took too long to load. Check your connection and try again.",
        timeMs: null,
      });
    }, limit);
    function onMsg(e: MessageEvent) {
      if (e.data?.id !== id) return;
      clearTimeout(timer);
      w.removeEventListener("message", onMsg);
      resolve(e.data as RunResult);
    }
    w.addEventListener("message", onMsg);
    w.postMessage({ id, code, stdin });
  });
}

/* ---------------------------------------------------------------- Server */

async function runServer(language: CodeLanguage, code: string, stdin: string): Promise<RunResult> {
  try {
    const res = await fetch("/api/code/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code, stdin }),
    });
    const j = await res.json();
    if (!res.ok) return { stdout: "", stderr: j.error ?? "Couldn't run your code.", timeMs: null };
    return j as RunResult;
  } catch {
    return { stdout: "", stderr: "Network error. Try again.", timeMs: null };
  }
}

export function runCode(language: CodeLanguage, code: string, stdin: string): Promise<RunResult> {
  if (language === "javascript") return runJs(code, stdin);
  if (language === "python") return runPython(code, stdin);
  return runServer(language, code, stdin);
}

/** Output comparison that ignores trailing spaces and blank lines, like most judges. */
export function sameOutput(actual: string, expected: string) {
  const norm = (s: string) =>
    s
      .replace(/\r/g, "")
      .split("\n")
      .map((l) => l.trimEnd())
      .join("\n")
      .trim();
  return norm(actual) === norm(expected);
}

/* ------------------------------------------------------------- Templates */

export const STARTERS: Record<CodeLanguage, string> = {
  javascript: `// Read all of stdin, print the answer to stdout.
const input = require("fs").readFileSync(0, "utf8").trim();
const lines = input.split("\\n");

function solve(lines) {
  // lines[0], lines[1], ... are the input lines, as strings.
  // Numbers on a line:  const nums = lines[0].split(" ").map(Number);
  // A single number:    const k = Number(lines[1]);

  // Write your solution here
  return "";
}

console.log(solve(lines));
`,
  python: `import sys

def solve(lines):
    # lines[0], lines[1], ... are the input lines, as strings.
    # Numbers on a line:  nums = list(map(int, lines[0].split()))
    # A single number:    k = int(lines[1])

    # Write your solution here
    return ""

lines = sys.stdin.read().strip().split("\\n")
print(solve(lines))
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) lines.add(line);

        // Write your solution here
        System.out.println("");
    }
}
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    vector<string> lines;
    string line;
    while (getline(cin, line)) lines.push_back(line);

    // Write your solution here
    cout << "" << endl;
    return 0;
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    char line[4096];
    while (fgets(line, sizeof line, stdin)) {
        // Write your solution here
    }
    printf("\\n");
    return 0;
}
`,
  go: `package main

import (
\t"bufio"
\t"fmt"
\t"os"
)

func main() {
\tsc := bufio.NewScanner(os.Stdin)
\tsc.Buffer(make([]byte, 1024*1024), 1024*1024)
\tvar lines []string
\tfor sc.Scan() {
\t\tlines = append(lines, sc.Text())
\t}

\t// Write your solution here
\tfmt.Println("")
}
`,
};
