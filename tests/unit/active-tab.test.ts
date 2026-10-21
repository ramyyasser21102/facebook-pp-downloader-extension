import { afterEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { isContentRequest } from '@/messaging';
import { isContentScriptReady, startPicking } from '@/messaging/active-tab';

function stubTab(send: () => Promise<unknown>) {
  vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([{ id: 7 }] as never);
  vi.spyOn(fakeBrowser.tabs, 'sendMessage').mockImplementation(send as never);
}

afterEach(() => vi.restoreAllMocks());

describe('isContentRequest', () => {
  it('accepts known kinds only', () => {
    expect(isContentRequest({ kind: 'ping' })).toBe(true);
    expect(isContentRequest({ kind: 'start-picking' })).toBe(true);
    expect(isContentRequest({ kind: 'nope' })).toBe(false);
    expect(isContentRequest(null)).toBe(false);
    expect(isContentRequest('ping')).toBe(false);
  });
});

describe('active tab messaging', () => {
  it('is ready when the content script answers the ping', async () => {
    stubTab(() => Promise.resolve({ ok: true }));
    expect(await isContentScriptReady()).toBe(true);
  });

  it('is not ready when nothing answers', async () => {
    stubTab(() => Promise.reject(new Error('Receiving end does not exist')));
    expect(await isContentScriptReady()).toBe(false);
  });

  it('is not ready when there is no active tab', async () => {
    vi.spyOn(fakeBrowser.tabs, 'query').mockResolvedValue([] as never);
    expect(await isContentScriptReady()).toBe(false);
  });

  it('reports a helpful error when pick cannot reach the page', async () => {
    stubTab(() => Promise.reject(new Error('x')));
    const result = await startPicking();
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error).toMatch(/Reload/);
  });

  it('succeeds when the page acknowledges', async () => {
    stubTab(() => Promise.resolve({ ok: true }));
    expect(await startPicking()).toEqual({ ok: true });
  });
});
