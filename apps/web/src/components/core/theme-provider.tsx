import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DEFAULT_RESOLVED_THEME,
  getStoredThemePreference,
  persistTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@/theme/theme-cookie';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemePreference;
  defaultResolvedTheme?: ResolvedTheme;
}

export function ThemeProvider({
  children,
  defaultTheme,
  defaultResolvedTheme = DEFAULT_RESOLVED_THEME,
}: Readonly<ThemeProviderProps>) {
  const [theme, setThemeState] = useState<ThemePreference>(() => defaultTheme ?? getStoredThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(defaultResolvedTheme);

  const setTheme = useCallback((newTheme: ThemePreference) => {
    setThemeState(newTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const nextResolvedTheme: ResolvedTheme = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;

      setResolvedTheme(nextResolvedTheme);
      document.documentElement.setAttribute('data-theme', nextResolvedTheme);
      document.documentElement.setAttribute('data-theme-preference', theme);
      persistTheme(theme, nextResolvedTheme);
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [resolvedTheme, setTheme, theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
