import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredThemePreference, setStoredThemePreference, ThemePreference } from '@/theme/theme-cookie';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode; defaultTheme?: ThemePreference }> = ({
  children,
  defaultTheme,
}) => {
  const [theme, setThemeState] = useState<ThemePreference>(() => defaultTheme || getStoredThemePreference());

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    setStoredThemePreference(newTheme);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
