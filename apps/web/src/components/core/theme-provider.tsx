'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import * as React from 'react';

import {
  isResolvedTheme,
  isThemePreference,
  persistThemeCookies,
  type ThemePreference,
} from '@/theme/theme-cookie';

export { useTheme };

function ThemeCookieSync() {
  const { resolvedTheme, theme } = useTheme();

  React.useEffect(() => {
    if (!isThemePreference(theme) || !isResolvedTheme(resolvedTheme)) {
      return;
    }

    persistThemeCookies(theme, resolvedTheme);
  }, [resolvedTheme, theme]);

  return null;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: Readonly<ThemeProviderProps>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      disableTransitionOnChange
      enableSystem
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
