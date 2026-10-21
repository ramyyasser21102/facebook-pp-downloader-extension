const MAX_SIZE = /^mx(\d+)x(\d+)$/;

/**
 * Facebook CDN URLs carry the largest available size in `cstp=mx{W}x{H}` and
 * the requested size in `ctp=s{W}x{H}`. Returns the URL with `ctp` set to the
 * maximum, or null when the URL has no usable `cstp` (nothing to upgrade).
 * See docs/adr/0001-profile-picture-download-approach.md.
 */
export function upgradeProfilePictureUrl(src: string): string | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  const match = MAX_SIZE.exec(url.searchParams.get('cstp') ?? '');
  if (!match) return null;
  url.searchParams.set('ctp', `s${match[1]}x${match[2]}`);
  return url.toString();
}

export function isFacebookCdnUrl(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === 'https:' && hostname.endsWith('.fbcdn.net');
  } catch {
    return false;
  }
}

export function fileNameFromUrl(src: string): string {
  const last = new URL(src).pathname.split('/').pop() ?? '';
  return /\.(jpe?g|png|webp)$/i.test(last) ? last : 'profile-picture.jpg';
}
