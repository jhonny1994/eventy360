"use client";

import { Badge, Tooltip } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import { HiCheckCircle, HiExclamation, HiClock, HiXCircle } from 'react-icons/hi';

export interface SubscriptionStatusIndicatorProps {
  status: 'active' | 'expired' | 'trial' | 'cancelled';
  tier: 'free' | 'paid_researcher' | 'paid_organizer' | 'trial';
  daysRemaining?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDaysRemaining?: boolean;
  className?: string;
}

export default function SubscriptionStatusIndicator({
  status,
  tier,
  daysRemaining = 0,
  size = 'md',
  showIcon = true,
  showDaysRemaining = true,
  className = '',
}: SubscriptionStatusIndicatorProps) {
  const t = useTranslations('Subscription');

  // Determine badge color based on status and tier
  let color = 'dark'; // Default
  let icon = null;
  
  if (tier === 'free') {
    color = 'dark';
    icon = null;
  } else if (status === 'active') {
    color = 'success';
    icon = <HiCheckCircle className="h-4 w-4" />;
  } else if (status === 'trial') {
    color = 'info';
    icon = <HiClock className="h-4 w-4" />;
  } else if (status === 'expired') {
    color = 'warning';
    icon = <HiExclamation className="h-4 w-4" />;
  } else if (status === 'cancelled') {
    color = 'failure';
    icon = <HiXCircle className="h-4 w-4" />;
  }

  // Get status text
  const getStatusText = () => {
    if (tier === 'free') return t('free');
    
    switch (status) {
      case 'active':
        return tier === 'paid_researcher' ? t('paidResearcher') : t('paidOrganizer');
      case 'trial':
        return t('trial');
      case 'expired':
        return t('expired');
      case 'cancelled':
        return t('cancelled');
      default:
        return t('free');
    }
  };

  // Days remaining info
  const daysRemainingText = daysRemaining > 0 ? t('daysRemaining', { days: daysRemaining }) : '';
  
  // Determine if we should show tooltip
  const showTooltip = status === 'trial' || status === 'active';

  const badge = (
    <Badge 
      color={color}
      size={size}
      className={`flex items-center space-x-1 rtl:space-x-reverse ${className}`}
      data-testid="subscription-status-badge"
    >
      {showIcon && icon && <span>{icon}</span>}
      <span>{getStatusText()}</span>
      {showDaysRemaining && daysRemainingText && status !== 'expired' && (
        <span className="ms-1 text-xs">({daysRemainingText})</span>
      )}
    </Badge>
  );

  if (showTooltip && daysRemaining > 0) {
    return (
      <Tooltip 
        content={status === 'trial' ? t('trialTooltip', { days: daysRemaining }) : t('subscriptionTooltip', { days: daysRemaining })}
        placement="bottom"
        animation="duration-300"
      >
        {badge}
      </Tooltip>
    );
  }

  return badge;
} 