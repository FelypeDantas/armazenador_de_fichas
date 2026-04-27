"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

type ThemeToggleProps = {
  children?: ReactNode;
};

export function ThemeToggle({ children }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      {children}
    </button>
  );
}
