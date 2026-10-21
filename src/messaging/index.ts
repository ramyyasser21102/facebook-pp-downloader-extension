/** Messages from extension pages to the content script. */
export type ContentRequest = { kind: 'ping' } | { kind: 'start-picking' };

export type ContentResponse = { ok: true } | { ok: false; error: string };

export function isContentRequest(value: unknown): value is ContentRequest {
  if (typeof value !== 'object' || value === null) return false;
  const { kind } = value as { kind?: unknown };
  return kind === 'ping' || kind === 'start-picking';
}
