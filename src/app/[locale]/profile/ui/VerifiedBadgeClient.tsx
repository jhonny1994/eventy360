'use client';

import { HiCheckCircle } from 'react-icons/hi2';

interface VerifiedBadgeClientProps {
  className?: string;
}

export default function VerifiedBadgeClient({ className }: VerifiedBadgeClientProps) {
  return (
    <span className={`inline-flex items-center justify-center ${className || ''}`}>
      <HiCheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    </span>
  );
} 