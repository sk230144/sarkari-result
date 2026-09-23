"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useAuth } from "@/components/auth/auth-provider";

/**
 * Items are keyed by string so the same hook serves both shapes of sheet:
 * the DSA and FAANG sheets number their questions ("1", "2", …), the
 * System Design sheet uses slugs ("rate-limiter").
 */
export type ItemKey = string;

export type ProgressState = {
  done: ItemKey[];
  notes: Record<ItemKey, string>;
};

type Status = "loading" | "ready" | "error";

const storageKeys = (sheetKey: string) => ({
  done: `${sheetKey}-done`,
  notes: `${sheetKey}-notes`,
});

/** localStorage can throw (private mode, blocked storage) — never break render. */
function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or blocked — progress just won't persist locally */
  }
}

/** Numbered sheets also fill question_n; slug-based ones leave it null. */
function numericOrNull(key: ItemKey): number | null {
  const n = Number(key);
  return Number.isInteger(n) && String(n) === key ? n : null;
}

/**
 * Sheet progress, stored in Supabase for signed-in readers and in
 * localStorage for everyone else.
 *
 * Both paths are kept because a visitor should be able to tick items
 * before deciding to make an account — and when they do sign in, whatever
 * they ticked is merged up rather than thrown away.
 *
 * Writes are optimistic: the checkbox flips immediately and the row is
 * upserted in the background, because a tick that waits on a round-trip
 * feels broken.
 */
export function useSheetProgress(sheetKey: string) {
  const { user, loading: authLoading } = useAuth();
  const supabase = supabaseBrowser();

  const [state, setState] = useState<ProgressState>({ done: [], notes: {} });
  const [status, setStatus] = useState<Status>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keys = storageKeys(sheetKey);
  // Guards the one-time merge so a re-render can't run it twice.
  const mergedRef = useRef(false);

  useEffect(() => {
    // Wait for auth to settle; loading local data first would flash the
    // wrong progress at a signed-in reader.
    if (authLoading) return;

    let active = true;

    async function load() {
      // ---- signed out: local only ----
      if (!user) {
        if (!active) return;
        setState({
          // Older builds stored numbers; normalise so both read the same.
          done: readLocal<(string | number)[]>(keys.done, []).map(String),
          notes: Object.fromEntries(
            Object.entries(
              readLocal<Record<string, string>>(keys.notes, {}),
            ).map(([k, v]) => [String(k), v]),
          ),
        });
        setStatus("ready");
        return;
      }

      // ---- signed in: Supabase is the source of truth ----
      const { data, error } = await supabase
        .from("sheet_progress")
        .select("item_key, solved, note")
        .eq("sheet_key", sheetKey);

      if (!active) return;

      if (error) {
        setError(error.message);
        setStatus("error");
        return;
      }

      const done: ItemKey[] = [];
      const notes: Record<ItemKey, string> = {};
      for (const row of data ?? []) {
        const k = String(row.item_key);
        if (row.solved) done.push(k);
        if (row.note) notes[k] = row.note;
      }

      // First sign-in on this device: fold in anything ticked while logged
      // out, then clear the local copy so it cannot resurrect later.
      if (!mergedRef.current) {
        mergedRef.current = true;
        const localDone = readLocal<(string | number)[]>(keys.done, []).map(String);
        const localNotes = Object.fromEntries(
          Object.entries(readLocal<Record<string, string>>(keys.notes, {})).map(
            ([k, v]) => [String(k), v],
          ),
        );
        const unsynced = localDone.filter((k) => !done.includes(k));
        const unsyncedNotes = Object.entries(localNotes).filter(
          ([k]) => !notes[k],
        );

        if (unsynced.length || unsyncedNotes.length) {
          const rows = [
            ...unsynced.map((k) => ({
              user_id: user.id,
              sheet_key: sheetKey,
              item_key: k,
              question_n: numericOrNull(k),
              solved: true,
              note: localNotes[k] ?? null,
            })),
            ...unsyncedNotes
              .filter(([k]) => !unsynced.includes(k))
              .map(([k, note]) => ({
                user_id: user.id,
                sheet_key: sheetKey,
                item_key: k,
                question_n: numericOrNull(k),
                solved: false,
                note,
              })),
          ];

          const { error: mergeErr } = await supabase
            .from("sheet_progress")
            .upsert(rows, { onConflict: "user_id,sheet_key,item_key" });

          if (!mergeErr) {
            for (const k of unsynced) done.push(k);
            for (const [k, note] of unsyncedNotes) notes[k] = note;
            try {
              localStorage.removeItem(keys.done);
              localStorage.removeItem(keys.notes);
            } catch {
              /* nothing to clean up */
            }
          }
        }
      }

      if (!active) return;
      setState({ done, notes });
      setStatus("ready");
    }

    load();
    return () => {
      active = false;
    };
  }, [user, authLoading, sheetKey, supabase, keys.done, keys.notes]);

  /** Writes one item's row, or removes it when nothing is left to store. */
  const persist = useCallback(
    async (itemKey: ItemKey, solved: boolean, note: string | null) => {
      if (!user) {
        // Signed out: the effect below mirrors state into localStorage.
        return;
      }
      setSaving(true);
      try {
        if (!solved && !note) {
          // Neither flag nor note — drop the row rather than keep an empty one.
          await supabase
            .from("sheet_progress")
            .delete()
            .eq("sheet_key", sheetKey)
            .eq("item_key", itemKey);
        } else {
          const { error } = await supabase.from("sheet_progress").upsert(
            {
              user_id: user.id,
              sheet_key: sheetKey,
              item_key: itemKey,
              question_n: numericOrNull(itemKey),
              solved,
              note,
            },
            { onConflict: "user_id,sheet_key,item_key" },
          );
          if (error) throw error;
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save.");
      } finally {
        setSaving(false);
      }
    },
    [user, supabase, sheetKey],
  );

  const toggle = useCallback(
    (item: ItemKey | number) => {
      const key = String(item);
      setState((prev) => {
        const isDone = prev.done.includes(key);
        const done = isDone
          ? prev.done.filter((k) => k !== key)
          : [...prev.done, key];
        // Fire-and-forget: the UI has already moved.
        void persist(key, !isDone, prev.notes[key] ?? null);
        return { ...prev, done };
      });
    },
    [persist],
  );

  const setNote = useCallback(
    (item: ItemKey | number, text: string) => {
      const key = String(item);
      setState((prev) => {
        const notes = { ...prev.notes };
        const trimmed = text.trim();
        if (trimmed) notes[key] = trimmed;
        else delete notes[key];
        void persist(key, prev.done.includes(key), trimmed || null);
        return { ...prev, notes };
      });
    },
    [persist],
  );

  const reset = useCallback(async () => {
    setState({ done: [], notes: {} });
    if (user) {
      setSaving(true);
      await supabase.from("sheet_progress").delete().eq("sheet_key", sheetKey);
      setSaving(false);
    }
    try {
      localStorage.removeItem(keys.done);
      localStorage.removeItem(keys.notes);
    } catch {
      /* nothing to clean up */
    }
  }, [user, supabase, sheetKey, keys.done, keys.notes]);

  // Signed-out readers keep their progress in localStorage.
  useEffect(() => {
    if (status !== "ready" || user) return;
    writeLocal(keys.done, state.done);
    writeLocal(keys.notes, state.notes);
  }, [state, status, user, keys.done, keys.notes]);

  return {
    done: state.done,
    notes: state.notes,
    status,
    saving,
    error,
    /** True when progress lives in the database rather than this browser. */
    synced: Boolean(user),
    toggle,
    setNote,
    reset,
  };
}
