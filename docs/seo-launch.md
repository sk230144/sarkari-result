# Search and sharing rollout

The canonical public origin is https://jobalerts24.com. Search metadata deliberately
does not use NEXT_PUBLIC_SITE_URL, which can point to localhost for authentication.

## After deploying

1. Confirm https://www.jobalerts24.com redirects to https://jobalerts24.com and
   preserves paths and query strings. Vercel domain settings must not redirect in
   the opposite direction. The app now supplies a permanent www-to-apex redirect.
2. Open `/social-image.png`: it must return a 1200 x 630 PNG without login.
   The image uses Next.js's bundled renderer/font and has no external font dependency.
3. Verify the domain in Google Search Console. If using HTML-tag verification,
   set GOOGLE_SITE_VERIFICATION to the supplied content token and redeploy.
   DNS verification also works and does not need an application change.
4. Submit both `sitemap.xml` and `blog/sitemap.xml` in Search Console. The first
   lists public landing/resource pages; the second reads published articles only.
   Private profiles, drafts, accounts and interview sessions are not submitted.
5. Inspect the homepage with URL Inspection, test the live URL, and request indexing.
   Repeat for the jobs page and important product pages. Google controls crawling,
   rankings and snippet selection; requesting indexing cannot guarantee a position
   or immediate removal of the old government-jobs title/description.
6. Fetch the URL again in the sharing platform's preview inspector when available
   (e.g. Facebook Sharing Debugger or LinkedIn Post Inspector). Existing messages
   may retain a cached preview. Send a new link after the platform has refreshed it.

## Local verification

Run `npm run build`, start with `npm run start -- --port 3100`, then run
`npm run check:seo -- http://localhost:3100`. The audit checks the raw HTML received
by a social crawler, canonical URLs, images, structured data, noindex pages,
sitemaps, and the domain redirect. It does not submit URLs to search engines.

## Maintaining visibility

- Keep page titles/descriptions accurate and use `pageMetadata` for new public pages.
- Add new public static pages to `src/app/sitemap.ts`; published blog posts are automatic.
- Publish original, useful interview experiences and job-search guides and link
  them to relevant tools. Track branded and non-branded queries in Search Console.
- JobPosting structured data is intentionally absent from the aggregate jobs page.
  It belongs on individual job-detail pages with complete, current job information.
- Do not use artificial freshness dates, keyword stuffing or unverified ratings.

References:
- https://developers.google.com/search/docs/appearance/snippet
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- https://developers.google.com/search/docs/appearance/site-names
