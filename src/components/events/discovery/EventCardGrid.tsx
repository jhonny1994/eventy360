/**
 * EventCardGrid
 * 
 * This component displays a grid of event cards with dynamic loading states
 * and bookmark functionality.
 * 
 * Features:
 * - Responsive grid layout for various screen sizes
 * - Skeleton loading states for improved UX
 * - Empty state handling for no events
 * - Rich event card with formatted dates and status indicators
 * - Bookmark functionality for event saving
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and RTL support
 * - Consistent error handling and loading states
 * - Type-safe database interactions
 */

'use client';

import { Card, Badge, Button } from 'flowbite-react';
import { HiCalendar, HiLocationMarker, HiExternalLink, HiClock } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '@/database.types';
import { BookmarkButton } from '@/components/ui/BookmarkButton';
import { useEffect, useState } from 'react';
import { isEventBookmarked } from '@/app/[locale]/profile/bookmarks/actions';
import { useUserProfile } from '@/hooks/useUserProfile';

type Event = Database['public']['Functions']['discover_events']['Returns'][0];

interface EventCardGridProps {
  events: Event[];
  isLoading: boolean;
}

interface EventCardProps {
  event: Event;
}

/**
 * Individual event card component
 * Displays event information in a clean, accessible format
 */
function EventCard({ event }: EventCardProps) {
  const t = useTranslations('Events.card');
  const tEnums = useTranslations('Enums');
  const actualLocale = useLocale(); // Use the standardized hook
  const isRtl = actualLocale === 'ar';
  const [bookmarked, setBookmarked] = useState(false);
  const [checkingBookmarkStatus, setCheckingBookmarkStatus] = useState(true);
  const { profile } = useUserProfile();
  
  // Check if user is an organizer
  const isOrganizer = profile?.baseProfile?.user_type === 'organizer';

  // Check if the event is bookmarked on component mount
  useEffect(() => {
    async function checkBookmarkStatus() {
      try {
        const status = await isEventBookmarked(event.id);
        setBookmarked(status);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setCheckingBookmarkStatus(false);
      }
    }
    
    checkBookmarkStatus();
  }, [event.id]);

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(actualLocale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'info';
      case 'abstract_review': return 'warning';
      case 'full_paper_submission_open': return 'success';
      case 'full_paper_review': return 'warning';
      case 'completed': return 'gray';
      case 'canceled': return 'failure';
      default: return 'gray';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'virtual': return '💻';
      case 'hybrid': return '🌐';
      default: return '📍'; // Assuming 'in_person' or similar maps to this
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Event Logo */}
      {event.logo_url && (
        <div className="relative h-48 w-full mb-4">
          <Image
            src={event.logo_url}
            alt={event.event_name}
            fill
            className="object-cover rounded-t-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Event Content */}
      <div className="flex-1 flex flex-col space-y-4 p-4"> {/* Increased padding and main spacing */}
        {/* Header: Title, Subtitle, Status Badge (Vertical Stack) */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
            {event.event_name}
          </h3>
          {event.event_subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 mb-2 line-clamp-2"> {/* Allow more lines for subtitle */}
              {event.event_subtitle}
            </p>
          )}
          <div className="mt-2">
            <Badge 
              color={getStatusColor(event.status)}
              size="sm"
            >
              {tEnums(`EventStatus.${event.status}`)}
            </Badge>
          </div>
        </div>

        {/* Event Dates */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiCalendar className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 shrink-0`} /> {/* Slightly larger icon */}
          <span>{formatDate(event.event_date)}</span>
          {event.event_end_date && event.event_end_date !== event.event_date && (
            <span className={isRtl ? 'mr-2' : 'ml-2'}>
              - {formatDate(event.event_end_date)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiLocationMarker className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 shrink-0`} /> {/* Slightly larger icon */}
          <span>{event.wilaya_name}</span>
          {event.daira_name && (
            <span className={isRtl ? 'mr-1' : 'ml-1'}>، {event.daira_name}</span>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          {/* Using a generic icon or removing it for minimalism, let's use a subtle one or none */}
          {/* <HiUserCircle className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 shrink-0`} /> */}
          <span className="font-medium">{t('organizer')}:</span>
          <span className={isRtl ? 'mr-2' : 'ml-2'}>{event.organizer_name}</span>
        </div>

        {/* Format */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className={`${isRtl ? 'ml-2' : 'mr-2'} text-lg`}>{getFormatIcon(event.format)}</span> {/* Larger emoji icon */}
          <span>{tEnums(`EventFormat.${event.format}`)}</span>
        </div>

        {/* Topics */}
        {event.topics && event.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2"> {/* Slightly more gap */}
            {event.topics.slice(0, 3).map((topic, index) => (
              <Badge key={index} color="light" size="xs"> {/* Smaller badge text */}
                {topic}
              </Badge>
            ))}
            {event.topics.length > 3 && (
              <Badge color="light" size="xs">
                +{event.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Submission Deadline */}
        {event.abstract_submission_deadline && (
          <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
            <HiClock className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 shrink-0`} /> {/* Slightly larger icon */}
            <span className="font-medium">{t('submissionDeadline')}:</span>
            <span className={isRtl ? 'mr-1' : 'ml-1'}>{formatDate(event.abstract_submission_deadline)}</span>
          </div>
        )}
      </div>

      {/* Actions - Ensure this is at the bottom */}
      <div className={`flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <Link href={`/${actualLocale}/profile/events/${event.id}`}>
            <Button size="sm" color="info">
              <HiExternalLink className={`${isRtl ? 'ml-1.5' : 'mr-1.5'} h-4 w-4`} />
              {t('viewDetails')}
            </Button>
          </Link>
        </div>
        {/* Only show bookmark button if user is NOT an organizer */}
        {!isOrganizer && (
          <BookmarkButton 
            eventId={event.id}
            initialBookmarked={bookmarked}
            size="sm"
            color="light"
            iconOnly
            disabled={checkingBookmarkStatus}
          />
        )}
      </div>
    </Card>
  );
}

/**
 * Grid layout for event cards
 * Features:
 * - Responsive grid layout for displaying event cards
 * - Handles loading states with skeleton UI
 * - Provides empty state when no events are available
 * - Supports right-to-left layout for Arabic locale
 * 
 * Standardized patterns:
 * - useTranslations for internationalization
 * - useLocale for locale-aware formatting and rendering
 * - useUserProfile for user profile data
 */
export default function EventCardGrid({
  events,
  isLoading
}: EventCardGridProps) {
  const actualLocale = useLocale(); // Use the standardized hook
  const isRtl = actualLocale === 'ar';
  const t = useTranslations('Events.discovery');
  
  if (isLoading && events.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"> {/* Adjusted grid */}
        {Array.from({ length: 6 }).map((_, index) => ( // Adjusted skeleton count
          (<Card key={index} className="h-[450px] animate-pulse"> {/* Adjusted height for taller cards */}
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-3 p-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </Card>)
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="mx-auto max-w-md">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <HiCalendar className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {t('noEvents')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('noEventsDescription')}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
