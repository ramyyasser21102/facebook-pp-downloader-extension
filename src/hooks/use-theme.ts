import { useEffect, useState } from 'react';
import { setStoredTheme, type Theme, watchTheme } from '@/lib/theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => watchTheme(setTheme), []);

  return { theme, setTheme: (next: Theme) => void setStoredTheme(next) };
}
