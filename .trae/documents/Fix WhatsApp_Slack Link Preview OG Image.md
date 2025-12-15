## Summary of Findings
- WhatsApp and Slack rely on Open Graph tags fetched by non-JS crawlers and are stricter than Twitter:
  - Require absolute HTTPS URLs and correct MIME type for `og:image` [5].
  - Image dimensions should be ≥ 200×200; recommended ~1200×630 (1.91:1) or square 1:1; some sources note better reliability with <300 KB file size for WhatsApp [2][5].
  - Caching is aggressive; Facebook Sharing Debugger can force refresh and WhatsApp often follows Facebook cache [3][5].
  - Clients may prefer the last of multiple `og:image` tags (WhatsApp behavior reported) [2].

## Likely Causes in Current Setup
- The image URL or MIME type mismatch (e.g., serving PNG but declaring JPEG) can cause WhatsApp/Slack to skip the image.
- Using a single aspect ratio (1200×630) may not be ideal across clients; Slack and WhatsApp sometimes prefer square thumbnails.
- Cache not refreshed; WhatsApp/Slack show stale previews.
- Domain/image path mismatch or redirect interfering with crawler.

## Fix Plan
### 1) Image Assets
- Prepare two optimized images in `public/`:
  - `og-image-1200x630.jpg` (JPEG, ~1200×630, <300 KB)
  - `og-image-800x800.png` (PNG, 800×800, <300 KB)
- Ensure they serve with correct `Content-Type` and `200 OK`.

### 2) Open Graph Tags (index.html)
- In `<head>` place tags near the top and include multiple `og:image` entries:
  - `og:image` (absolute URL to `og-image-1200x630.jpg`)
  - `og:image:secure_url` (same absolute URL)
  - `og:image:width`, `og:image:height`, `og:image:type` (image/jpeg)
  - Additional `og:image` for square image (absolute URL to `og-image-800x800.png`) with its width/height/type
  - `og:image:url` and `link rel="image_src"` pointing to primary image
  - `og:type`, `og:site_name`, `og:locale` confirmed
- Keep `og:url` and canonical aligned with the deployed domain.

### 3) Domain/Env Consistency
- Parameterize site URL via `VITE_SITE_URL` and reference it in `index.html` for absolute URLs (Vite supports `%VITE_*%` substitutions in HTML), so staging/production stay consistent.

### 4) Caching and Verification
- After deployment:
  - Use Facebook Sharing Debugger on the exact URL and click “Scrape Again” (forces WhatsApp refresh) [5].
  - Test Slack unfurl by sharing a cache-busted URL (e.g., `/?v=3`).
  - Verify with direct HEAD/GET of images that `Content-Type` matches file type and size is <300 KB.

### 5) Optional Enhancements
- Route-specific OG (per property): add a serverless function or SSR that emits per-listing OG tags (for later).
- Add a fallback `<meta name="twitter:image">` already present; keep consistent with primary JPEG.

## References
- [2] StackOverflow: WhatsApp `og:image` best practices (multiple images, <300KB, absolute URLs)
- [3] Medium: WhatsApp OG caching; using Facebook Debugger to refresh
- [5] Guide: Facebook Sharing Debugger and OG requirements (absolute HTTPS URLs, dimensions, cache)