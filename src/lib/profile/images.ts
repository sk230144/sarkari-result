import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Detects the image type from magic bytes, so a renamed file can't pose as an image. */
export function imageType(b: Buffer): { ext: string; mime: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: "png", mime: "image/png" };
  }
  if (b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

/** Deletes every file directly under `folder` in the avatars bucket except `keep`. */
export async function clearImages(db: SupabaseClient, folder: string, keep?: string) {
  const { data: files } = await db.storage.from("avatars").list(folder);
  const stale = (files ?? [])
    .filter((f) => f.id) // skip sub-folder placeholders
    .map((f) => `${folder}/${f.name}`)
    .filter((p) => p !== keep);
  if (stale.length) await db.storage.from("avatars").remove(stale);
}

export const bannerFolder = (userId: string) => `banners/${userId}`;
