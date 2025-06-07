"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

/**
 * Dynamic import of the FeaturesSection component
 * Uses Next.js dynamic imports for optimized loading
 */
const FeaturesSection = dynamic(
  () => import('./FeaturesSection'),
  {
    loading: () => (
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 dark:bg-transparent py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="h-8 w-48 mx-auto mb-4 bg-neutral-mid/20 animate-pulse rounded"></div>
          <div className="h-4 max-w-2xl mx-auto mb-12 bg-neutral-mid/20 animate-pulse rounded"></div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg bg-background dark:bg-background/30 p-6 text-center shadow-sm backdrop-blur-sm">
                <div className="mb-4 h-12 w-12 mx-auto rounded-lg bg-neutral-mid/20 animate-pulse"></div>
                <div className="mb-2 h-5 w-32 mx-auto bg-neutral-mid/20 animate-pulse rounded"></div>
                <div className="h-12 mx-auto bg-neutral-mid/20 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
);

/**
 * ClientFeaturesSection - Client-side rendered FeaturesSection with loading state
 * 
 * This wrapper ensures the features section is loaded client-side while 
 * providing a smooth loading experience
 */
const ClientFeaturesSection = () => {
  return (
    <Suspense>
      <FeaturesSection />
    </Suspense>
  );
};

export default ClientFeaturesSection; 