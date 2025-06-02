"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Initialize theme to always be dark
  useEffect(() => {
    setThemeState('dark');
  }, []);

  // Apply dark theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('crm-theme', 'dark');
  }, [theme]);

  const toggleTheme = () => {
    // Do nothing - theme toggle is disabled
  };

  const setTheme = (newTheme: Theme) => {
    // Always keep dark theme
    setThemeState('dark');
  };

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 