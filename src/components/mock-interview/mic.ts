"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Microphone choice and processing, saved per browser. */
export type MicSettings = {
  deviceId: string;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
};

const KEY = "mi-mic";
const DEFAULTS: MicSettings = { deviceId: "default", echoCancellation: true, noiseSuppression: true, autoGainControl: true };

/* ---- tiny shared store, so the settings panel and voice typing stay in sync ---- */

let current: MicSettings | null = null;
const listeners = new Set<() => void>();

function read(): MicSettings {
  if (current) return current;
  try {
    current = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    current = DEFAULTS;
  }
  return current!;
}

export function useMicSettings(): [MicSettings, (patch: Partial<MicSettings>) => void] {
  const settings = useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    read,
    () => DEFAULTS,
  );
  const update = useCallback((patch: Partial<MicSettings>) => {
    current = { ...read(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* private mode */
    }
    listeners.forEach((f) => f());
  }, []);
  return [settings, update];
}

export function micConstraints(s: MicSettings): MediaTrackConstraints {
  return {
    ...(s.deviceId && s.deviceId !== "default" ? { deviceId: { exact: s.deviceId } } : {}),
    echoCancellation: s.echoCancellation,
    noiseSuppression: s.noiseSuppression,
    autoGainControl: s.autoGainControl,
  };
}

/**
 * Opens the chosen mic. If that device is gone (unplugged), falls back to the
 * system default rather than failing.
 */
export async function openMic(s: MicSettings): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: micConstraints(s) });
  } catch (e) {
    const name = (e as DOMException)?.name;
    if ((name === "OverconstrainedError" || name === "NotFoundError") && s.deviceId !== "default") {
      return navigator.mediaDevices.getUserMedia({ audio: micConstraints({ ...s, deviceId: "default" }) });
    }
    throw e;
  }
}

export function micError(e: unknown): string {
  const name = (e as DOMException)?.name;
  if (name === "NotAllowedError" || name === "SecurityError") return "Microphone access is blocked. Allow it from the lock icon in the address bar.";
  if (name === "NotFoundError") return "No microphone found. Plug one in and try again.";
  if (name === "NotReadableError") return "Your microphone is busy in another app. Close it there and try again.";
  return "Couldn't open the microphone.";
}

export type AudioDevice = { deviceId: string; label: string };

/** Audio inputs. Labels only appear after mic permission has been granted once. */
export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const all = await navigator.mediaDevices.enumerateDevices();
    const inputs = all.filter((d) => d.kind === "audioinput");
    const list = inputs.map((d, i) => ({ deviceId: d.deviceId || "default", label: d.label || `Microphone ${i + 1}` }));
    // Chrome lists "default" itself; other browsers need it added.
    if (!list.some((d) => d.deviceId === "default")) list.unshift({ deviceId: "default", label: "System default" });
    setDevices(list);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial device scan
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
  }, [refresh]);
  return { devices, refresh };
}

/** Live input level (0-1) of a stream, for meters, plus the loudest level seen. */
export function useLevel(stream: MediaStream | null) {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  useEffect(() => {
    if (!stream) return;
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) sum += v * v;
      const rms = Math.sqrt(sum / buf.length);
      // Speech sits around 0.02-0.2 RMS; scale so normal talking fills most of the meter.
      const target = Math.min(1, rms * 6);
      smooth = target > smooth ? target : smooth * 0.85 + target * 0.15;
      setLevel(smooth);
      setPeak((p) => (smooth > p ? smooth : p));
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      src.disconnect();
      ctx.close();
      setLevel(0);
      setPeak(0);
    };
  }, [stream]);
  return { level, peak };
}

export function stopStream(s: MediaStream | null) {
  s?.getTracks().forEach((t) => t.stop());
}
