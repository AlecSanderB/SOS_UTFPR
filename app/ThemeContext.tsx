import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { DarkTheme, LightTheme, Theme } from "./theme";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
};

const STORAGE_KEY_THEME = "@app_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_THEME);
        if (stored === "dark") setIsDark(true);
        else setIsDark(false);
      } catch (err) {
        console.error("Failed to load theme from storage", err);
      } finally {
        setLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, newValue ? "dark" : "light");
    } catch (err) {
      console.error("Failed to save theme to storage", err);
    }
  };

  if (!loaded) return null;

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);