"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={props.attribute}
      defaultTheme={props.defaultTheme}
      enableSystem={props.enableSystem}
      disableTransitionOnChange={props.disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
} 