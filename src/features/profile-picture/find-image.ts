import { isFacebookCdnUrl } from './url';

/** Profile photos are served from the `t39.30808-1` CDN path. */
const PROFILE_PHOTO_PATH = '/t39.30808-1/';

/** Reads a profile-photo URL from an <img> or SVG <image> element, else null. */
export function profilePhotoUrl(element: Element): string | null {
  const tag = element.tagName.toLowerCase();
  if (tag !== 'img' && tag !== 'image') return null;
  const src =
    element.getAttribute('src') ??
    element.getAttribute('href') ??
    element.getAttribute('xlink:href');
  if (!src || !isFacebookCdnUrl(src)) return null;
  return new URL(src).pathname.includes(PROFILE_PHOTO_PATH) ? src : null;
}

/**
 * Given the elements stacked under the pointer (topmost first, as returned by
 * `document.elementsFromPoint`), returns the first profile photo.
 */
export function pickImage(
  stack: Element[],
): { element: Element; url: string } | null {
  for (const element of stack) {
    const url = profilePhotoUrl(element);
    if (url) return { element, url };
  }
  return null;
}

function isFacebookPage(url: URL): boolean {
  return (
    url.protocol === 'https:' &&
    (url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com'))
  );
}

/**
 * The Facebook page the picked image links to (normally the person's
 * profile), or null when the image is not inside a link to facebook.com.
 */
export function profileLinkFor(element: Element): string | null {
  const href = element.closest('a[href]')?.getAttribute('href');
  if (!href) return null;
  try {
    const url = new URL(href, location.href);
    return isFacebookPage(url) ? url.toString() : null;
  } catch {
    return null;
  }
}
