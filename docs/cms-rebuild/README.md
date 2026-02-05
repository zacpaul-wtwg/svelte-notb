# CMS Rebuild Instructions (from current working state)

This document describes how to rebuild the current CMS admin experience that exists in the working tree before reverting the repo back to `origin/main`.

It captures:
- UI structure and behavior
- Section ordering
- Data handling details
- File-level changes

If we revert the repo, follow this document to recreate the CMS features.

## Overview

We replaced the legacy CMS usage with a local CMS admin UI under `/cms-admin` and a local `static/cms.json` data file.

Key outcomes:
- Fixed, low-profile CMS top bar with `Sections` and `Save` buttons.
- Section pages for Store Hours, Special Hours, Closed Range, News Post, Pricing, FAQ, Footer Description.
- Store hours use time pickers and a “Closed” toggle that collapses the time inputs.
- News Post body uses a rich editor (Quill) and renders markdown on the site.
- Special Hours UI rebuilt as custom card list (events + days).

## Section Order (must match)

Update the CMS section order in `src/lib/cms/adminSchema.js` to:

1. Store Hours
2. Special Hours
3. Closed Range
4. News Post
5. Pricing
6. FAQ
7. Footer Description

Also remove:
- `regularHoursStrict` entirely
- Special-hours checkbox on Store Hours
- Title input for Store Hours and Footer Description (hard-coded titles instead)

## File Changes Required

### 1) CMS Section Schema

File: `src/lib/cms/adminSchema.js`

Key edits:
- Reorder sections as listed above.
- Remove `regularHoursStrict`.
- Ensure `storeHours` has:
  - `sunday`, `monday`, ... `saturday` (strings)
  - no `title` field.
  - no `areSpecialHoursActive` toggle.
- Ensure `specialHours` contains a `title` field for each event, and an array of events.
- Ensure `footerDescription` has no `title` field (hard-coded label).

### 2) CMS Layout

File: `src/routes/__layout.svelte`

Change to hide site header/footer on `/cms-admin` routes, so the CMS has a clean admin layout.

### 3) CMS Admin Index

File: `src/routes/cms-admin/index.svelte`

Required layout:
- Fixed top nav (not sticky).
- Left: `Sections` button and `Save` button.
- Center: page title (large).
- Right: logo.
- Add margin below nav so the main card is not flush.
- Ensure no extra scrolling when content doesn’t exceed the fold.

### 4) CMS Admin Section Page

File: `src/routes/cms-admin/[section].svelte`

Required features:
- Same top nav as index (fixed).
- The `Save` button stays in the top bar.
- Section title under nav, larger than before.
- No header/footer from main site.

### 5) Store Hours UI

File: `src/routes/cms-admin/[section].svelte`

Behavior:
- Each day row has a toggle labeled “Closed”.
- When closed:
  - Collapse the time pickers vertically.
  - Autofill `CLOSED` and disable inputs.
- When open:
  - Two time pickers on the same line if width allows.
  - These are `input type="time"` elements.
  - “Clock” icons should appear white.
- No special-hours checkbox.

### 6) News Post

Files:
- `src/routes/cms-admin/[section].svelte`
- `src/lib/components/QuillEditor.svelte`
- `src/lib/components/HomeNews.svelte`

Behavior:
- Date is not editable; on save, use “current time”.
- News body uses Quill editor.
- Quill container must auto-expand vertically with content (no fixed height).
- On site display:
  - If stored content contains HTML, render as HTML.
  - Else render with Markdown.

### 7) Special Hours UI (Rebuilt)

File: `src/routes/cms-admin/[section].svelte`

Required:
- Replace old list with custom draggable-style cards.
- Add “Add Event” (not “Add Item”).
- Each Event card has:
  - Grab icon on the far left.
  - Live-updating card label to the right of the grab icon (same line).
  - `Event Title` input inside the card.
  - Label text defaults to `Title Required` on mount if empty.
  - Remove button uses X icon (same icon set as elsewhere).
- Title input must update the label as the user types.
- Add Day button under the event title.
  - When clicked: add a day card immediately above the button.
  - The button stays below the new day card.
  - Each day card has placeholder text so it’s visible.
  - Each day card has an X icon remove button on the right.
  - Remove button must delete the card from the DOM.

Notes:
- Ensure event add/remove is fully reactive.
- Ensure day add/remove is fully reactive.

### 8) Toggle Styling

All checkbox fields should use the same toggle UI as Store Hours.
Do this across:
- Special Hours
- Closed Range
- Any other boolean in CMS

### 9) Footer Description

File: `src/lib/components/Footer.svelte`

Change to show all `specialHours` items (remove `isActive` filtering).

## Data File

File: `static/cms.json`

This is the editable JSON store for CMS content.
Ensure the schema and field names align with `adminSchema.js`.

## Behavior Checks

Manual checks:
- `/cms-admin` loads cleanly without site header/footer.
- Store hours: Closed toggle collapses inputs and sets CLOSED.
- News post: editor expands, date is auto-generated on save.
- Special hours: add/remove event + day is reactive; labels update live.

## Notes on Dependency State

Do not introduce new form libs unless you are upgrading SvelteKit/Vite.
The admin UI is intentionally done with local component state to avoid SSR issues.

If a form library is needed later, the recommended stack is:
- `sveltekit-superforms`
- `zod`
But this requires upgrading to SvelteKit v2 and Vite v7.

