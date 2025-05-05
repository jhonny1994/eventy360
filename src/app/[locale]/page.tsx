"use client"; // Required for hooks like useTranslations and event handlers

import { useTranslations } from 'next-intl';
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';

export default function Home() {
  const t = useTranslations('HomePage');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-24">Loading...</div>; // Added a simple loading state
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-12 md:p-24">
      {/* Theme Toggle - Use neutral colors for base */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          // Card background (White/Darker Surface), Neutral border, Neutral text
          className="p-2 rounded-md border bg-background text-foreground shadow-md"
        >
          Toggle: {theme}
        </button>
      </div>

      {/* Use foreground color for heading */}
      <h1 className="text-4xl font-bold text-foreground">{t('title')} - New Theme</h1>

      {/* Buttons using New Theme Guidelines */}
      <div className="flex flex-wrap gap-4">
        {/* Primary Button: bg Primary, text White / bg Primary-Dark, text Neutral Dark */}
        <button type="button" className="text-white bg-primary hover:opacity-90 focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-neutral-dark dark:bg-primary dark:hover:opacity-90 dark:focus:ring-primary/50">
          Primary Button
        </button>
        {/* Secondary Button: bg Secondary, text Neutral Dark / bg Secondary-Dark, text Neutral Dark */}
        <button type="button" className="text-neutral-dark bg-secondary hover:opacity-90 focus:ring-4 focus:ring-secondary/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-neutral-dark dark:bg-secondary dark:hover:opacity-90 dark:focus:ring-secondary/50">
          Secondary Button
        </button>
        {/* Link Text Example (using primary colors) */}
        <a href="#" className="text-primary hover:underline dark:text-primary">
          Link Text
        </a>
      </div>

      {/* Simple Card Example - Use explicit background */}
      <div className="w-full max-w-md p-6 bg-background border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Dummy Card</h2>
        {/* Secondary text: ~60% opacity on Neutral Dark / Neutral Light */}
        <p className="text-neutral-dark/60 dark:text-neutral-light/60">
          This card uses the specific card background (white / #121212) and neutral border/text colors.
        </p>
      </div>

      {/* Alerts using New Theme Guidelines */}
      <div className="w-full max-w-md p-4 bg-accent-success border text-white rounded-lg dark:bg-accent-success dark:text-neutral-dark">
        <p><strong className="font-bold">Success:</strong> Alert using Accent/Success color.</p>
      </div>
      <div className="w-full max-w-md p-4 bg-info border text-white rounded-lg dark:bg-info dark:text-neutral-dark">
        <p><strong className="font-bold">Info:</strong> Alert using Info color.</p>
      </div>
      <div className="w-full max-w-md p-4 bg-warning border text-neutral-dark rounded-lg dark:bg-warning dark:text-neutral-dark">
        <p><strong className="font-bold">Warning:</strong> Alert using Warning color.</p>
      </div>
       <div className="w-full max-w-md p-4 bg-error border text-white rounded-lg dark:bg-error dark:text-neutral-dark">
        <p><strong className="font-bold">Error:</strong> Alert using Error color.</p>
      </div>

    </main>
  );
} 