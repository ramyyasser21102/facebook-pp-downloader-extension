import { pickImage } from './find-image';

const HIGHLIGHT_STYLE =
  'position:fixed;pointer-events:none;z-index:2147483647;' +
  'outline:3px solid #2563eb;background:rgba(37,99,235,.15);display:none';

/**
 * Lets the user click a picture on the page. Resolves with its URL, or null
 * if cancelled (Escape). While active, clicks are swallowed so the page does
 * not navigate.
 */
export function pickProfileImageUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    const box = document.createElement('div');
    box.style.cssText = HIGHLIGHT_STYLE;
    host.attachShadow({ mode: 'open' }).appendChild(box);
    document.documentElement.appendChild(host);
    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = 'crosshair';

    const under = (event: MouseEvent) =>
      pickImage(document.elementsFromPoint(event.clientX, event.clientY));

    const onMove = (event: MouseEvent) => {
      const hit = under(event);
      if (!hit) {
        box.style.display = 'none';
        return;
      }
      const { left, top, width, height } = hit.element.getBoundingClientRect();
      Object.assign(box.style, {
        display: 'block',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
    };

    const finish = (url: string | null) => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.style.cursor = previousCursor;
      host.remove();
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
