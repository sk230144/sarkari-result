"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { micError, openMic, stopStream, type MicSettings } from "./mic";

const MUTE_KEY = "mi-muted";

/** Reads questions aloud with the browser's own voice. */
export function useSpeaker() {
  const [muted, setMutedState] = useState(() => {
    try {
      return typeof window !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const voice = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (!supported) return;
    const pick = () => {
      const voices = speechSynthesis.getVoices();
      voice.current =
        voices.find((v) => /en-IN/i.test(v.lang) && /google|natural|neural/i.test(v.name)) ??
        voices.find((v) => /en-(US|GB)/i.test(v.lang) && /google|natural|neural|samantha/i.test(v.name)) ??
        voices.find((v) => /^en/i.test(v.lang)) ??
        null;
    };
    pick();
    speechSynthesis.addEventListener("voiceschanged", pick);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", pick);
      speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, force = false) => {
      if (!supported || (muted && !force)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice.current) u.voice = voice.current;
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      speechSynthesis.speak(u);
    },
    [supported, muted],
  );

  const setMuted = useCallback(
    (m: boolean) => {
      setMutedState(m);
      try {
        localStorage.setItem(MUTE_KEY, m ? "1" : "0");
      } catch {
        /* private mode */
      }
      if (m) stop();
    },
    [stop],
  );

  return { supported, muted, setMuted, speaking, speak, stop };
}

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  /** Recent Chrome/Edge accept an audio track here; older ones ignore it and use the default mic. */
  start: (track?: MediaStreamTrack) => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

/**
 * Speech-to-text with the browser's free recogniser. Final phrases go to
 * `onFinal`; the live phrase is in `interim`. `stream` is the open mic, for a
 * level meter.
 */
export function useDictation(onFinal: (text: string) => void, mic: MicSettings) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const rec = useRef<Recognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const want = useRef(false);
  const final = useRef(onFinal);
  const micRef = useRef(mic);
  useEffect(() => {
    final.current = onFinal;
    micRef.current = mic;
  }, [onFinal, mic]);

  const Ctor =
    typeof window !== "undefined"
      ? ((window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition })
          .SpeechRecognition ??
        (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition)
      : undefined;
  const supported = Boolean(Ctor);

  const release = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    setStream(null);
  }, []);

  const stop = useCallback(() => {
    want.current = false;
    rec.current?.stop();
    release();
    setListening(false);
    setInterim("");
  }, [release]);

  const start = useCallback(async () => {
    if (!Ctor) return;
    setError(null);

    // Open the chosen mic with the chosen processing. This also asks for
    // permission up front, with a clear message if it's blocked.
    let track: MediaStreamTrack | undefined;
    try {
      const s = await openMic(micRef.current);
      streamRef.current = s;
      setStream(s);
      track = s.getAudioTracks()[0];
    } catch (e) {
      setError(micError(e));
      return;
    }

    const r = new Ctor();
    r.lang = "en-IN";
    r.continuous = true;
    r.interimResults = true;
    const begin = () => {
      try {
        r.start(track);
      } catch {
        r.start();
      }
    };
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) final.current(res[0].transcript.trim());
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      want.current = false;
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Microphone access was blocked. Allow it in your browser's site settings."
          : e.error === "network"
            ? "Voice typing needs an internet connection in this browser. Type your answer instead."
            : "Voice input stopped. Try again or type your answer.",
      );
    };
    // Chrome ends a session after a pause; keep going until the user stops.
    r.onend = () => {
      if (want.current) {
        try {
          begin();
          return;
        } catch {
          /* fall through */
        }
      }
      release();
      setListening(false);
      setInterim("");
    };
    rec.current = r;
    want.current = true;
    try {
      begin();
      setListening(true);
    } catch {
      release();
      setError("Couldn't start the microphone.");
    }
  }, [Ctor, release]);

  useEffect(
    () => () => {
      want.current = false;
      rec.current?.abort();
      stopStream(streamRef.current);
    },
    [],
  );

  return { supported, listening, interim, error, stream, start, stop };
}
