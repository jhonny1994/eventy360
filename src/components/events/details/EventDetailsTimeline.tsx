/**
 * EventDetailsTimeline component for displaying event timeline
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 */
"use client";

import React from 'react';
import { Clock, CalendarCheck, Bell, CheckCircle } from 'lucide-react';
import useTranslations from '@/hooks/useTranslations';

interface EventDetailsTimelineProps {
  event: {
    event_date: string;
    event_end_date: string | null;
    submission_deadline: string | null;
    review_deadline: string | null;
    notification_date: string | null;
    submission_verdict_deadline: string; // Added final verdict deadline
  };
  locale: string; // Added locale prop
}

// Use string identifiers instead of direct component references
type IconName = 'Clock' | 'CalendarCheck' | 'Bell' | 'CheckCircle';

interface TimelineEvent {
  id: string;
  label: string;
  dateString: string | null;
  iconName: IconName;
  isDeadline?: boolean;
}

export function EventDetailsTimeline({ event, locale }: EventDetailsTimelineProps) {
  const t = useTranslations('EventDetails.timeline')
  const currentLocale = locale // Use the locale prop directly
  const now = new Date();
  const eventPoints: TimelineEvent[] = [
    { id: 'event_date', label: t('eventStarts'), dateString: event.event_date, iconName: 'Clock' },
    { id: 'event_end_date', label: t('eventEnds'), dateString: event.event_end_date, iconName: 'Clock' },
    { id: 'submission_deadline', label: t('submissionDeadline'), dateString: event.submission_deadline, iconName: 'CalendarCheck', isDeadline: true },
    { id: 'review_deadline', label: t('reviewDeadline'), dateString: event.review_deadline, iconName: 'CheckCircle', isDeadline: true },
    { id: 'notification_date', label: t('notificationDate'), dateString: event.notification_date, iconName: 'Bell' },
  ];

  const validTimelineItems = eventPoints
    .filter(point => point.dateString !== null && point.dateString !== undefined)
    .map(point => ({
      ...point,
      date: new Date(point.dateString!),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const getTimeRemaining = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));    if (days > 0) return `${days} ${days !== 1 ? t('timeRemaining.days') : t('timeRemaining.day')} ${t('timeRemaining.remaining')}`;
    if (hours > 0) return `${hours} ${hours !== 1 ? t('timeRemaining.hours') : t('timeRemaining.hour')} ${t('timeRemaining.remaining')}`;
    return t('timeRemaining.lessThanHour');
  };

  const getIconElement = (iconName: IconName) => {
    const iconProps = { className: "h-3 w-3" };
    switch (iconName) {
      case 'Clock': return <Clock {...iconProps} />;
      case 'CalendarCheck': return <CalendarCheck {...iconProps} />;
      case 'Bell': return <Bell {...iconProps} />;
      case 'CheckCircle': return <CheckCircle {...iconProps} />;
      default: return <Clock {...iconProps} />;
    }
  };  if (validTimelineItems.length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {t('noInfo')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {validTimelineItems.map((item, index) => {
        const timeRemaining = getTimeRemaining(item.date);
        const isPast = item.date < now;
        const isLast = index === validTimelineItems.length - 1;

        return (
          <div key={item.id} className="relative flex items-start space-x-3">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-3 top-6 w-px h-8 bg-gray-200"></div>
            )}
            
            {/* Icon */}
            <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 ${
              isPast 
                ? 'bg-gray-100 border-gray-300' 
                : item.isDeadline 
                ? 'bg-orange-50 border-orange-300' 
                : 'bg-purple-50 border-purple-300'
            }`}>
              <div className={`${
                isPast 
                  ? 'text-gray-400' 
                  : item.isDeadline 
                  ? 'text-orange-600' 
                  : 'text-purple-600'
              }`}>
                {getIconElement(item.iconName)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-sm font-medium ${
                    isPast 
                      ? 'text-gray-500 line-through' 
                      : item.isDeadline 
                      ? 'text-orange-700' 
                      : 'text-gray-900'
                  }`}>
                    {item.label}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.date.toLocaleDateString(currentLocale, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {' at '}
                    {item.date.toLocaleTimeString(currentLocale, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
                <div className="text-right">                  {isPast ? (
                    <span className="text-xs text-gray-400">
                      {item.isDeadline ? t('status.deadlinePassed') : t('status.completed')}
                    </span>
                  ) : timeRemaining ? (
                    <span className={`text-xs font-medium ${
                      item.isDeadline ? 'text-orange-600' : 'text-purple-600'
                    }`}>
                      {timeRemaining}
                    </span>
                  ) : (
                    <span className="text-xs text-purple-600 font-medium">{t('timeRemaining.today')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
