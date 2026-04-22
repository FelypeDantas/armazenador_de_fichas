"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(STORAGE_KEY);
  return value === "dark" || value === "light" ? value : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return getStoredTheme() ?? getSystemTheme();
  });

  // 🌱 aplica tema SEM mounted state
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Alternar tema"
      className="
        relative w-12 h-12 rounded-full
        flex items-center justify-center
        bg-gradient-to-br from-rose-500 to-pink-600
        text-white shadow-lg
        transition-all duration-300
        hover:scale-110 active:scale-95
      "
    >
      <span className="text-xl">
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}