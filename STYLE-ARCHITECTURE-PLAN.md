# Style Architecture Plan

## Goals
- Reduce style duplication and conflicting patterns.
- Keep current visual identity (black/white/yellow-accent + Langdon) while making styles easier to maintain.
- Standardize modal, card, button, and layout primitives.

## Current Snapshot
- Global base lives in `src/app.css` and `src/wtwg-reset.css`.
- Most styles are component-scoped in Svelte files.
- Theme token usage is strong (`--grey`, `--white`, `--yellow-accent`), but many hardcoded colors still exist.
- Modal patterns are duplicated across product and wishlist overlays.
- Largest style hotspots:
  - `src/routes/cms-admin/[section]/+page.svelte`
  - `src/lib/components/ProductPage.svelte`
  - `src/lib/components/ProductModal.svelte`
  - `src/lib/components/ProductCard.svelte`

## Phase 1: Token Hardening (Low Risk)
- Expand `:root` tokens in `src/app.css`:
  - Add semantic tokens for surfaces, text, borders, overlay backgrounds, and shadows.
  - Add spacing scale tokens (for example `--space-1`..`--space-6`).
- Replace recurring hardcoded colors/rgba values in storefront components with tokens.
- Keep admin route visual theme separate but still tokenized under `--admin-*` names.

## Phase 2: Shared UI Primitives
- Create a small primitives layer in `src/lib/components/elements/`:
  - `CardShell.svelte` (border + shadow pattern)
  - `PillButton.svelte` / `IconButton.svelte`
  - `OverlayFrame.svelte` (backdrop + centered panel shell)
- Migrate first users:
  - `src/lib/components/ProductCard.svelte`
  - `src/lib/components/HomeNews.svelte`
  - `src/routes/pricing/+page.svelte`

## Phase 3: Modal Consolidation
- Keep `ProductModal.svelte` as canonical product modal.
- Extract reusable overlay styles and structure for:
  - `src/lib/components/ProductModal.svelte`
  - `src/routes/product/wishlist/+page.svelte`
- Normalize z-index layers in one place (document a layer map in this file).

## Phase 4: Layout + Typography Consistency
- Standardize container widths and section spacing across pages:
  - Use consistent max-width tokens and section gap utilities.
- Normalize heading/body typography rules:
  - Keep Langdon for display headings.
  - Define one body stack and one mono/digital stack.

## Phase 5: Motion and Interaction Rules
- Centralize transition durations/easing tokens.
- Ensure hover/focus/active states are consistent on buttons, links, and cards.
- Add reduced-motion fallbacks where animations are non-essential.

## Phase 6: Quality Gates
- Add a style checklist to PR workflow:
  - No new hardcoded colors unless justified.
  - Reuse primitives before introducing new patterns.
  - Keep modal/backdrop behavior accessible and keyboard-safe.
- Optional: add Stylelint for CSS/SCSS consistency.

## Suggested Order of Execution
1. Token hardening in `src/app.css`.
2. Primitive creation in `src/lib/components/elements/`.
3. Modal consolidation (`ProductModal` + wishlist modal).
4. Migrate high-impact pages (`ProductPage`, pricing, homepage sections).
5. Enforce via checklist/lint.

## Risks and Mitigations
- Risk: visual regressions from token swaps.
  - Mitigation: migrate incrementally by component and verify screenshots manually.
- Risk: admin theme accidentally altered.
  - Mitigation: keep admin token namespace isolated and do not collapse into storefront tokens.

## Definition of Done
- Storefront styles primarily reference semantic tokens and shared primitives.
- Product and wishlist overlays use the same overlay shell pattern.
- Hardcoded color usage in storefront components is minimal and intentional.
- Styling changes become predictable and faster to implement.
