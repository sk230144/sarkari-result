import config from "../config/env.js";

/** §14.2 — retry only transient failures, with bounded backoff. */
const RETRY_DELAYS_MS = [1_000, 4_000, 10_000];
const TRANSIENT_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.transient = status === undefined || TRANSIENT_STATUS.has(status);
  }
}

/**
 * GET with timeout, descriptive User-Agent and bounded retries.
 * Non-transient failures (404, 403) throw immediately — retrying them
 * would just burn a provider's rate limit.
 */
export async function fetchJson(url, { headers = {}, attempt = 1 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.http.timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": config.http.userAgent,
        Accept: "application/json",
        ...headers,
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!res.ok) throw new HttpError(`GET ${url} -> ${res.status}`, res.status);
    return await res.json();
  } catch (err) {
    const e =
      err instanceof HttpError
        ? err
        : new HttpError(`GET ${url} -> ${err.message}`, undefined);

    if (e.transient && attempt < config.http.maxAttempts) {
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 10_000);
      return fetchJson(url, { headers, attempt: attempt + 1 });
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Same rules, but returns raw text — used by the RSS adapters. */
export async function fetchText(url, { headers = {}, attempt = 1 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.http.timeoutMs);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": config.http.userAgent,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        ...headers,
      },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) throw new HttpError(`GET ${url} -> ${res.status}`, res.status);
    return await res.text();
  } catch (err) {
    const e =
      err instanceof HttpError
        ? err
        : new HttpError(`GET ${url} -> ${err.message}`, undefined);
    if (e.transient && attempt < config.http.maxAttempts) {
      await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 10_000);
      return fetchText(url, { headers, attempt: attempt + 1 });
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs tasks with a concurrency cap (§14.2) and never rejects — a single
 * failure must not abort the batch, so each result carries its own status.
 */
export async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        results[i] = { ok: true, value: await fn(items[i], i) };
      } catch (error) {
        results[i] = { ok: false, error };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}
