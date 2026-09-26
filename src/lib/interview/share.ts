import "server-only";
import { randomBytes } from "crypto";
import { serviceDb } from "@/lib/server-auth";
import { INTERVIEW_COLUMNS, rowToInterview } from "./server";
import type { Interview } from "./types";

export const SHARE_TOKEN = /^[A-Za-z0-9]{14}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** 14 chars from a 56-letter alphabet: ~81 bits, not guessable. */
export function newShareToken() {
  const bytes = randomBytes(14);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export type SharedInterview = {
  iv: Interview;
  /** The owner's display name, and their public profile if they have one. */
  by: string | null;
  profileUrl: string | null;
};

/** A report someone has chosen to share, or null if the link is unknown or turned off. */
export async function loadShared(token: string): Promise<SharedInterview | null> {
  if (!SHARE_TOKEN.test(token)) return null;
  const db = serviceDb();
  const { data: row, error } = await db
    .from("mock_interviews")
    .select(`${INTERVIEW_COLUMNS}, user_id`)
    .eq("share_token", token)
    .eq("is_public", true)
    .eq("status", "completed")
    .maybeSingle();
  if (error || !row) return null;

  const { data: profile } = await db.from("profiles").select("full_name, slug, is_public").eq("id", row.user_id).maybeSingle();
  const iv = rowToInterview(row);
  return {
    // Nothing that identifies the account or the resume leaves the server.
    iv: { ...iv, id: "shared", startedAt: iv.completedAt ?? iv.startedAt },
    by: (profile?.full_name as string | null)?.trim() || null,
    profileUrl: profile?.is_public && profile?.slug ? `/u/${profile.slug}` : null,
  };
}
