# Store listing copy

Shared text for the Chrome Web Store and Firefox Add-ons (AMO). Keep it factual and keep the disclaimer.

## Name

PP Downloader

## Summary (max 132 characters for Chrome)

Save Facebook profile pictures in the highest resolution available.

## Description

PP Downloader saves a Facebook profile picture at the highest resolution Facebook makes available for it.

How it works:
1. Open Facebook and click the PP Downloader icon, then Pick picture.
2. Click a profile picture on the page.
3. The picture is saved to your downloads folder.

Notes:
- Works one picture at a time, only when you click. There is no bulk or background downloading.
- Pictures shown in the feed or friend suggestions only exist in low resolution there. The extension offers to open the profile so you can pick the full-size picture on the profile page.
- If Facebook does not provide a larger version, the picture is saved at the size you see.

PP Downloader is an independent project. It is not affiliated with, endorsed by, or sponsored by Meta Platforms, Inc. Facebook is a trademark of Meta Platforms, Inc.

## Single purpose (Chrome)

Save the profile picture the user selects on facebook.com in the highest available resolution.

## Permission justifications

| Permission | Why |
| --- | --- |
| `storage` | Saves the user's light/dark/system theme choice locally. Nothing else is stored. |
| Content script on `*://*.facebook.com/*` | Lets the user click a picture on Facebook, reads that image's URL, and fetches and saves it. The extension requests no other host access. |

No `tabs`, `downloads`, `webRequest`, `cookies` or broad host permissions are used.

## Privacy

- PP Downloader collects no personal data and sends nothing to any server operated by the developer.
- It makes no analytics or tracking requests.
- The only data stored is the theme preference, in the browser's local extension storage.
- Requests are made only to Facebook's own image servers, from the facebook.com page, for the picture the user chose.

Chrome "Privacy practices" tab: declare that no user data is collected or transferred. Firefox: the manifest already declares `data_collection_permissions: none`.

## Before submitting

- Chrome needs screenshots at 1280x800 or 640x400 and a 128x128 icon (`public/icon/128.png`). The README screenshots are other sizes and need re-exporting.
- Chrome asks for a store icon and small promo tile (440x280); the logo is in `src/assets/branding/icon.svg`.
- Firefox needs a source-code zip: `pnpm zip:firefox` produces it.
- Re-read Meta's current terms and brand guidance (see `docs/architecture.md`, "Naming and legal notes").
