'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

interface AuthCardProps {
  title: string;
  logoAltText: string;
  children: ReactNode;
}

/**
 * Standardized card component for admin authentication pages
 * Contains the logo, title, and content wrapper
 */
export default function AuthCard({ title, logoAltText, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 sm:p-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Image
          src="/png/logo.png"
          alt={logoAltText}
          width={180}
          height={60}
          style={{ height: 'auto', width: 'auto', maxWidth: '180px' }}
          priority
          className="mx-auto"
        />
      </div>

      <h2 className="mb-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground dark:text-white">
        {title}
      </h2>

      {children}
    </div>
  );
} 