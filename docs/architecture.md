# Architecture

## Decisions

| Area            | Choice                                                                   | Why / alternatives                                                                                                                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework       | WXT 0.21                                                                 | One codebase builds Chrome and Firefox MV3; manifest generated from file-based entrypoints. Plasmo has had no release since 2025-05; a hand-rolled Vite setup would rebuild WXT's manifest and per-browser build logic. Risk: pre-1.0, so pin and read changelogs. |
| Language | TypeScript 7, strict (+ `noUncheckedIndexedAccess`, `verbatimModuleSyntax`) | Typed boundaries between extension contexts. |
| UI              | React 19 + shadcn/ui + Tailwind v4 + Lucide                              | Chosen for the project. shadcn components are copied source, so no runtime lock-in. Tailwind v4 is wired through `@tailwindcss/vite` in `wxt.config.ts` and CSS-first config in `theme.css`; there is no `tailwind.config`.                                        |
| Browser API     | WXT's `browser` global                                                   | Promise-based and cross-browser, so `webextension-polyfill` (last release 2024-05) is not needed.                                                                                                                                                                  |
| Tests           | Vitest + WXT `fakeBrowser`, happy-dom                                    | Shares the Vite config. Browser-level E2E (Playwright, Chromium only) is deferred until a feature needs it.                                                                                                                                                        |
| Quality | Biome 2 (lint, format, import sorting), strict tsc, CI | One tool and one config (`biome.json`) replaces ESLint + Prettier. `src/components/ui/` is excluded so regenerated shadcn files do not churn. |
| Package manager | pnpm                                                                     | Strict dependency resolution.                                                                                                                                                                                                                                      |

## Layout

```
src/entrypoints/   one file or folder per extension context (background, content, popup)
src/components/    app components; ui/ holds shadcn-generated primitives
src/hooks/, lib/   React hooks and framework-free helpers (theme, cn)
src/assets/styles/ theme.css, the single source of design tokens
tests/unit/        Vitest
```

Dependency direction: `entrypoints → components/hooks → lib`. Entrypoints stay thin; logic lives in `lib/` so it can be unit-tested without a browser.

## Contexts

- **Background:** service worker in Chrome, event page in Firefox; can be stopped when idle, so persist state in `browser.storage`. Currently a stub.
- **Content script:** isolated world on `*://*.facebook.com/*`. Currently a stub. It cannot use `downloads`, so future downloads go via a typed message to the background, which validates sender and payload.
- **Popup:** React UI; short-lived. Theme state lives in `storage.local` and is shared across pages via `storage.onChanged`.

## Permissions

Only `storage`. The content-script match is limited to facebook.com. `downloads` or `activeTab` will be decided with the first feature; record it as an ADR in `docs/adr/`.

## Deliberately not included yet

Options page, messaging module, runtime validation (zod), browser-specific folders, Playwright E2E.

## Open items

- Firefox add-on ID is `fb-pp-downloader@ramyyasser21102.github.io` (self-chosen, set in `wxt.config.ts`). It is claimed on the first AMO upload and must never change afterwards.
- The Firefox build declares `data_collection_permissions: none`. Update if that changes.

## Naming and legal notes

- The product name is "PP Downloader". It deliberately avoids "Facebook" in the name, per Meta's trademark guidance; "Facebook" appears only as a factual reference in descriptions. The README carries a non-affiliation disclaimer, and the store listings should too.
- The extension stays user-initiated: one click per picture, no bulk or background fetching. This keeps it away from "automated data collection" in Meta's Terms of Service. Do not add batch downloads without revisiting this.
- Code license: MIT (`LICENSE`). It governs reuse of this code only; it does not grant any permission from Facebook.
