export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';
const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function isTheme(value: unknown): value is Theme {
  return THEMES.includes(value as Theme);
}

/** Reads the explicit preference from storage; `system` when none is saved. */
export async function getStoredTheme(): Promise<Theme> {
  const stored = (await browser.storage.local.get(STORAGE_KEY))[STORAGE_KEY];
  return isTheme(stored) ? stored : 'system';
}

export async function setStoredTheme(theme: Theme): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: theme });
}

/** Toggles the `.dark` class that theme.css keys off. */
export function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && darkQuery().matches);
  document.documentElement.classList.toggle('dark', dark);
}

/**
 * Applies the theme now and keeps it in sync with the OS setting and with
 * changes made from any other extension page. Returns an unsubscribe function.
 */
export function watchTheme(onChange: (theme: Theme) => void): () => void {
  let current: Theme = 'system';
  const update = (theme: Theme) => {
    current = theme;
    applyTheme(theme);
    onChange(theme);
  };

  const onStorage = (
    changes: Record<string, { newValue?: unknown }>,
    area: string,
  ) => {
    if (area !== 'local' || !(STORAGE_KEY in changes)) return;
    const next = changes[STORAGE_KEY]?.newValue;
    update(isTheme(next) ? next : 'system');
  };
  const onSystem = () => applyTheme(current);

  browser.storage.onChanged.addListener(onStorage);
  darkQuery().addEventListener('change', onSystem);
  void getStoredTheme().then(update);

  return () => {
    browser.storage.onChanged.removeListener(onStorage);
    darkQuery().removeEventListener('change', onSystem);
  };
}
