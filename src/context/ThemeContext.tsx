import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeColors } from '../constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_STORAGE_KEY = '@birdwatch_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = Colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
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
