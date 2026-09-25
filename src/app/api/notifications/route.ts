import { NextResponse } from "next/server";
import { getSessionUser, serviceDb } from "@/lib/server-auth";
import type { Notification } from "@/lib/notification-types";

export const dynamic = "force-dynamic";

const LOOKBACK_DAYS = 30;

/**
 * The bell's feed, assembled from events that already exist:
 * messages and endorsements received, profile views (one entry per day)
 * and friends who joined with the user's invite link.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const db = serviceDb();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();

  const [profile, messages, endorsements, views, referrals] = await Promise.all([
    db.from("profiles").select("notifications_seen_at").eq("id", user.id).maybeSingle(),
    db
      .from("profile_messages")
      .select("id, sender_name, body, created_at")
      .eq("profile_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(30),
    db
      .from("endorsements")
      .select("id, author_name, relationship, created_at")
      .eq("profile_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(30),
    db.from("profile_views").select("day, created_at").eq("profile_id", user.id).gte("created_at", since).limit(5000),
    db
      .from("profiles")
      .select("id, full_name, created_at")
      .eq("referred_by", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const seenAt = (profile.data?.notifications_seen_at as string | null) ?? null;
  const items: Notification[] = [];

  for (const m of messages.data ?? []) {
    items.push({
      id: `msg-${m.id}`,
      type: "message",
      title: `${m.sender_name} sent you a message`,
      body: String(m.body).replace(/\s+/g, " ").slice(0, 120),
      at: m.created_at,
      href: "/profile#inbox",
    });
  }
  for (const e of endorsements.data ?? []) {
    items.push({
      id: `end-${e.id}`,
      type: "endorsement",
      title: `${e.author_name} endorsed you`,
      body: e.relationship,
      at: e.created_at,
      href: "/profile#endorsements",
    });
  }

  // Views are anonymous, so they are grouped: one entry per day.
  const byDay = new Map<string, { count: number; last: string }>();
  for (const v of views.data ?? []) {
    const d = byDay.get(v.day) ?? { count: 0, last: v.created_at };
    d.count++;
    if (v.created_at > d.last) d.last = v.created_at;
    byDay.set(v.day, d);
  }
  for (const [day, { count, last }] of byDay) {
    items.push({
      id: `views-${day}`,
      type: "view",
      title: `${count} ${count === 1 ? "person" : "people"} viewed your profile`,
      body: null,
      at: last,
      href: "/profile",
    });
  }

  for (const r of referrals.data ?? []) {
    items.push({
      id: `ref-${r.id}`,
      type: "referral",
      title: `${r.full_name || "A friend"} joined with your invite link`,
      body: null,
      at: r.created_at,
      href: "/profile",
    });
  }

  items.sort((a, b) => b.at.localeCompare(a.at));
  const list = items.slice(0, 40).map((n) => ({ ...n, unread: !seenAt || n.at > seenAt }));

  return NextResponse.json(
    { items: list, unread: list.filter((n) => n.unread).length },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Marks everything up to now as seen. */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  await serviceDb().from("profiles").update({ notifications_seen_at: new Date().toISOString() }).eq("id", user.id);
  return NextResponse.json({ ok: true });
}
