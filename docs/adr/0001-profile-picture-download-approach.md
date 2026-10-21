# 0001: Profile picture download approach

Status: accepted

## Context

Facebook renders profile pictures from signed `fbcdn.net` URLs. Profile pages carry the size as `cstp=mx{W}x{H}` (maximum available) and `ctp=s{W}x{H}` (requested size); setting `ctp` to the `cstp` maximum asks the CDN for the largest version. The CDN only allows cross-origin `fetch` from facebook.com pages.

Feed and suggestion thumbnails have **no** `cstp=mx…`, so there is no larger size to request from those images.

## Decision

- **Pick mode.** The popup sends a typed message; the content script enters a pick mode where the user clicks the picture, and the URL is read from that exact `<img>` or SVG `<image>` element. This replaced an automatic "largest image" heuristic, which picked the wrong image on pages that show several profiles. No request interception, so no `webRequest` permission.
- **Upgrade and fetch.** Rewrite `ctp=s{W}x{H}` to equal `cstp=mx{W}x{H}` and `fetch` it from the **content script**, so the request originates from the facebook.com origin and no `fbcdn.net` host permission is needed. If the rewritten request is not a 200, fall back to the displayed URL. No other workaround is attempted when Facebook refuses a request.
- **Save.** Turn the blob into an object URL and click an `<a download>` element. No `downloads` permission, and no image rendered into the page (also avoids page CSP issues with `blob:`).
- **No `mx` (feed, suggestions).** Do not download silently at low resolution. Show a prompt with **Open profile** (the `https` facebook.com link around the picked image, opened with `window.open`), **Save low-res anyway**, and **Cancel**. The user then picks again on the profile page. The extension never requests profile pages itself.
- **Popup state.** The popup pings the active tab's content script to learn whether the page is usable (no `tabs` or host permission needed); an unanswered ping means "not Facebook, or reload the tab".
- **Feedback.** Pick mode shows a hint banner, an edge glow and a hover outline; the result is a toast with the saved file name and resolution. All of it renders in a shadow root so the page's CSS cannot affect it.
- The background script is not involved.

## Consequences

- Permissions stay `storage` plus the facebook.com content-script match.
- Fragile points: the DOM selector for the picture (`/t39.30808-1/` CDN path on `<img>`/`<image>`), the profile-link lookup, and the undocumented URL parameters and signatures. All are isolated in `src/features/profile-picture/` with unit tests, so a Facebook change is a small fix, but nothing alerts us when it happens.
- Low-resolution images need an extra step (open the profile, pick again). This is deliberate.
- Using Facebook's CDN this way may conflict with Facebook's terms and store review policies. Check before publishing.

## Alternatives considered

- Background-script fetch: needs a broad `fbcdn.net` host permission.
- Intercepting requests with `webRequest`: broader permission and unnecessary, since the URL is already in the DOM.
- Render in page and "Save image as": manual step, subject to page CSP.
- Fetching the profile page automatically for the full-size URL: rejected. It is scraping with requests the user never made, depends on obfuscated markup, and needs a facebook.com host permission.
- Restricting the extension to profile pages only: rejected in favor of the prompt, which keeps feed use possible.
- Automatic "largest image on the page" detection: rejected; it picked the wrong image on multi-profile pages.
