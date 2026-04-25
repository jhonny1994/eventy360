'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { ReactNode, ComponentType, useState, useEffect } from 'react';
import { Card, Spinner } from 'flowbite-react';
import { HiOutlineLockClosed } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import SubscriptionStatusIndicator from '../ui/SubscriptionStatusIndicator';

export interface WithSubscriptionGuardOptions {
  /**
   * Set to false to show a subscription required message instead of redirecting
   */
  redirectToUpgrade?: boolean;
  /**
   * Custom component to render when subscription is required
   */
  CustomSubscriptionRequiredComponent?: ComponentType<{ redirectToUpgrade?: boolean }>;
}

/**
 * A higher-order component that protects premium features by checking subscription status
 * 
 * @param Component The component to wrap with subscription protection
 * @param options Configuration options for the guard
 * @returns A new component with subscription protection
 */
export function withSubscriptionGuard<P extends object>(
  Component: ComponentType<P>,
  options: WithSubscriptionGuardOptions = { redirectToUpgrade: true }
) {
  return function SubscriptionProtectedComponent(props: P & { children?: ReactNode }) {
    const { 
      subscriptionData, 
      loading, 
      canAccessPremiumFeature 
    } = useSubscription();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const t = useTranslations('Subscription');
    
    useEffect(() => {
      if (!loading) {
        setHasAccess(canAccessPremiumFeature());
      }
    }, [loading, canAccessPremiumFeature]);
    
    if (loading || hasAccess === null) {
      return (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      );
    }

    if (!hasAccess) {
      if (options.CustomSubscriptionRequiredComponent) {
        return <options.CustomSubscriptionRequiredComponent redirectToUpgrade={options.redirectToUpgrade} />;
      }

      return (
        <Card className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center p-4">
            <div className="p-3 bg-amber-100 rounded-full mb-4">
              <HiOutlineLockClosed className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">{t('premiumFeatureTitle')}</h2>
            <p className="mb-4 text-gray-600">{t('premiumFeatureDescription')}</p>
            
            {subscriptionData?.subscription && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">{t('currentSubscription')}:</p>
                <SubscriptionStatusIndicator
                  status={subscriptionData.subscription.status}
                  tier={subscriptionData.subscription.tier}
                  daysRemaining={subscriptionData.subscription.days_remaining}
                />
              </div>
            )}
            
            <div className="mt-4">
              <Link
                href="/profile?tab=subscription"
                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                {t('upgradeSubscription')}
              </Link>
            </div>
          </div>
        </Card>
      );
    }

    return <Component {...props} />;
  };
} 