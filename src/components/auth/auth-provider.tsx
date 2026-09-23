"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

type AuthState = {
  user: User | null;
  session: Session | null;
  /** True until the first session check resolves — not "signed out". */
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

/**
 * Holds the signed-in reader for the whole app.
 *
 * `loading` matters: on first paint Supabase has not yet read the session
 * from storage, so treating "no user yet" as "signed out" would flash the
 * logged-out UI at someone who is in fact logged in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    // Fires on sign-in, sign-out, token refresh and cross-tab changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const value = useMemo(
    () => ({ user: session?.user ?? null, session, loading, signOut }),
    [session, loading, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
