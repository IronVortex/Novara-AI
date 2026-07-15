import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, THEMES } from "../constants/index.js";

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES[stored] ? stored : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (THEMES[next]) setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    themes: THEMES,
    isDark: theme !== "light",
  };
}
