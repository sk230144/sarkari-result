"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ProfileData, ProfileExtras } from "@/lib/profile/types";

type Toast = { kind: "ok" | "error"; text: string } | null;

type EditorApi = {
  profile: ProfileData;
  extras: ProfileExtras;
  setProfile: (p: ProfileData) => void;
  setExtras: (fn: (e: ProfileExtras) => ProfileExtras) => void;
  /** Optimistic update: applied at once, rolled back if the server says no. */
  save: (patch: Partial<ProfileData>, okText?: string) => Promise<boolean>;
  /** For multipart/other endpoints that return { profile }. */
  send: (url: string, init: RequestInit, okText?: string) => Promise<boolean>;
  toast: (kind: "ok" | "error", text: string) => void;
  saving: boolean;
};

const Ctx = createContext<EditorApi | null>(null);

export function useEditor(): EditorApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEditor outside ProfileEditorProvider");
  return v;
}

export function ProfileEditorProvider({
  initial,
  initialExtras,
  children,
}: {
  initial: ProfileData;
  initialExtras: ProfileExtras;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState(initial);
  const [extras, setExtrasState] = useState(initialExtras);
  const [saving, setSaving] = useState(false);
  const [toastState, setToast] = useState<Toast>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef(profile);
  useEffect(() => {
    latest.current = profile;
  }, [profile]);

  const toast = useCallback((kind: "ok" | "error", text: string) => {
    setToast({ kind, text });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), kind === "error" ? 5000 : 2200);
  }, []);

  const send = useCallback(
    async (url: string, init: RequestInit, okText?: string) => {
      setSaving(true);
      try {
        const res = await fetch(url, init);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
        if (json.profile) setProfile(json.profile);
        if (json.warning) toast("error", json.warning);
        else if (okText) toast("ok", okText);
        return true;
      } catch (e) {
        toast("error", e instanceof Error ? e.message : "Something went wrong.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [toast],
  );

  const save = useCallback(
    async (patch: Partial<ProfileData>, okText = "Saved") => {
      const before = latest.current;
      setProfile({ ...before, ...patch });
      const ok = await send(
        "/api/profile",
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) },
        okText,
      );
      if (!ok) setProfile(before);
      return ok;
    },
    [send],
  );

  const setExtras = useCallback((fn: (e: ProfileExtras) => ProfileExtras) => setExtrasState(fn), []);

  return (
    <Ctx.Provider value={{ profile, extras, setProfile, setExtras, save, send, toast, saving }}>
      {children}
      {toastState && (
        <div
          role="status"
          className={`cl-fade fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold shadow-2xl ${
            toastState.kind === "ok"
              ? "border-[var(--color-c-lime)]/40 bg-[#16210f] text-[var(--color-c-lime)]"
              : "border-red-500/40 bg-[#2d1416] text-red-300"
          }`}
        >
          {toastState.text}
        </div>
      )}
    </Ctx.Provider>
  );
}
