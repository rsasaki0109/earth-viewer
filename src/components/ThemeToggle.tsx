import type { Theme } from '../hooks/useTheme';

export interface ThemeToggleProps {
  theme: Theme;
  onToggle(): void;
}

/** Icon-only light/dark theme toggle. */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps): JSX.Element {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
