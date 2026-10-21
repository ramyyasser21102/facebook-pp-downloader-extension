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
