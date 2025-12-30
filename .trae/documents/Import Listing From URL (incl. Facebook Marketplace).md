## Feasibility Summary

* General websites with accessible Open Graph (OG) metadata: Yes. We can auto-fill title, description and a primary image from og:title, og:description, og:image.

* Facebook Marketplace: Partially. Listing pages usually require login and use dynamic rendering + anti-scraping. Without a logged-in session, only limited OG data may be available and images are often blocked. Reliable extraction requires either the user’s browser session (extension) or a server-side headless browser with a logged-in account.

## Approach

### 1) "Import from URL" (MVP)

* Add a field on the Owner Upload page to paste a listing URL.

* When the user clicks Import:

  * Fetch the URL server-side.

  * Parse OG tags: og:title, og:description, og:image (+ og:image:alt/width/height).

  * Fallback HTML selectors for common sites (e.g., title tag, meta description, primary image selectors).

  * Populate form fields (title, description) and queue images for upload to storage.

* Domain support indicators: Show badges like "OG-supported" or "Login-required" to set user expectations.

### 2) Facebook Marketplace Handling

* Detect `facebook.com/marketplace/` URLs and apply a special flow:

  * If not logged in (server-side), try OG-only import (often minimal, images may be missing).

  * Offer a browser extension: "SaveFast Importer" for Chromium browsers that runs in the user’s own logged-in session, reads the Marketplace DOM, and sends title/description/images to the webapp.

  * Optional advanced (later): server-side headless browser (Playwright) with a dedicated, 2FA-protected admin account. This is brittle, subject to ToS constraints, and may break—use only if extension isn’t viable.

### 3) Image Processing

* Download imported image URLs, store in project storage (e.g., Supabase), deduplicate by hash, and set the first image as thumbnail.

* Validate MIME type and reasonable bounds (e.g., ≤10MB per image).

### 4) UX Details

* After import, show a preview with the filled title/description and thumbnails; allow manual edits.

* Persist the pasted URL to `source_url`, and use it for the "Source" link on property cards.

* Provide clear messaging for FB: "For full import from Facebook Marketplace, install the SaveFast Importer extension."

### 5) Security & Compliance

* Respect robots and ToS; do not mass-scrape or bypass protections.

* Prefer user-consented extraction via the browser extension for FB.

* Rate-limit and cache fetches; sanitize inputs; validate image URLs.

### 6) Implementation Plan

1. Add URL input + Import button on Owner Upload.
2. Build server endpoint to fetch and parse OG metadata; implement site fallback selectors.
3. Wire image downloading to storage with dedupe and error handling.
4. Add domain support badges and result preview.
5. Ship a minimal browser extension that extracts Marketplace data and posts to the app.
6. Document limitations and provide a manual fallback (paste content + upload images).

### 7) Timeline

* OG importer + UI and storage: 1–2 days.

* Fallback selectors for a few common sites: +1 day.

* Browser extension (Chromium) for Facebook Marketplace: 3–5 days.

### 8) Future Enhancements

* Expand domain adapters (Airbnb, Zillow, Realtor).

* Add headless browser pipeline for business use-cases with explicit approval.

* Automated duplicate detection across imports.

### 9) Outcome

* For most URLs, one-click import auto-fills listing fields and images.

* For Facebook Marketplace, use the extension for reliable extraction; otherwise OG-only partial import when possible.

