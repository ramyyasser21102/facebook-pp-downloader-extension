# Browser compatibility

| Browser                            | Build                                                                     | Status                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Chrome (and Chromium: Edge, Brave) | `pnpm build` → `.output/chrome-mv3`, service-worker background | Tested in Chrome 156: loads, popup renders, theme choice persists and propagates to a second open page, no console errors. Other Chromium browsers untested. |
| Firefox | `pnpm build:firefox` → `.output/firefox-mv3` (MV3, event-page background) | Tested in Firefox 158 as a temporary add-on: loads, popup renders, theme choice persists to `storage.local` and a newly opened popup tab reads it. Live cross-page propagation not yet checked in Firefox. Manually tested by the maintainer on real Facebook: pick mode, glow, toast and download work the same as in Chrome. |
| Safari                             | not targeted                                                              | Needs Xcode conversion.                                                                                                 |

WXT 0.21 builds Firefox as MV2 by default; the scripts pass `--mv3` so both browsers use MV3.

## Known limitations

- `web-ext lint` reports 2 `UNSAFE_VAR_ASSIGNMENT` warnings from `innerHTML` use inside the bundled React DOM. These are not our code. Review before store submission.
- Firefox needs an add-on ID in MV3: `fb-pp-downloader@ramyyasser21102.github.io`. It is claimed on first AMO upload and must not change afterwards.
- Firefox E2E automation is weak; rely on the manual checklist.

## Test method

Chrome behavior is now covered by the committed Playwright suite in `tests/e2e/` (fake facebook.com page, Chromium only). The earlier manual checks used throwaway scripts: Chrome via puppeteer-core `installExtension`, Firefox via selenium-webdriver `installAddon` with `MOZ_REMOTE_ALLOW_SYSTEM_ACCESS=1`. Branded Chrome ignores `--load-extension`. Toolbar-popup behavior (the real action popup) was not exercised; the popup page was opened as a tab.

## Manual Firefox checklist

1. Load `.output/firefox-mv3/manifest.json` via `about:debugging`.
2. Open the popup; confirm layout and theme follow the OS.
3. Switch to Dark; close and reopen; confirm it persists.
4. Open the Browser Console; confirm no extension errors.
