import { pickImage } from './find-image';
import type { Overlay } from './overlay';

/**
 * Lets the user click a picture on the page. Resolves with its URL, or null
 * if cancelled (Escape). While active, clicks are swallowed so the page does
 * not navigate.
 */
export function pickProfileImageUrl(overlay: Overlay): Promise<string | null> {
  return new Promise((resolve) => {
    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = 'crosshair';
    overlay.showHint('Click a profile picture · Esc to cancel');

    const under = (event: MouseEvent) =>
      pickImage(document.elementsFromPoint(event.clientX, event.clientY));

    const onMove = (event: MouseEvent) => {
      overlay.highlight(under(event)?.element.getBoundingClientRect() ?? null);
    };

    const finish = (url: string | null) => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.style.cursor = previousCursor;
      overlay.hideHint();
      resolve(url);
    };

    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const hit = under(event);
      if (hit) finish(hit.url);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(null);
    };

    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
  });
}
