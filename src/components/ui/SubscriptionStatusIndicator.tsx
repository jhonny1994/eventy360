"use client";

import { Tooltip } from 'flowbite-react';
import { useTranslations } from 'next-intl';
import StatusBadge from './StatusBadge';

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

  // Use our consistent StatusBadge component
  const badge = (
    <StatusBadge 
      status={tier === 'free' ? 'free' : status}
      label={`${getStatusText()}${showDaysRemaining && daysRemainingText && status !== 'expired' ? ` (${daysRemainingText})` : ''}`}
      size={size}
      showIcon={showIcon}
      className={className}
    />
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