'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'amethyst' | 'sapphire' | 'emerald' | 'rose';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { name: Theme; label: string; colors: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { 
    name: 'amethyst' as Theme, 
    label: 'Amethyst', 
    colors: 'from-purple-500 to-pink-500' 
  },
  { 
    name: 'sapphire' as Theme, 
    label: 'Sapphire', 
    colors: 'from-blue-500 to-cyan-400' 
  },
  { 
    name: 'emerald' as Theme, 
    label: 'Emerald', 
    colors: 'from-emerald-500 to-blue-500' 
  },
  { 
    name: 'rose' as Theme, 
    label: 'Rose', 
    colors: 'from-rose-500 to-orange-400' 
  },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('amethyst');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && themes.find(t => t.name === savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch {
      /* Storage can be blocked; fall back to the default. */
    }
  }, []);

  // Save only when the visitor picks a theme. Saving whenever the theme changes would store the default
  // on first load, before the saved choice has been read back, and overwrite it.
  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* Not saved; the choice still applies for this visit. */
    }
  };

  useEffect(() => {
    document.documentElement.classList.remove('theme-amethyst', 'theme-sapphire', 'theme-emerald', 'theme-rose');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const value = { theme, setTheme, themes };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}