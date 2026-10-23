# Astoria SEO implementation — October 22–23, 2026

Scope: the single Astoria–Ditmars store. The website remains at
https://bellamodastudionyc.com. No other store or location page was added.
The existing design, fonts, stylesheet, and original photographs are preserved.

Original WebP photographs are unchanged. Smaller AVIF delivery versions were
subsequently added to reduce transfers while preserving the same photographs.

## Audit findings

- The live homepage canonical, Open Graph URL/image, store-schema URL,
  robots sitemap reference, and sitemap all used the temporary deployment
  origin `https://72aa69e7.bella-moda-studio.pages.dev`.
- Basic `ClothingStore` markup, a title/description, one H1 with ordered
  H2/H3 headings, descriptive image alternatives, WebP/srcset images, a
  prioritized hero image, lazy loading, a map, a Google listing link, and
  crawlable address/phone/seven-day hours already existed.
- The homepage and crawl rules allowed indexing; missing URLs returned a
  real 404. Privacy/terms and the error page intentionally used `noindex`.
- GA4 `G-NRLQQ6BB38` and call, directions, and Google listing click events
  already existed and were retained.
- The optional live Google profile endpoint returned
  `{"connected":false,"reason":"not_configured"}`. The displayed hours are
  owner-confirmed website information, not a verified live Places response.

## Changes

- Fixed the canonical origin in the build, so deployment environment
  variables cannot replace the public domain. This corrects the homepage,
  social sharing URLs, schema, robots.txt, and sitemap together.
- Added the requested homepage title and description, matching Open Graph
  metadata, image dimensions/type, locale, and Twitter card metadata.
- Expanded the existing single Astoria `ClothingStore` entity with a stable
  ID, women's boutique/sample-sale description, regular 11 AM–7 PM daily
  hours, the actual logo/store images, Instagram, the existing Google
  business-profile share link, and an address-based map.
- Kept the existing store name, 29-09 Ditmars Boulevard, Astoria, NY 11105,
  and +1 862-452-8098. Coordinates were omitted because they could not be
  independently verified. No self-serving review/rating markup was added.
- Made one visible paragraph change in the homepage introduction to name
  women's fashion, the boutique/sample sale, Ditmars, Astoria, and Queens
  naturally. Updated one photo's alt text. The heading hierarchy was
  already valid and the branded headings were retained.
- Added unique privacy-page metadata and its clean `/information`
  canonical, retaining its intentional `noindex` and sitemap exclusion.
- If a future authenticated Google profile refresh changes the visible
  hours, obsolete regular-hours markup is removed from the rendered page.
- Added regression coverage for the deployment-origin bug and the single
  Astoria entity, hours, indexability, and heading hierarchy.
- Added AVIF picture sources with 640/full-width candidates, accurate
  hero image sizing, lower priority for inactive slides, and smaller logo
  delivery. The existing WebP images remain as fallbacks. The full-size
  gallery now waits until opened before fetching its original photo.
- Inlined the unchanged homepage stylesheet in production and deferred the
  embedded map until its location container approaches the viewport. The
  same map remains available without JavaScript, and contact information
  and directions links remain directly crawlable HTML.

## Verification and limits

- `npm run check`: all 16 tests passed after delivery changes. This includes the
  build, image/link checks, existing API/analytics tests, and a regression
  build with conflicting preview/stale environment URLs.
- Browser review of the local homepage confirmed the existing layout,
  branding, typography, photographs, and controls were preserved.
- Google Business Profile lookup and Schema Markup Validator presented
  Google's unusual-traffic/human-verification check. Independent Google
  listing consistency and Schema Markup Validator completion remain
  unverified. Do not describe these as passed.
- Search Console sign-in was completed on October 23. The URL-prefix
  property, sitemap submission, live inspection, and indexing request were
  completed as recorded below. Actual inclusion in Google's index and the
  Google-selected canonical remain pending a new indexing cycle.
- Cloudflare successfully deployed the SEO change (`c42c215`), and the live
  homepage, robots.txt, and sitemap were checked: all use the business domain.
