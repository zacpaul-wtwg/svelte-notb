# TODO

## Product Carousel
- [ ] Confirm desktop/mobile card counts and scroll behavior for homepage featured carousel.
- [ ] Add optional auto-scroll and pause-on-hover if desired.
- [ ] Decide whether carousel should cap max items (for example top 12 featured).

## Featured Flag
- [ ] Confirm canonical Comcash `featured` values with business owner/CMS workflow.
- [ ] If needed, normalize `featured` during refinement so all pages consume a single boolean.

## Comcash Schema Validation
- [ ] Relax schema field types to match live Comcash payloads (for example `created`).
- [ ] Reduce validation noise so non-breaking warnings are actionable.
- [ ] Add monitoring/alerting threshold for schema drift in production logs.

## QA
- [ ] Verify homepage carousel rendering and controls on mobile and desktop.
- [ ] Regression-check `/product` filtering for `FEATURED` and standard departments.

## Hero
- [ ] Revisit mobile hero visual design after overflow fix (ribbon/title layout and typography).

.
