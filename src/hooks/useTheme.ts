import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'earth-viewer.theme';

function readStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function prefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export interface UseThemeResult {
  theme: Theme;
  toggleTheme(): void;
  setTheme(theme: Theme): void;
}

/**
 * Tracks the active light/dark theme, initialized from a previously saved
 * choice or the OS `prefers-color-scheme`, and reflects it onto
 * `<html data-theme>` so CSS variables can key off it. Choices are persisted
 * to LocalStorage; storage failures are swallowed (the in-memory state still
 * works for the session).
 */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme() ?? (prefersDark() ? 'dark' : 'light'));

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage failures; theme still applies for this session.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
