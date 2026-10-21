/** Messages from extension pages to the content script. */
export type ContentRequest = { kind: 'start-picking' };

export type ContentResponse = { ok: true } | { ok: false; error: string };

export function isContentRequest(value: unknown): value is ContentRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as { kind?: unknown }).kind === 'start-picking'
  );
}
