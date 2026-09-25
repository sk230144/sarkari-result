import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { costUsd } from "./ai-pricing";

/**
 * Who may see the admin section.
 *
 * Kept as a list rather than a single string so a second admin can be added
 * without a code change to the guard itself.
 */
const ADMIN_EMAILS = ["risabht043@gmail.com"];

/**
 * The signed-in reader's email, read from their session cookie on the
 * server.
 *
 * This must stay server-side: a client-side email check is trivially
 * bypassed by editing the JavaScript, so the admin page would leak every
 * user's data to anyone who looked.
 */
export async function currentUserEmail(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const store = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      // A server component cannot set cookies; refresh happens client-side.
      setAll: () => {},
    },
  });

  // getUser() verifies the JWT against Supabase rather than trusting the
  // cookie's contents, which is what makes this safe to gate on.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email ?? null;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}

export async function isAdmin(): Promise<boolean> {
  return isAdminEmail(await currentUserEmail());
}

/**
 * Service-role client for admin queries.
 *
 * Only ever called after isAdmin() has passed. It bypasses RLS, which is
 * the point — the admin view reads across all users, which no ordinary
 * session is permitted to do.
 */
export function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service credentials missing.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** What one user did in one section. */
export type UserSection = {
  section: string;
  views: number;
  seconds: number;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  /** Total visible seconds across every recorded page view. */
  totalSeconds: number;
  pageViews: number;
  hasResume: boolean;
  /** Busiest sections first, so the table can show what they actually use. */
  sections: UserSection[];
  /** Most recent page view, which tracks activity more closely than logins. */
  lastSeenAt: string | null;
  ai: AiTotals;
};

export type AiTotals = {
  calls: number;
  input: number;
  output: number;
  thinking: number;
  costUsd: number;
  lastCallAt: string | null;
};

export type AiKindStat = AiTotals & { kind: string; users: number };

function emptyAi(): AiTotals {
  return { calls: 0, input: 0, output: 0, thinking: 0, costUsd: 0, lastCallAt: null };
}

export type SectionStat = {
  section: string;
  views: number;
  totalSeconds: number;
  uniqueUsers: number;
};

