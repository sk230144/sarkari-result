import assert from "node:assert/strict";
import http from "node:http";
import https from "node:https";

const origin = new URL(process.argv[2] || "http://localhost:3100").origin;
const canonicalOrigin = "https://jobalerts24.com";
const headers = { "user-agent": "facebookexternalhit/1.1" };
let checks = 0;

function check(condition, message) {
  assert.ok(condition, message);
  checks++;
}

async function request(path, options = {}) {
  return fetch(new URL(path, origin), { headers, signal: AbortSignal.timeout(30000), ...options });
}

const decode = (s) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#x27;", "'");
function attribute(tag, name) {
  return decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1] ?? "");
}
function meta(html, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([t]) => t)
    .find((t) => attribute(t, "name") === name || attribute(t, "property") === name);
  return tag ? attribute(tag, "content") : "";
}
function canonical(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)].map(([t]) => t)
    .find((t) => attribute(t, "rel") === "canonical");
  return tag ? attribute(tag, "href") : "";
}

async function page(path, { noindex = false, article = false } = {}) {
  const response = await request(path);
  check(response.status === 200, `${path}: HTTP ${response.status}`);
  const html = await response.text();
  const head = html.split("</head>")[0];
  const expectedUrl = `${canonicalOrigin}${path}`;
  check(Boolean(canonical(head)) && new URL(canonical(head)).href === new URL(expectedUrl).href, `${path}: wrong/missing canonical`);
  check(meta(head, "og:url") === canonical(head), `${path}: sharing URL differs from canonical`);
  check(meta(head, "description").length > 20, `${path}: missing description`);
  check(meta(head, "og:title").length > 0, `${path}: missing social title in initial head`);
  check(meta(head, "og:description") === meta(head, "description"), `${path}: inconsistent description`);
  check(meta(head, "og:image").startsWith("https://"), `${path}: missing absolute social image URL`);
  check(meta(head, "twitter:card") === "summary_large_image", `${path}: wrong Twitter card`);
  check(Boolean(meta(head, "twitter:image")), `${path}: missing Twitter image`);
  check(meta(head, "robots").includes("noindex") === noindex, `${path}: incorrect indexing directive`);
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    check(Boolean(JSON.parse(match[1])), `${path}: invalid JSON-LD`);
  }
  if (article) check(html.includes('"@type":"BlogPosting"'), `${path}: missing article schema`);
  if (path === "/") check(html.includes('"@type":"WebSite"'), "Homepage: missing site-name schema");
  console.log(`PASS ${path}`);
}

const robots = await request("/robots.txt");
check(robots.status === 200, "robots.txt must return 200");
const rules = await robots.text();
check(rules.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), "Missing public sitemap declaration");
check(rules.includes(`Sitemap: ${canonicalOrigin}/blog/sitemap.xml`), "Missing article sitemap declaration");
check(!/^Disallow: \/\s*$/m.test(rules), "Crawling is globally blocked");

const sitemapResponse = await request("/sitemap.xml");
check(sitemapResponse.status === 200, "Public sitemap must return 200");
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
check(urls.length >= 30, "Public sitemap unexpectedly empty/incomplete");
check(new Set(urls).size === urls.length, "Duplicate sitemap URLs");
check(urls.every((url) => url.startsWith(canonicalOrigin + "/")), "Sitemap contains wrong origin");
check(!urls.some((url) => /\/(admin|profile|login|signup|payments|task-board)(\/|$)/.test(url)), "Private page in sitemap");
// Limit simultaneous requests while checking every public page.
for (let i = 0; i < urls.length; i += 4) {
  await Promise.all(urls.slice(i, i + 4).map((url) => page(new URL(url).pathname)));
}
await page("/login", { noindex: true });
await page("/signup", { noindex: true });
await page("/task-board", { noindex: true });
await page("/jobs?q=engineer", { noindex: true });
await page("/jobs?page=2");

const blogResponse = await request("/blog/sitemap.xml");
check(blogResponse.status === 200, "Article sitemap must return 200");
const blogXml = await blogResponse.text();
const articles = [...blogXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decode(m[1]));
check(articles.every((url) => url.startsWith(`${canonicalOrigin}/blog/`)), "Invalid article sitemap URL");
if (articles.length) await page(new URL(articles[0]).pathname, { article: true });

const png = await request("/social-image.png");
check(png.status === 200 && png.headers.get("content-type")?.includes("image/png"), "Social image must return a public PNG");
const image = Buffer.from(await png.arrayBuffer());
check(image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "Invalid PNG signature");
check(image.readUInt32BE(16) === 1200 && image.readUInt32BE(20) === 630, "Wrong social image dimensions");

// Node's fetch ignores Host overrides; use the HTTP client to exercise host routing.
const redirect = await new Promise((resolve, reject) => {
  const transport = origin.startsWith("https:") ? https : http;
  const req = transport.get(`${origin}/jobs?q=engineer`, {
    headers: { ...headers, host: "www.jobalerts24.com" },
    timeout: 30000,
  }, (res) => {
    res.resume();
    resolve({ status: res.statusCode, location: res.headers.location });
  });
  req.on("error", reject);
  req.on("timeout", () => req.destroy(new Error("Redirect check timed out")));
});
check(redirect.status === 308, "www must permanently redirect");
check(redirect.location === `${canonicalOrigin}/jobs?q=engineer`, "Redirect lost path/query");
const missing = await request("/seo-nonexistent-page-check");
check(missing.status === 404, "Missing pages must return HTTP 404");
console.log(`SEO audit passed: ${checks} checks, ${urls.length} public pages, ${articles.length} published articles in sitemap.`);
