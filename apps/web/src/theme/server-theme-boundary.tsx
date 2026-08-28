import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import { ThemeProvider } from '@/components/core/theme-provider';
import {
  parseResolvedTheme,
  parseThemePreference,
  RESOLVED_THEME_COOKIE_KEY,
  THEME_COOKIE_KEY,
} from '@/theme/theme-cookie';

export async function ServerThemeBoundary({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const theme = parseThemePreference(cookieStore.get(THEME_COOKIE_KEY)?.value);
  const storedResolvedTheme = parseResolvedTheme(cookieStore.get(RESOLVED_THEME_COOKIE_KEY)?.value);
  const resolvedTheme = theme === 'system' ? storedResolvedTheme : theme;

  return (
    <ThemeProvider defaultTheme={theme} defaultResolvedTheme={resolvedTheme}>
      <div
        className="min-h-dvh bg-background text-foreground"
        data-theme={resolvedTheme}
        data-theme-preference={theme}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
