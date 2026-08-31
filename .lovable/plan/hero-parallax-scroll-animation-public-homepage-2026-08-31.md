# Hero Parallax Scroll Animation — Public Homepage

## What
Add a subtle, premium parallax scroll effect to the homepage hero (the red section with "Phone repairs done properly" and the storefront image). Only the hero — no other sections change.

## Effect
- **Hero image card** (storefront photo) drifts upward slightly slower than the page as you scroll (depth layer).
- **Headline / text block** moves up a touch faster, creating separation between text and image.
- **Decorative arcs** (`deco-arc`, `deco-lines`) drift at their own slower speed — background layer.
- Amount kept small (max ~40–60px shift) so it feels cinematic, not gimmicky, and text never becomes hard to read.

## How (technical)
- New small hook `src/lib/useParallax.ts` — a single `requestAnimationFrame`-driven scroll listener updating CSS custom properties (`--parallax-y`) on the hero container. No new npm packages (fast, works with SSR, no hydration issues).
- Transforms applied via CSS `transform: translate3d(calc(var(--parallax-y) * factor))` on the image, text, and deco layers.
- Disabled when `prefers-reduced-motion: reduce` is set (accessibility) and on small screens where scroll distance is short.
- Listener is passive + rAF-throttled so scroll stays at 60fps; effect scope limited to the hero element (no full-page listeners).

## Files
- `src/lib/useParallax.ts` — new hook (browser-only, guarded for SSR).
- `src/routes/index.tsx` — hero section: attach hook + parallax classes/variables to image card, text block, deco arcs.
- `src/styles.css` — small additions: `.parallax-layer` utility + reduced-motion guard.

## Out of scope
- No changes to other homepage sections, admin, or backend.
- No content/copy changes.

## Verification
- Build clean; scroll homepage in preview — image/text/arcs move at different speeds.
- Check with reduced-motion enabled: static, no jump.
- Confirm Lighthouse/CLS not affected (transform-only, no layout shift).