/** Everything the admin page renders, in one server-side pass. */
export async function getAdminData(): Promise<{
  users: AdminUser[];
  sections: SectionStat[];
  totals: {
    users: number;
    signedInLast7d: number;
    views: number;
    trackedHours: number;
  };
  ai: {
    /** False until migration 0008 has created the ai_usage table. */
    ready: boolean;
    totals: AiTotals;
    last24h: AiTotals;
    byKind: AiKindStat[];
  };
}> {
  const db = adminDb();

  // Auth users come from the admin API, not a table — this is where
  // last_sign_in_at lives.
  const { data: authList } = await db.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const { data: profiles } = await db
    .from("profiles")
    .select("id, full_name, resume_path");

  const { data: views } = await db
    .from("page_views")
    .select("user_id, section, duration_s, created_at")
    .order("created_at", { ascending: false })
    .limit(50000);

  const { data: usage, error: usageError } = await db
    .from("ai_usage")
    .select("user_id, kind, model, input_tokens, output_tokens, thinking_tokens, created_at")
    .order("created_at", { ascending: false })
    .limit(50000);

  const profileById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p]),
  );

  const aiByUser = new Map<string, AiTotals>();
  const aiByKind = new Map<string, AiTotals & { users: Set<string> }>();
  const aiTotals = emptyAi();
  const aiDay = emptyAi();
  const dayAgo = Date.now() - 86_400_000;

  const add = (t: AiTotals, input: number, output: number, thinking: number, cost: number, at: string) => {
    t.calls += 1;
    t.input += input;
    t.output += output;
    t.thinking += thinking;
    t.costUsd += cost;
    // Rows arrive newest-first.
    if (!t.lastCallAt) t.lastCallAt = at;
  };

  for (const r of usage ?? []) {
    const input = (r.input_tokens as number) ?? 0;
    const output = (r.output_tokens as number) ?? 0;
    const thinking = (r.thinking_tokens as number) ?? 0;
    const at = r.created_at as string;
    const cost = costUsd(r.model as string, input, output, thinking);

    const u = aiByUser.get(r.user_id as string) ?? emptyAi();
    add(u, input, output, thinking, cost, at);
    aiByUser.set(r.user_id as string, u);

    const k = aiByKind.get(r.kind as string) ?? { ...emptyAi(), users: new Set<string>() };
    add(k, input, output, thinking, cost, at);
    k.users.add(r.user_id as string);
    aiByKind.set(r.kind as string, k);

    add(aiTotals, input, output, thinking, cost, at);
    if (Date.parse(at) > dayAgo) add(aiDay, input, output, thinking, cost, at);
  }

  // Fold the view rows into per-user and per-section totals in one pass.
  const perUser = new Map<
    string,
    {
      seconds: number;
      views: number;
      lastSeen: string | null;
      sections: Map<string, { views: number; seconds: number }>;
    }
  >();
  const perSection = new Map<
    string,
    { views: number; seconds: number; users: Set<string> }
  >();

  for (const v of views ?? []) {
    const secs = (v.duration_s as number | null) ?? 0;

    const sectionName = (v.section as string) || "unknown";

    if (v.user_id) {
      const u =
        perUser.get(v.user_id) ??
        { seconds: 0, views: 0, lastSeen: null, sections: new Map() };
      u.seconds += secs;
      u.views += 1;
      // Rows arrive newest-first, so the first one seen is the latest.
      if (!u.lastSeen) u.lastSeen = v.created_at as string;

      const us = u.sections.get(sectionName) ?? { views: 0, seconds: 0 };
      us.views += 1;
      us.seconds += secs;
      u.sections.set(sectionName, us);

      perUser.set(v.user_id, u);
    }

    const key = sectionName;
    const s = perSection.get(key) ?? { views: 0, seconds: 0, users: new Set() };
    s.views += 1;
    s.seconds += secs;
    if (v.user_id) s.users.add(v.user_id as string);
    perSection.set(key, s);
  }

  const users: AdminUser[] = (authList?.users ?? []).map((u) => {
    const p = profileById.get(u.id);
    const stats = perUser.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "(no email)",
      fullName: (p?.full_name as string | null) ?? null,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      totalSeconds: stats?.seconds ?? 0,
      pageViews: stats?.views ?? 0,
      hasResume: Boolean(p?.resume_path),
      lastSeenAt: stats?.lastSeen ?? null,
      sections: [...(stats?.sections ?? new Map()).entries()]
        .map(([section, s]) => ({
          section,
          views: s.views,
          seconds: s.seconds,
        }))
        .sort((a, b) => b.views - a.views),
      ai: aiByUser.get(u.id) ?? emptyAi(),
    };
  });

  // Most recently active first — the useful default for this view.
  users.sort((a, b) => {
    const at = a.lastSignInAt ? Date.parse(a.lastSignInAt) : 0;
    const bt = b.lastSignInAt ? Date.parse(b.lastSignInAt) : 0;
    return bt - at;
  });

  const sections: SectionStat[] = [...perSection.entries()]
    .map(([section, s]) => ({
      section,
      views: s.views,
      totalSeconds: s.seconds,
      uniqueUsers: s.users.size,
    }))
    .sort((a, b) => b.views - a.views);

  const weekAgo = Date.now() - 7 * 86_400_000;
  const totalSeconds = sections.reduce((n, s) => n + s.totalSeconds, 0);

  return {
    users,
    sections,
    totals: {
      users: users.length,
      signedInLast7d: users.filter(
        (u) => u.lastSignInAt && Date.parse(u.lastSignInAt) > weekAgo,
      ).length,
      views: (views ?? []).length,
      trackedHours: Math.round((totalSeconds / 3600) * 10) / 10,
    },
    ai: {
      ready: !usageError,
      totals: aiTotals,
      last24h: aiDay,
      byKind: [...aiByKind.entries()]
        .map(([kind, k]) => ({ ...k, kind, users: k.users.size }))
        .sort((a, b) => b.costUsd - a.costUsd),
    },
  };
}
