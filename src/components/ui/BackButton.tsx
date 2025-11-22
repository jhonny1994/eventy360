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
  let buttonLabel = label || 'Back';
  
  try {
    const t = useTranslations('UIComponents.BackButton');
    if (!label) {
      buttonLabel = t('defaultLabel');
    }
  } catch {
    // ignore
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