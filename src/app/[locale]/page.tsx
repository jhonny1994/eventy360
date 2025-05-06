"use client"; // Required for hooks like useTranslations and event handlers

import { useTranslations } from 'next-intl';
import { useTheme } from "next-themes";
import { useEffect, useState } from 'react';

export default function Home() {
  const t = useTranslations('HomePage');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using theme
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Avoid rendering theme-dependent UI on the server or during hydration mismatch
    // You could return null or a generic loader skeleton here
    return <div className="p-24">{t('loading')}</div>; // Use translation
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-12 md:p-24">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label={t('AriaLabels.toggleTheme')} // Use translation
          className="p-2 rounded-md border bg-background text-foreground shadow-md"
        >
          {theme === 'light' ? '🌙' : '☀️'} {/* Icons are less likely to need translation */}
        </button>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-foreground">{t('title')} - New Theme</h1>

      {/* Button Examples */}
      <div className="flex flex-wrap gap-4">
        {/* Primary Button */}
        <button type="button" className="text-white bg-primary hover:opacity-90 focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-neutral-dark dark:bg-primary dark:hover:opacity-90 dark:focus:ring-primary/50">
          {t('primaryButton')}
        </button>
        {/* Secondary Button */}
        <button type="button" className="text-neutral-dark bg-secondary hover:opacity-90 focus:ring-4 focus:ring-secondary/50 font-medium rounded-lg text-sm px-5 py-2.5 dark:text-neutral-dark dark:bg-secondary dark:hover:opacity-90 dark:focus:ring-secondary/50">
          {t('secondaryButton')}
        </button>
        {/* Link Example */}
        <a href="#" className="text-primary hover:underline dark:text-primary">
          {t('linkExample')}
        </a>
      </div>

      {/* Card Example */}
      <div className="w-full max-w-md p-6 bg-background border rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2 text-foreground">{t('dummyCardTitle')}</h2>
        {/* Changed text color for better contrast */}
        <p className="text-neutral-dark/60 dark:text-neutral-light/60">
         {t('dummyCardContent')}
        </p>
      </div>

      {/* Alert Examples */}
      <div className="w-full max-w-md p-4 bg-accent-success border text-white rounded-lg dark:bg-accent-success dark:text-neutral-dark">
        <p><strong className="font-bold">{t('alertSuccessPrefix')}</strong> {t('alertSuccessContent')}</p>
      </div>
      <div className="w-full max-w-md p-4 bg-info border text-white rounded-lg dark:bg-info dark:text-neutral-dark">
        <p><strong className="font-bold">{t('alertInfoPrefix')}</strong> {t('alertInfoContent')}</p>
      </div>
      <div className="w-full max-w-md p-4 bg-warning border text-neutral-dark rounded-lg dark:bg-warning dark:text-neutral-dark">
        <p><strong className="font-bold">{t('alertWarningPrefix')}</strong> {t('alertWarningContent')}</p>
      </div>
      <div className="w-full max-w-md p-4 bg-error border text-white rounded-lg dark:bg-error dark:text-neutral-dark">
        <p><strong className="font-bold">{t('alertErrorPrefix')}</strong> {t('alertErrorContent')}</p>
      </div>
    </main>
  );
} 