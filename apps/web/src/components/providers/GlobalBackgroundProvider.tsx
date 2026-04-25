"use client";

import dynamic from "next/dynamic";

// Dynamically import the GlobalBackground component with SSR disabled
const GlobalBackground = dynamic(() => import("../ui/GlobalBackground"), {
  ssr: false,
  loading: () => null,
});

/**
 * GlobalBackgroundProvider - Client component that loads the particle background
 * Used in the root layout to provide the animated background across all pages
 */
export function GlobalBackgroundProvider() {
  return <GlobalBackground />;
} 