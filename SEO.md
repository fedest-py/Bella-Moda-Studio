# Astoria SEO implementation — October 22, 2026

Scope: the single Astoria–Ditmars store. The website remains at
https://bellamodastudionyc.com. No other store, location page, design, font,
stylesheet, or photograph was added or changed.

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

## Verification and limits

- `npm run check`: all 12 tests passed before commit. This includes the
  build, image/link checks, existing API/analytics tests, and a regression
  build with conflicting preview/stale environment URLs.
- Browser review of the local homepage confirmed the existing layout,
  branding, typography, photographs, and controls were preserved.
- Google Business Profile lookup and Schema Markup Validator presented
  Google's unusual-traffic/human-verification check. Independent Google
  listing consistency and Schema Markup Validator completion remain
  unverified. Do not describe these as passed.
- Search Console was signed out in the available browser. Index status,
  Google-selected canonical, sitemap submission, and organic performance
  require access to the owner's verified property. Serving a sitemap and
  listing it in robots.txt do not establish Search Console submission.
- Rich Results Test and a mobile lab test must be checked against the live
  domain after the production build is available. No mobile performance or
  Core Web Vitals pass is asserted by these source checks.

## Remaining account-level checks

1. In Search Console, inspect `https://bellamodastudionyc.com/`, test the live
   URL, confirm indexing eligibility and the declared canonical, and request
   indexing after the corrected version is live.
2. Submit or refresh `https://bellamodastudionyc.com/sitemap.xml`. Confirm
   successful processing and check Page indexing for exclusions/errors.
3. Compare regular hours, phone, address, and the profile link against the
   Astoria Google Business Profile; update both sources together if needed.
4. Confirm DNS/TLS and redirects for any configured `www` or alternate
   website domain in Cloudflare. Those hosts could not be reliably reached
   during the audit, so duplicate-site hosting was not established. Keep
   `bellamodanyc.com` for email unless the owner separately chooses to use it
   as a website alias. Cloudflare Pages `_redirects` does not support
   domain-level redirects; use Cloudflare's domain redirect feature when
   needed. Do not add an unsupported `_redirects` rule or change DNS blindly.
5. Compare Search Console's last 28 days against the previous period monthly:
   organic impressions, clicks, CTR, landing pages, and actual queries,
   especially Astoria/Queens/Ditmars, women's boutique, and sample-sale
   searches. Review call/directions events in GA4 as supporting conversion
   signals. No recurring report was configured without account access.

The sitemap contains the one substantive public landing page. Fragment
anchors are not separate pages, and a second Astoria landing page would
repeat existing visit information, so none was created.
