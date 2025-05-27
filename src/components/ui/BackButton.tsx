'use client';

import { Button } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export interface BackButtonProps {
  href: string;
  label?: string;
  color?: 'light' | 'gray' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * A simple back navigation button that links to a specific page
 * Uses translations if available, falls back to provided label or default
 */
export default function BackButton({
  href,
  label,
  color = 'light',
  size = 'sm',
}: BackButtonProps) {
  // Always call useTranslations to avoid conditional hook errors
  let buttonLabel = label || 'Back';
  
  try {
    const t = useTranslations('UIComponents.BackButton');
    // Only override buttonLabel if no explicit label was provided
    if (!label) {
      buttonLabel = t('defaultLabel');
    }
  } catch {
    // If translations are not available, use the default or provided label
    console.log('Translation not available for BackButton, using default');
  }
  
  return (
    <Link href={href} className="inline-block">
      <Button color={color} size={size} className="flex items-center gap-1">
        <HiArrowLeft className="h-4 w-4" />
        <span>{buttonLabel}</span>
      </Button>
    </Link>
  );
}