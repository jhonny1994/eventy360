'use client';

import { Badge } from 'flowbite-react';
import { HiCheckCircle, HiExclamation, HiClock, HiXCircle } from 'react-icons/hi';
import { useLocale } from 'next-intl';

export type StatusType = 
  | 'active' 
  | 'trial' 
  | 'expired' 
  | 'cancelled'
  | 'verified'
  | 'pending_verification'
  | 'rejected'
  | 'free';

type BadgeColor = 'success' | 'warning' | 'failure' | 'info' | 'dark' | 'gray';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

/**
 * Universal status badge component for consistent status display across the application
 * Can be used for subscriptions, payments, verifications, etc.
 */
export default function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const locale = useLocale();
  const isRtl = locale === 'ar';
  
  let color: BadgeColor = 'gray';
  let icon = null;
  
  switch (status) {
    case 'active':
    case 'verified':
      color = 'success';
      icon = <HiCheckCircle className="h-4 w-4" />;
      break;
    case 'trial':
      color = 'info';
      icon = <HiClock className="h-4 w-4" />;
      break;
    case 'expired':
    case 'pending_verification':
      color = 'warning';
      icon = <HiExclamation className="h-4 w-4" />;
      break;
    case 'cancelled':
    case 'rejected':
      color = 'failure';
      icon = <HiXCircle className="h-4 w-4" />;
      break;
    case 'free':
      color = 'dark';
      break;
    default:
      color = 'gray';
  }

  return (
    <Badge 
      color={color}
      size={size}
      className={`inline-flex items-center px-3 ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-1.5">
        {showIcon && icon && (
          <span className="flex">
            {icon}
          </span>
        )}
        <span>
          {label || status}
        </span>
      </div>
    </Badge>
  );
} 