"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, CircleHelp, Loader2, Mic, Play, Square } from "lucide-react";
import { micError, openMic, stopStream, useAudioDevices, useLevel, useMicSettings, type MicSettings } from "./mic";

const TOGGLES: { key: keyof Omit<MicSettings, "deviceId">; label: string }[] = [
  { key: "echoCancellation", label: "Echo cancellation" },
  { key: "noiseSuppression", label: "Noise suppression" },
  { key: "autoGainControl", label: "Auto gain" },
];

const RECORD_SECONDS = 4;

/** Mic picker, processing toggles, live level meter and a record-and-play-back test. */
export function MicPanel({ compact = false }: { compact?: boolean }) {
  const [mic, setMic] = useMicSettings();
  const { devices, refresh } = useAudioDevices();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "recording" | "playing">("idle");
  const [countdown, setCountdown] = useState(0);
  const [help, setHelp] = useState(false);
  const { level, peak } = useLevel(stream);
  const heard = peak > 0.12;
  const audio = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // (Re)open the mic whenever the test is on and the settings change.
  useEffect(() => {
    if (!testing) return;
    let live = true;
    openMic(mic)
      .then((s) => {
        if (!live) return stopStream(s);
        streamRef.current = s;
        setStream(s);
        setError(null);
        refresh(); // labels become available once permission is granted
      })
      .catch((e) => {
        if (!live) return;
        setError(micError(e));
        setTesting(false);
      });
    return () => {
      live = false;
      stopStream(streamRef.current);
      streamRef.current = null;
      setStream(null);
    };
  }, [testing, mic, refresh]);

  useEffect(
    () => () => {
      audio.current?.pause();
    },
    [],
  );

  async function recordTest() {
    const s = streamRef.current;
    if (!s || phase !== "idle" || typeof MediaRecorder === "undefined") return;
    const rec = new MediaRecorder(s);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType }));
      const a = new Audio(url);
      audio.current = a;
      setPhase("playing");
      a.onended = () => {
        URL.revokeObjectURL(url);
        setPhase("idle");
      };
      a.play().catch(() => setPhase("idle"));
    };
    rec.start();
    setPhase("recording");
    for (let i = RECORD_SECONDS; i > 0; i--) {
      setCountdown(i);
      await new Promise((r) => setTimeout(r, 1000));
    }
    rec.stop();
  }

  const bars = 18;
  const lit = Math.round(level * bars);

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {/* devices */}
      <div>
        <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">Microphone</p>
        <div role="radiogroup" aria-label="Microphone" className="space-y-1">
          {devices.map((d) => {
            const on = mic.deviceId === d.deviceId || (!devices.some((x) => x.deviceId === mic.deviceId) && d.deviceId === "default");
            return (
              <button
                key={d.deviceId}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMic({ deviceId: d.deviceId })}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                  on ? "bg-white/[0.07] text-[var(--color-c-text)]" : "text-[var(--color-c-text-4)] hover:bg-white/[0.04] hover:text-[var(--color-c-text)]"
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${on ? "bg-[var(--color-c-lime)]" : "bg-transparent"}`} />
                <span className="truncate">{d.label}</span>
              </button>
            );
          })}
        </div>
        {devices.length > 0 && devices.every((d) => /^Microphone \d+$|^System default$/.test(d.label)) && (
          <p className="mt-1.5 text-[11px] text-[var(--color-c-dim)]">Start the mic test to see your microphones&apos; names.</p>
        )}
      </div>

      {/* processing */}
      <div className="space-y-1 border-t border-white/[0.06] pt-3">
        {TOGGLES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="switch"
            aria-checked={mic[t.key]}
            onClick={() => setMic({ [t.key]: !mic[t.key] })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-[var(--color-c-text-4)] transition-colors hover:bg-white/[0.04] hover:text-[var(--color-c-text)]"
          >
            <span className="flex h-4 w-4 items-center justify-center">{mic[t.key] && <Check className="h-4 w-4 text-[var(--color-c-lime)]" />}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* test */}
      <div className="border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-c-dim)]">Mic test</p>
          {testing && heard && <span className="ml-auto text-[11px] font-semibold text-[var(--color-c-lime)]">We can hear you</span>}
        </div>

        <div className="mt-2.5 flex h-8 items-end gap-[3px]" aria-hidden>
          {Array.from({ length: bars }, (_, i) => (
            <span
              key={i}
              className={`flex-1 rounded-sm transition-[background-color,height] duration-75 ${
                i < lit ? (i >= bars - 3 ? "bg-red-400" : i >= bars - 7 ? "bg-amber-300" : "bg-[var(--color-c-lime)]") : "bg-white/[0.07]"
              }`}
              style={{ height: `${30 + (i / bars) * 70}%` }}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTesting((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-bold transition-colors ${
              testing ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-white/[0.07] text-[var(--color-c-text)] hover:bg-white/[0.11]"
            }`}
          >
            {testing ? <Square className="h-3 w-3 fill-current" /> : <Mic className="h-3.5 w-3.5" />}
            {testing ? "Stop test" : "Start mic test"}
          </button>
          {testing && (
            <button
              type="button"
              onClick={recordTest}
              disabled={phase !== "idle" || !stream}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[12px] font-bold text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] disabled:opacity-60"
            >
              {phase === "recording" ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" /> Recording… {countdown}s
                </>
              ) : phase === "playing" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Playing back…
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Record {RECORD_SECONDS}s &amp; play back
                </>
              )}
            </button>
          )}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-c-dim)]">
          {testing ? "Speak normally: the bars should reach the middle. Use headphones for the playback to avoid echo." : "Nothing is recorded or uploaded. The test runs only in your browser."}
        </p>
        {error && <p className="mt-2 text-[12px] text-amber-300">{error}</p>}
      </div>

      <div className="border-t border-white/[0.06] pt-3">
        <button type="button" onClick={() => setHelp((v) => !v)} className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-c-dim)] hover:text-[var(--color-c-text-4)]">
          <CircleHelp className="h-3.5 w-3.5" /> What are Default and Communications?
        </button>
        <AnimatePresence initial={false}>
          {help && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-1.5 text-[11px] leading-relaxed text-[var(--color-c-muted)]"
            >
              <strong className="text-[var(--color-c-text-4)]">Default</strong> follows whichever mic your computer is set to use.{" "}
              <strong className="text-[var(--color-c-text-4)]">Communications</strong> is the mic Windows reserves for calls. Both point at one of your real
              mics, so picking the real mic by name gives the same result. Voice typing uses your chosen mic on recent Chrome and Edge; on older versions it
              uses your computer&apos;s default mic.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Top-bar button that opens the mic panel in a popover. */
export function MicButton() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [mic] = useMicSettings();
  const { devices } = useAudioDevices();
  const name = devices.find((d) => d.deviceId === mic.deviceId)?.label ?? "Microphone";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title="Microphone settings and test"
        className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[var(--color-c-text-4)] transition-colors hover:border-white/25 hover:text-[var(--color-c-text)] ${
          open ? "border-white/25 bg-white/[0.06]" : "border-white/10 bg-[#131612]"
        }`}
      >
        <Mic className="h-4 w-4" />
        <span className="hidden max-w-[120px] truncate text-[12px] font-semibold xl:inline">{name}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-11 z-50 max-h-[calc(100vh-140px)] w-[min(340px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1d18] p-4 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)]"
          >
            <MicPanel compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
