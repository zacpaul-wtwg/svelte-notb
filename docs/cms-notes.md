# CMS Notes (Repo Evaluation)

Date: 2026-02-05

This document summarizes the current CMS/state-of-content implementation in this repo and the CMS options discussed (including the decision to move toward Sanity). It also captures adjacent findings discovered while reviewing related data-fetching code paths.

## Current State (Contentful)

### How content is fetched today

- Contentful SDK is configured in `src/lib/contentfulClient.js` using:
  - `import.meta.env.VITE_CONTENTFUL_SPACE_ID`
  - `import.meta.env.VITE_CONTENTFUL_DELIVERY_API_TOKEN`
- An aggregate endpoint `src/routes/data/getAllContentful.json.js` fetches multiple content types:
  - `newsPost`
  - `footerDescription`
  - `hours`
  - `regularHoursStrict`
  - `specialHours`
  - `faq`
  - `pricing`
  - `closedRange`

### Where the aggregate endpoint is consumed

- Layout-level load: `src/routes/__layout.svelte` calls `fetch('/data/getAllContentful.json')` and passes `allData` to the app (used by `Footer`).
- Page-level loads ALSO call the same endpoint:
  - `src/routes/index.svelte`
  - `src/routes/faq.svelte`
  - `src/routes/pricing.svelte`

This means multiple parts of the app independently fetch the same CMS payload.

### Content shape / quirks

- `newsPosts` is treated as a single object, not a list:
  - `newsPosts: newsPosts.items[0].fields`
  - This discards all but the first returned entry. If multiple news posts exist, the selection logic is implicit (whatever Contentful returns first), not explicit (e.g., most recent by publish date).

### Operational issues observed (root causes for fragility)

Even ignoring Contentful rate limiting specifically, the current integration has several characteristics that amplify runtime failures:

- The aggregate endpoint performs 8 separate Contentful requests per call (one per content type).
- The endpoint is invoked redundantly (layout + pages).
- Error handling in `src/routes/data/getAllContentful.json.js` is a broad `catch { return { status: 404 } }`:
  - Transient failures (429, 500, network timeouts) become a hard 404 response, which can produce confusing “missing data/page” behavior instead of retry/backoff or a soft-degradation path.

## CMS Options Discussed (Self-Hosted / Alternative)

The goal stated: stop depending on Contentful (and its runtime rate-limits), and move toward a different CMS.

### Option A: Git-based content (files in repo) + optional admin UI

- Content stored as markdown/frontmatter/JSON/YAML committed to git (no runtime CMS API dependency).
- Optionally add a git-backed admin UI (e.g., Decap/Netlify CMS) to make editing easier while keeping content in the repo.
- Pros:
  - Maximum runtime reliability (no external API at request time).
  - Great fit for mostly-static store info: hours, FAQ, pricing blurbs, news posts.
- Cons:
  - Publishing requires git workflow (PR/merge) unless you add automation.

### Option B: Directus (self-hosted headless CMS)

- DB-backed CMS with strong admin UI and REST/GraphQL.
- Pros:
  - Great for structured data (hours/special hours/closed ranges).
  - Flexible schema and good editor experience.
- Cons:
  - Requires hosting + DB ops.

### Option C: Payload CMS (self-hosted, code-first)

- Node/TypeScript CMS with schemas in code.
- Pros:
  - Strong developer workflow, very customizable.
- Cons:
  - Still requires hosting; more “engineering heavy” than file-based.

## Sanity Decision (Planned)

User preference: use Sanity (not self-hosted), and the dataset is not sensitive (store information), so token security is not a concern.

### What “public, tokenless” Sanity implies

- Dataset can be configured for public read access.
- Web app can read published content via the Sanity API/CDN without tokens.
- Recommended: `useCdn: true` for fast cached reads of published content.

### Proposed integration approach (minimal churn)

The lowest-risk migration path for this repo is to preserve the existing frontend contract and swap the backend implementation:

1. Replace Contentful client with Sanity client
   - Replace `src/lib/contentfulClient.js` with `src/lib/sanityClient.js` (or similar).
   - Store `projectId`, `dataset`, and API version in env (public is fine; tokenless).

2. Rewrite the aggregate endpoint to a single GROQ query
   - Replace `src/routes/data/getAllContentful.json.js` with a Sanity-backed version (keep the same route initially, or introduce `getAllCms.json` and migrate consumers).
   - Use one GROQ query that returns an object matching the existing `allData` shape so the consuming Svelte files do not need immediate changes.

3. Keep response shape stable
   - Today consumers expect:
     - `const { allData } = await fetch(...).then(r => r.json())`
   - Maintain that shape to reduce risk during migration.

### Data modeling mapping (Contentful -> Sanity)

The content types currently referenced map naturally to:

- `newsPost`: document type `newsPost` (likely list, sorted by date)
- `faq`: document type `faq` with fields like `title`, `answer`, `order`
- `pricing`: document type `pricing` with fields like `title`, `entry`, `order`
- Store info:
  - `footerDescription`: singleton doc or a `siteSettings` doc field
  - `hours`, `regularHoursStrict`, `specialHours`, `closedRange`: singleton + arrays, or grouped under `siteSettings`

### Open question captured

News behavior is currently “first item only.” Before implementing Sanity schemas/queries, decide:

- Should `newsPosts` be an array (typical; render multiple posts), or
- Is there intentionally only one “current” news item?

This decision affects both schema (list vs singleton) and frontend usage.

## Adjacent Finding: Comcash API Integration (not acted on)

While reviewing the repo, Comcash is the other major external data dependency (products).

Key observations:

- Comcash auth/token handling is cached forever in `src/lib/comcash/getComcashAuthToken.js`:
  - No expiry handling.
  - No retry-on-401 that refreshes the token.
- `getSingleProductData()` in `src/lib/comcash/getRawProductData.js` uses a suspicious URL:
  - `.../employee/product/view?{{params}}` looks like a template placeholder and may be broken.
- Error handling patterns often assume JSON responses and do not check `response.ok`, which can produce hard-to-debug failures when the upstream API changes.

These issues were noted as “evaluate,” but the immediate focus shifted to CMS migration planning.

## Suggested Next Steps (When Ready)

1. Decide Sanity content strategy for news:
   - single “current post” vs list of posts with ordering/publishedAt
2. Create Sanity schema(s) to match `allData` needs.
3. Implement Sanity client + GROQ aggregate endpoint, keeping the existing `allData` response shape.
4. Remove redundant page-level `fetch('/data/getAllContentful.json')` calls so the app only fetches CMS content once (layout-level), regardless of provider.

