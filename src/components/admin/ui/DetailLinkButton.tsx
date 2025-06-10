'use client';

import Link from 'next/link';
import { HiEye } from 'react-icons/hi';
import { useLocale } from 'next-intl';

interface DetailLinkButtonProps {
  href: string;
  label: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Button component for linking to detail pages in admin routes
 * Supports RTL layout and disabled state
 * 
 * @param props Component props
 * @returns DetailLinkButton component
 */
export default function DetailLinkButton({
  href,
  label,
  disabled = false,
  className = '',
  onClick
}: DetailLinkButtonProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <Link 
      href={disabled ? '#' : href}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg 
        ${disabled 
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
        } ${className}`}
      onClick={handleClick}
    >
      <HiEye className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
      {label}
    </Link>
  );
} 