- Google's smartphone Rich Results Test crawled the live homepage successfully
  and detected one valid Local Business item and one valid Organization item
  from the same ClothingStore entity. There were no critical errors. Its
  only Local Business warning was the optional `priceRange` field; no
  unverified price range was invented to suppress that warning.
  [Test result](https://search.google.com/test/rich-results/result?id=8rpAB9dKkVz7vRPvcrfKMg).
- The initial mobile PageSpeed test scored 63 performance, 100 accessibility,
  100 best practices, and 100 basic SEO, with 8.1-second LCP, 80-ms TBT, and
  zero CLS under simulated slow 4G. Its image-delivery finding prompted the
  AVIF/responsive and gallery-fetch changes above. The image-delivery retest
  reduced estimated image waste from 724 KiB to 117 KiB, with 7.6-second
  LCP and the same 63 performance score. It identified 464 KiB of early
  Google Maps code, prompting strict map deferral and stylesheet inlining.
  The final mobile report after those changes scored **91 performance,
  100 accessibility, 100 best practices, and 100 basic SEO**, with 1.5-second
  FCP, 3.4-second LCP, 60-ms TBT, 1.5-second Speed Index, and zero CLS under
  the same simulated slow-4G device profile. LCP still has room to improve;
  no field Core Web Vitals pass is asserted because PageSpeed did not have
  sufficient real-user data.
  [Final mobile report](https://pagespeed.web.dev/analysis/https-bellamodastudionyc-com/bxii2kz83m?form_factor=mobile).

## Search Console — October 23, 2026

- Added `https://bellamodastudionyc.com/` as a URL-prefix property in the
  owner's Google account. Google automatically verified ownership through
  the existing Google Analytics tag. No DNS or website changes were needed.
- Submitted `https://bellamodastudionyc.com/sitemap.xml`. Search Console
  confirmed successful submission and processing: **Success**, one
  discovered page, zero discovered videos, submitted/read October 23.
- The stored index inspection exposed the consequence of the old canonical:
  the homepage was **not indexed**, with reason **Alternate page with proper
  canonical tag**. Google's last recorded crawl was October 16. That old
  crawl declared `https://72aa69e7.bella-moda-studio.pages.dev/`; Google
  selected `https://e60893cb.bella-moda-studio.pages.dev/` as canonical.
- Ran Search Console's live smartphone URL test on the corrected homepage.
  Result: **URL is available to Google / Page can be indexed**. Crawl
  allowed: **Yes**; page fetch: **Successful**; indexing allowed: **Yes**.
  The live user-declared canonical is now
  `https://bellamodastudionyc.com/`. The live test cannot determine Google's
  eventual selected canonical, and eligibility is not proof of indexing.
- Requested indexing once. Google confirmed **Indexing requested** and that
  the URL was added to a priority crawl queue. No repeated submissions were
  made; the request does not guarantee inclusion or ranking.
- The new property's Performance, Page indexing, Experience, and
  Enhancements summaries were still processing and said to check again in
  a day or so. No impressions, clicks, query baseline, or field Core Web
  Vitals result is asserted from those pending reports.
- Recurring performance reporting is not active. A compatible Windsor.ai
  integration was identified and suggested, but it is not installed or
  connected. No automated report was created without a working data
  connection. The completed browser checks are separate from that optional
  reporting connection.

## Remaining checks and monitoring

1. After Google recrawls, confirm the homepage is indexed and Google's
   selected canonical is the business domain. Review the Page indexing
   report once processing completes; today's accepted request is not a
   completed indexing result.
2. Compare regular hours, phone, address, and the profile link against the
   Astoria Google Business Profile; update both sources together if needed.
   Complete Schema Markup Validator if its human-verification block clears.
3. Confirm DNS/TLS and redirects for any configured `www` or alternate
   website domain in Cloudflare. Those hosts could not be reliably reached
   during the audit, so duplicate-site hosting was not established. Keep
   `bellamodanyc.com` for email unless the owner separately chooses to use it
   as a website alias. Cloudflare Pages `_redirects` does not support
   domain-level redirects; use Cloudflare's domain redirect feature when
   needed. Do not add an unsupported `_redirects` rule or change DNS blindly.
4. Compare Search Console's last 28 days against the previous period monthly:
   organic impressions, clicks, CTR, landing pages, and actual queries,
   especially Astoria/Queens/Ditmars, women's boutique, and sample-sale
   searches. Review call/directions events in GA4 as supporting conversion
   signals. Recurring reports require a connected reporting integration;
   browser sign-in alone has not configured one.

The sitemap contains the one substantive public landing page. Fragment
anchors are not separate pages, and a second Astoria landing page would
repeat existing visit information, so none was created.
