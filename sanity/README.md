# Sanity Studio

This folder contains a self-contained Sanity Studio configuration for the site CMS.

## Setup

1. Install dependencies:
```bash
cd sanity
npm install
```

2. Set env vars (from your Sanity project):
```bash
export SANITY_STUDIO_PROJECT_ID="notbfireworks"
export SANITY_STUDIO_DATASET="production"
export SANITY_STUDIO_API_VERSION="2024-01-01"
```

3. Start Studio:
```bash
npm run dev
```

## Schema Overview

- `siteSettings`: footer description + store hours + regular hours
- `newsPost`: single current news item (sorted by date; latest used)
- `faq`: ordered list
- `pricing`: ordered list
- `specialHours`: list
- `closedRange`: list

The site fetches CMS data via `src/routes/data/getAllContentful.json.js`, which now
prefers Sanity if `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` are set.
