@AGENTS.md

# Tropina: rules for agents

Full brief: `docs/tropina-start-prompt.md`. Background and decisions: `docs/context.md`.
Where they differ, the start prompt wins; where this file records a later decision by
the owner, this file wins.

## Product

- Tropina is the base of a big map of local routes, food and events in Europe (Poland
  first, then Italy). Christmas markets in Poland are the first layer. Build for the long
  run: this repo is the app, not a one-off landing page.
- Languages: **en** (default), **pl**, **ru**, **uk**. Ukrainian was added by the owner on
  2026-11-15, after the start prompt was written (it lists only en/pl/ru).
- No UI string in code: everything goes through `messages/{en,pl,ru,uk}.json` (next-intl).
  Data has a field per language. In Russian texts about Poland write «гжанец», not
  «глинтвейн».

## Stack (do not change without the owner)

- Next.js 16 (App Router, Cache Components) + TypeScript strict. Next is newer than your
  training data: read `node_modules/next/dist/docs/` before writing code.
- MapLibre GL JS + OpenFreeMap (`https://tiles.openfreemap.org/styles/liberty`), no API
  keys, OpenStreetMap attribution required.
- next-intl (locale from `next/root-params`), zod, data in the repo, no backend.
- PWA via `app/manifest.ts` + a hand-written `public/sw.js` (Serwist 9.5 breaks with Cache
  Components). Pages it saves offline come from `app/offline-pages.json/route.ts`.
- Cookie-free analytics behind `track(event, props)` (`src/lib/analytics.ts`): Umami Cloud
  (free tier), on only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set.
- Hosting on Vercel, but nothing Vercel-specific.
- Not now: backend, Supabase, logins, Mapy.com, own routing, cookies, year in URLs.

## URLs (permanent)

```
/{lang}/poland/christmas-markets
/{lang}/poland/christmas-markets/{city}
/{lang}/poland/christmas-markets/{city}/{market}
```

- `/` redirects by browser language (default `en`); `/{lang}` redirects to the markets
  page for now. Slugs: latin, lowercase, no diacritics. No year in URLs.
- Unknown city/market → real 404, answered in `src/proxy.ts` (with Partial Prerendering a
  `notFound()` after streaming starts would return 200).

## Data

- One file per market under `src/data/markets/`, registered in `src/data/markets/index.ts`.
  Schema: `src/data/schema.ts`. The build fails on a missing date, official URL,
  coordinates or any of the four translations (`npm run validate:data` runs before build).
- TEST records live in `src/data/markets/test/` and are included only when
  `TROPINA_INCLUDE_TEST_DATA=1` (dev, e2e). Never in a production build.
- LOREM placeholders for the eight launch cities live in `src/data/markets/placeholder/`
  (owner's request, 2026-11-15) and are included only with
  `TROPINA_INCLUDE_PLACEHOLDER_DATA=1` (`npm run dev`, `npm run preview`). Not in e2e or
  production. Delete the folder when the real cards arrive.
- `verified: false` dates are always shown with an explicit note.

## Accessibility (WCAG 2.2 AA from day one)

- The list is a full alternative to the map. Everything works by keyboard, focus is always
  visible, targets ≥ 24×24 px, nothing is conveyed by colour alone, contrast checked,
  `prefers-reduced-motion` respected.
- `eslint-plugin-jsx-a11y` (strict) in lint. Every Playwright test runs axe through the
  auto fixture in `tests/e2e/fixtures.ts`: import `test`/`expect` from there, never from
  `@playwright/test` directly.

## Tests and gates

- Test first, then code. **Never change a test to make it pass.** If a test looks wrong,
  stop and ask the owner.
- Before saying "done", run all of: `npm run typecheck`, `npm run lint`,
  `npm run format:check`, `npm test`, `npm run e2e`, `npm run build`.
- E2E: desktop and mobile (Pixel 7) projects. Set `PW_CHROMIUM_PATH` to use a
  preinstalled Chromium instead of `npx playwright install chromium`.

## Way of working

- Work in stages (see the start prompt); stop after each stage and show the result.
  Show the stage plan and folder structure before writing code.
- One stage = one branch = one PR. Small commits with clear messages.
- If the brief contradicts current Next/library docs, say so and propose a fix; never
  invent APIs.
- The owner is a senior engineer, less fluent in parts of the frontend ecosystem: explain
  decisions briefly. Reply in Russian.
- At the end of every session append to `docs/journal.md`: date; what was done; what broke
  and how long it took; how it was fixed; decisions and why. Facts and numbers only, no
  secrets, keys or personal data.
