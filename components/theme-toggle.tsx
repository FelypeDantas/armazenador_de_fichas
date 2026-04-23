"use client";

import { useTheme } from "next-themes";
import { ReactNode, useEffect, useState } from "react";

export function ThemeToggle({ children }: { children?: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button onClick={() => setTheme(isDark ? "light" : "dark")}>
      {children}
    </button>
  );
}
