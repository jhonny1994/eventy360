'use client';

import { Card, Badge, Button } from 'flowbite-react';
import { HiCalendar, HiLocationMarker, HiBookmark, HiExternalLink, HiClock } from 'react-icons/hi';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '@/database.types';

type Event = Database['public']['Functions']['discover_events']['Returns'][0];

interface EventCardGridProps {
  events: Event[];
  isLoading: boolean;
  locale: string;
}

interface EventCardProps {
  event: Event;
  locale: string;
}

/**
 * Individual event card component
 * Displays event information in a clean, accessible format
 */
function EventCard({ event, locale }: EventCardProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events.card');
  const tEnums = useTranslations('Enums');

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  // Get status color
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

  // Get format icon
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'virtual': return '💻';
      case 'hybrid': return '🌐';
      default: return '📍';
    }
  };
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300" dir={isRtl ? 'rtl' : 'ltr'}>
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
      <div className="flex-1 space-y-3">
        {/* Header with Status */}
        <div className={`flex items-start ${isRtl ? 'flex-row-reverse' : ''} justify-between`}>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
              {event.event_name}
            </h3>
            {event.event_subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                {event.event_subtitle}
              </p>
            )}
          </div>
          <Badge 
            color={getStatusColor(event.status)}
            size="sm"
            className={isRtl ? 'mr-2' : 'ml-2'}
          >
            {tEnums(`EventStatus.${event.status}`)}
          </Badge>
        </div>

        {/* Event Dates */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiCalendar className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 flex-shrink-0`} />
          <span>{formatDate(event.event_date)}</span>
          {event.event_end_date && event.event_end_date !== event.event_date && (
            <span className={isRtl ? 'mr-2' : 'ml-2'}>
              - {formatDate(event.event_end_date)}
            </span>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <HiLocationMarker className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 flex-shrink-0`} />
          <span>{event.wilaya_name}</span>
          {event.daira_name && (
            <span className={isRtl ? 'mr-1' : 'ml-1'}>، {event.daira_name}</span>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t('organizer')}:</span>
          <span className={isRtl ? 'mr-2' : 'ml-2'}>{event.organizer_name}</span>
        </div>

        {/* Format */}
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span className={isRtl ? 'ml-2' : 'mr-2'}>{getFormatIcon(event.format)}</span>
          <span>{tEnums(`EventFormat.${event.format}`)}</span>
        </div>

        {/* Topics */}
        {event.topics && event.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.topics.slice(0, 3).map((topic, index) => (
              <Badge key={index} color="light" size="sm">
                {topic}
              </Badge>
            ))}
            {event.topics.length > 3 && (
              <Badge color="light" size="sm">
                +{event.topics.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Submission Deadline */}
        {event.abstract_submission_deadline && (
          <div className="flex items-center text-sm text-orange-600 dark:text-orange-400">
            <HiClock className={`${isRtl ? 'ml-2' : 'mr-2'} h-4 w-4 flex-shrink-0`} />
            <span>
              {t('submissionDeadline')}: {formatDate(event.abstract_submission_deadline)}
            </span>
          </div>
        )}
      </div>      {/* Actions */}
      <div className={`flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          {/* View Details Button */}
          <Link href={`/${locale}/events/${event.id}`}>
            <Button size="sm" color="info">
              <HiExternalLink className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
              {t('viewDetails')}
            </Button>
          </Link>
        </div>

        {/* Bookmark Button - Future feature */}
        <Button 
          size="sm" 
          color="light"
          disabled
          title={t('bookmarkTooltip')}
        >
          <HiBookmark className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

/**
 * Grid layout for event cards
 * Includes loading states and empty states
 */
export default function EventCardGrid({
  events,
  isLoading,
  locale
}: EventCardGridProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events.discovery');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="h-96 animate-pulse">
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </Card>
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          locale={locale}
        />
      ))}
    </div>
  );
}
