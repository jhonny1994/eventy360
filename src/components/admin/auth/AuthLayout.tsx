'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  illustrationSrc?: string;
  illustrationAlt?: string;
}

/**
 * Standardized layout component for admin authentication pages
 * Two-column layout with content on left and illustration on right
 */
export default function AuthLayout({
  children,
  illustrationSrc = '/illustrations/login.svg',
  illustrationAlt = 'Authentication illustration'
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-stretch bg-background text-foreground">
      {/* Left Column: Content */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-8 md:p-12">
        {children}
      </div>
      
      {/* Right Column: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-blue-50 dark:bg-blue-950/30 p-12">
        <div className="w-full max-w-md text-center">
          <Image
            src={illustrationSrc}
            alt={illustrationAlt}
            width={500}
            height={500}
            priority
            className="mx-auto"
          />
        </div>
      </div>
    </div>
  );
} 