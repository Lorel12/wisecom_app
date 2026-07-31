"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Changer de thème"
      className="flex size-10 items-center justify-center cursor-pointer rounded-lg text-foreground transition-colors hover:bg-secondary"
    >
      {mounted && (isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />)}
    </button>
  );
}
