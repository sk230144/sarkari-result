import "server-only";

/** Input limits for POST /api/desktop/chat. Everything is checked before Gemini is called. */
export const LIMITS = {
  bodyBytes: 1.5 * 1024 * 1024,
  messageChars: 8000,
  historyItems: 6,
  historyItemChars: 4000,
  historyTotalChars: 12000,
  imageBytes: 800 * 1024,
  /** Long side / short side, so a portrait capture of the same size also fits. */
  imageLong: 1280,
  imageShort: 720,
} as const;

const MIMES = ["image/jpeg", "image/webp"] as const;
type Mime = (typeof MIMES)[number];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

export type ChatInput = {
  requestId: string;
  deviceId: string;
  appVersion: string;
  text: string;
  image: { mimeType: Mime; data: string; width: number; height: number } | null;
  history: { role: "user" | "assistant"; text: string }[];
};

export class InputError extends Error {
  constructor(
    public code: "INVALID_REQUEST" | "PAYLOAD_TOO_LARGE",
    message: string,
  ) {
    super(message);
  }
}
const bad = (m: string) => new InputError("INVALID_REQUEST", m);
const big = (m: string) => new InputError("PAYLOAD_TOO_LARGE", m);

/** The requestId, if the body has a valid one; used to echo it on early errors. */
export function peekRequestId(body: unknown): string | null {
  const id = (body as { requestId?: unknown } | null)?.requestId;
  return typeof id === "string" && UUID.test(id) ? id.toLowerCase() : null;
}

/** Real pixel size read from the file header (never trusts the declared size). */
export function imageSize(buf: Buffer, mime: Mime): { width: number; height: number } | null {
  if (mime === "image/jpeg") {
    if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      if (marker === 0xff) {
        i++;
        continue;
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
        i += 2;
        continue;
      }
      const len = buf.readUInt16BE(i + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      i += 2 + len;
    }
    return null;
  }
  // WebP: RIFF....WEBP then a VP8 / VP8L / VP8X chunk.
  if (buf.length < 30 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
  return null;
}

function str(v: unknown, field: string, max: number, required = true): string {
  if (v === undefined || v === null) {
    if (required) throw bad(`${field} is required.`);
    return "";
  }
  if (typeof v !== "string") throw bad(`${field} must be a string.`);
  if (v.length > max) throw big(`${field} is too long (max ${max} characters).`);
  return v;
}

/** Parses and checks the whole request. Throws InputError with the right code. */
export function parseChatInput(body: unknown): ChatInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw bad("Body must be a JSON object.");
  const b = body as Record<string, unknown>;

  const requestId = peekRequestId(b);
  if (!requestId) throw bad("requestId must be a UUID.");
  const deviceId = str(b.deviceId, "deviceId", 128).trim();
  if (!deviceId) throw bad("deviceId is required.");
  const appVersion = str(b.appVersion, "appVersion", 32).trim();
  if (!appVersion) throw bad("appVersion is required.");

  const message = b.message as Record<string, unknown> | undefined;
  if (!message || typeof message !== "object") throw bad("message is required.");
  const text = str(message.text, "message.text", LIMITS.messageChars, false).trim();

  // History: latest 3 exchanges, text only (screenshots never travel in history).
  let history: ChatInput["history"] = [];
  if (b.history !== undefined && b.history !== null) {
    if (!Array.isArray(b.history)) throw bad("history must be an array.");
    if (b.history.length > LIMITS.historyItems) throw bad(`history can hold at most ${LIMITS.historyItems} messages.`);
    let total = 0;
    history = b.history.map((h, i) => {
      const item = h as Record<string, unknown> | null;
      if (!item || typeof item !== "object") throw bad(`history[${i}] must be an object.`);
      if (item.role !== "user" && item.role !== "assistant") throw bad(`history[${i}].role must be "user" or "assistant".`);
      const t = str(item.text, `history[${i}].text`, LIMITS.historyItemChars).trim();
      if (!t) throw bad(`history[${i}].text is empty.`);
      total += t.length;
      return { role: item.role, text: t };
    });
    if (total > LIMITS.historyTotalChars) throw big(`history is too long (max ${LIMITS.historyTotalChars} characters in total).`);
  }

  let image: ChatInput["image"] = null;
  if (b.image !== undefined && b.image !== null) {
    const im = b.image as Record<string, unknown>;
    if (typeof im !== "object") throw bad("image must be an object or null.");
    if (!MIMES.includes(im.mimeType as Mime)) throw bad("image.mimeType must be image/jpeg or image/webp.");
    const mimeType = im.mimeType as Mime;
    if (typeof im.data !== "string" || !im.data) throw bad("image.data must be base64 without a data: prefix.");
    if (im.data.startsWith("data:")) throw bad("image.data must not include the data: URL prefix.");
    // Reject by length before decoding anything large.
    if (im.data.length > Math.ceil((LIMITS.imageBytes * 4) / 3) + 4) throw big("Image is larger than 800 KB.");
    if (im.data.length % 4 !== 0 || !BASE64.test(im.data)) throw bad("image.data is not valid base64.");
    const bytes = Buffer.from(im.data, "base64");
    if (bytes.length > LIMITS.imageBytes) throw big("Image is larger than 800 KB.");
    for (const k of ["width", "height"] as const) {
      if (!Number.isInteger(im[k]) || (im[k] as number) < 1) throw bad(`image.${k} must be a positive integer.`);
    }
    const real = imageSize(bytes, mimeType);
    if (!real) throw bad(`image.data is not a valid ${mimeType === "image/jpeg" ? "JPEG" : "WebP"} image.`);
    const long = Math.max(real.width, real.height);
    const short = Math.min(real.width, real.height);
    if (long > LIMITS.imageLong || short > LIMITS.imageShort) {
      throw big(`Image is ${real.width}x${real.height}; the maximum is ${LIMITS.imageLong}x${LIMITS.imageShort}.`);
    }
    image = { mimeType, data: im.data, width: real.width, height: real.height };
  }

  if (!text && !image) throw bad("Send message.text, an image, or both.");
  return { requestId, deviceId, appVersion, text, image, history };
}
