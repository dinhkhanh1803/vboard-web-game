# Content Feature

## Responsibility

Own policy pages, contact page, game rules guides, blog-style SEO content, and safe ad placement content areas.

## Boundaries

- Content pages can be static React routes during MVP.
- Ads must not appear near game controls or during active turns.
- Legal/policy pages must exist before public production deploy and ads review.
- Privacy and Terms content is local-only UI copy until legal/product review approves production text.

## Current State

- `/privacy-policy` and `/terms` render the high-fidelity Privacy & Terms documentation layout with sidebar navigation, support card, policy cards, and terms rows.
- `/contact` remains a static support intake shell with live ticket creation disabled.
