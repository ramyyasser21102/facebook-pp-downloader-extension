# 0001: Profile picture download approach

Status: proposed

## Context

Facebook renders profile pictures from signed `fbcdn.net` URLs at a small size (about 200x200, smaller for sidebar thumbnails). The URL carries the size as `cstp=mx{W}x{H}` (maximum available) and `ctp=s{W}x{H}` (requested size). Setting `ctp` to the `cstp` maximum asks the CDN for the largest version. The CDN only allows cross-origin `fetch` from facebook.com pages.

## Decision

- Read the picture URL from the DOM element the user clicks. No request interception, so no `webRequest` permission.
- Rewrite `ctp=s{W}x{H}` to equal `cstp=mx{W}x{H}` and `fetch` it from the **content script**, so the request originates from the facebook.com origin and no `fbcdn.net` host permission is needed.
- If the rewritten request is not a 200, fall back to the originally displayed URL. No other workaround is attempted when Facebook refuses a request.
- Save by turning the blob into an object URL and clicking an `<a download>` element. No `downloads` permission and no image rendered into the page (also avoids page CSP issues with `blob:`).
- The popup sends one typed message (`start-picking`); the content script enters a pick mode where the user clicks the picture, and the URL is read from that exact `<img>`/SVG `<image>` element. This replaced an automatic "largest image" heuristic, which picked the wrong image on pages that show several profiles. The background script is not involved.

## Consequences

- Permissions stay `storage` plus the facebook.com content-script match.
- Fragile points: the DOM selector for the picture, and the undocumented URL parameters and signatures. Both are isolated in `src/features/profile-picture/` with unit tests, so a Facebook change is a small fix.
- Using Facebook's CDN this way may conflict with Facebook's terms and store review policies. Check before publishing.

## Alternatives considered

- Background-script fetch: needs a broad `fbcdn.net` host permission.
- Intercepting requests with `webRequest`: broader permission and unnecessary, since the URL is already in the DOM.
- Render in page and "Save image as": manual step, subject to page CSP.
