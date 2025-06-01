'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Tooltip } from 'flowbite-react';
import { BookmarkPlus, BookmarkCheck, Loader2 } from 'lucide-react';
import { toggleBookmark, isEventBookmarked } from '@/app/[locale]/profile/bookmarks/actions';
import { useSubscription } from '@/hooks/useSubscription';

export interface BookmarkButtonProps {
  eventId: string;
  initialBookmarked?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'light' | 'dark' | 'success' | 'failure' | 'warning' | 'purple' | 'pink';
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
}

export function BookmarkButton({
  eventId,
  initialBookmarked = false,
  size = 'md',
  color = 'light',
  className = '',
  showText = true,
  iconOnly = false,
  disabled = false,
}: BookmarkButtonProps) {
  const t = useTranslations('Bookmarks');
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { canAccessPremiumFeature, loading: subscriptionLoading } = useSubscription();

  // Check bookmark status on mount
  useEffect(() => {
    async function checkBookmarkStatus() {
      try {
        const status = await isEventBookmarked(eventId);
        setIsBookmarked(status);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    }
    
    checkBookmarkStatus();
  }, [eventId]);
  
  // Also update state when initialBookmarked prop changes
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const hasSubscription = !subscriptionLoading && canAccessPremiumFeature();
  const isDisabled = disabled || subscriptionLoading || !hasSubscription;

  const handleBookmark = async () => {
    if (isDisabled || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await toggleBookmark(eventId);
      if (result.success) {
        setIsBookmarked(result.isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <BookmarkPlus className="w-5 h-5" />
      )}
      {showText && !iconOnly && (
        <span className={isLoading ? 'ml-2 opacity-0' : 'ml-2'}>
          {isBookmarked ? t('removeBookmark') : t('addBookmark')}
        </span>
      )}
    </>
  );

  // Tooltip content based on subscription status
  const tooltipContent = !hasSubscription && !subscriptionLoading
    ? t('subscriptionRequired')
    : isBookmarked
      ? t('removeBookmarkTooltip')
      : t('addBookmarkTooltip');

  return (
    <Tooltip content={tooltipContent} placement="top">
      <div>
        <Button
          color={color}
          size={size}
          className={className}
          disabled={isDisabled}
          onClick={handleBookmark}
        >
          {buttonContent}
        </Button>
      </div>
    </Tooltip>
  );
} 