"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Light, dark or the device setting (the default). next-themes sets the
 * `dark` class on <html> before the first paint, so there is no flash of the
 * wrong theme, and remembers the choice in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
