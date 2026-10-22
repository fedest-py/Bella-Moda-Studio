# Bella Moda Studio

Canonical repository: https://github.com/fedest-py/Bella-Moda-Studio

The canonical, standalone website for Bella Moda Studio, Sample Sale + Boutique at 29-09 Ditmars Boulevard, Astoria, NY 11105.

## Architecture

Dependency-free static HTML, CSS and JavaScript, with a Node.js build script and one optional Cloudflare Pages Function. No frontend framework or external font service is needed. All 17 WebP photographs/logo files are bundled. The original system-font stacks, stylesheet, client interactions, content order and responsive breakpoints are preserved.

- `web/`: editable pages, local images, styles and browser scripts.
- `functions/api/google-profile.js`: optional server-side Google Places endpoint.
- `scripts/`: build and local preview tools.
- `tests/`: asset/link/metadata checks and simulated API integration tests.
- `dist/`: generated static output, intentionally ignored by Git.

## Local use

Requires Node.js 22 or later and npm. There are no third-party packages to install.

```sh
npm run check
npm run dev
# Or serve the generated build:
npm run preview
```

Preview is at http://localhost:4173. The local preview supports the same Google endpoint, using environment variables from the shell. `.env` is a reference only and is not automatically loaded. For local secrets, Node supports `node --env-file=.env scripts/serve.mjs`.

## Cloudflare Pages settings

Connect this repository using **Workers & Pages → Pages → Connect to Git**.

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Production branch | main |
| Root directory | repository root (leave blank) |
| Build command | npm run build |
| Build output directory | dist |
| Node version | 22 (provided by .node-version) |

The existing Cloudflare Pages Git integration detects the root `functions/` folder and deploys the function alongside static files. Uploading only dist through a drag-and-drop uploader does not include the function. `_routes.json` limits function invocation to `/api/google-profile`; normal pages and images remain static.

## Environment variables

**None are required for the current page, map, directions, photographs or displayed fallback hours/rating.**

- Canonical, Open Graph, structured-data and sitemap URLs always use `https://bellamodastudionyc.com`, including in preview builds. `SITE_URL` and Cloudflare's `CF_PAGES_URL` do not override this: a deployment URL must not replace the public business domain. `bellamodanyc.com` is used for business email and is not the website's canonical domain.
- `GOOGLE_PLACES_API_KEY` (optional server-side secret): restricted to Places API (New).
- `GOOGLE_PLACE_ID` (optional server-side value): the verified Bella listing ID at the exact Ditmars address.

Live hours and rating synchronization remains **prepared, not activated**. To enable it later, configure Google Cloud billing and Places API (New), restrict the key, set usage quotas, add these two server-side values in Cloudflare Pages, and redeploy. Never place the key in web/ or a public build variable. The server validates the store name/address and never returns the key. Google usage/billing is separate. The existing saved hours and explicitly dated rating remain visible if configuration or Google requests fail. The review count is not displayed.

The address-based Google Maps iframe is independent of that endpoint and needs no supplied API key. It loads lazily, with the directions button and listing link retained. Visitors need access to Google for the map to render; privacy blockers or Google verification may affect it.

## Future updates

This repository is the master. Edit it and commit to its existing history; do not create disconnected copies. Pushes to `main` trigger the existing Cloudflare Pages production deployment. The public website is `https://bellamodastudionyc.com`. See `SEO.md` for the Astoria SEO implementation and external validation status.

## Verification

`npm run check` builds the page, validates local resource references and image signatures, checks navigation anchors and expected controls, validates metadata, scans public output for credentials/platform dependencies, and tests Google success/failure/configuration behavior with simulated responses. It does not claim to verify live Google services or replace visual browser testing. See `VERIFICATION.md` for this migration's verification scope.
