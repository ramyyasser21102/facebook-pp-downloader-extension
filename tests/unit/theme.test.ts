import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  applyTheme,
  getStoredTheme,
  setStoredTheme,
  watchTheme,
} from '@/lib/theme';

describe('theme', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to system when nothing is stored', async () => {
    expect(await getStoredTheme()).toBe('system');
  });

  it('ignores invalid stored values', async () => {
    await fakeBrowser.storage.local.set({ theme: 'purple' });
    expect(await getStoredTheme()).toBe('system');
  });

  it('persists an explicit preference', async () => {
    await setStoredTheme('dark');
    expect(await getStoredTheme()).toBe('dark');
  });

  it('toggles the dark class', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    applyTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('propagates changes made elsewhere', async () => {
    const seen: string[] = [];
    const stop = watchTheme((theme) => seen.push(theme));
    await setStoredTheme('dark');
    await Promise.resolve();
    expect(seen).toContain('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    stop();
  });
});
