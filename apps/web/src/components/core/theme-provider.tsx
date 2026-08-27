import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredThemePreference, setStoredThemePreference, ThemePreference } from '@/theme/theme-cookie';

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: ThemePreference }> = ({
  children,
  defaultTheme,
}) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => defaultTheme || getStoredThemePreference());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    setStoredThemePreference(newTheme);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const nextResolvedTheme = theme === 'system'
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;

      setResolvedTheme(nextResolvedTheme);
      document.documentElement.setAttribute('data-theme', nextResolvedTheme);
      document.documentElement.style.colorScheme = nextResolvedTheme;
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
