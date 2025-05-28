import React from 'react'
import { Calendar, Users, DollarSign, CheckCircle, Tag } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

interface EventDetailsHeaderProps {
  event: {
    id: string
    title: { [key: string]: string } | string
    subtitle: string | null
    event_type: string
    event_date: string
    max_participants: number | null
    registration_fee: number | null
    status: string
    visibility: string
    format: string
    phone: string
    email: string
    website: string | null
    created_at: string
    organizer: {
      display_name: string | null
      profile_picture_url: string | null
    } | null
  }
  locale: string
  userRole: 'owner' | 'participant' | 'visitor' | 'anonymous'
}

export function EventDetailsHeader({ event, locale, userRole }: EventDetailsHeaderProps) {
  const t = useTranslations('EventDetails.header')
  const tEnums = useTranslations('Enums')
  // Get localized title
  const title = typeof event.title === 'object' 
    ? event.title[locale] || event.title['ar'] || t('eventInfo')
    : event.title || t('eventInfo')

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
        return { text: t('status.ongoing') }
      case 'draft':
        return { text: t('status.upcoming') }
      case 'cancelled':
        return { text: t('status.cancelled') }
      default:
        return { text: status }
    }
  }

  const statusInfo = getStatusInfo(event.status)

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        {event.subtitle && (
          <p className="text-lg text-gray-600 mb-4">
            {event.subtitle}
          </p>
        )}

        {/* Organizer Info - Moved under title */}
        {event.organizer && (
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 relative">
                {event.organizer.profile_picture_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <Image
                      src={event.organizer.profile_picture_url}
                      alt={event.organizer.display_name || 'Organizer'}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {(event.organizer.display_name || 'A')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Verification badge - assuming organizer is verified for now */}
                <div className="absolute -bottom-1 -right-1 bg-white text-blue-600 dark:bg-gray-800 dark:text-blue-400 rounded-full p-1 shadow-sm border border-blue-100 dark:border-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {t('organizedBy')} {event.organizer.display_name || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event Info Grid - With consistent styling and space-between */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Created */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('createdDate')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(event.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Event Type */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <Tag className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('eventType')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {event.event_type ? tEnums(`EventType.${event.event_type}`) : t('unknown')}
              </p>
            </div>
          </div>

          {/* Published Status */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <CheckCircle className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('statusHeader')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {statusInfo.text}
              </p>
            </div>
          </div>

          {/* Registration Fee */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 flex items-center">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{t('registrationFee')}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {event.registration_fee ? `$${event.registration_fee}` : t('free')}
              </p>
            </div>
          </div>

          {/* Add Participants if available */}
          {event.max_participants && (
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 flex items-center">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">{t('statistics.attendees')}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t('maxParticipants')} {event.max_participants} {t('statistics.attendees')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section without title - Only for owners */}
        {userRole === 'owner' && (
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">{t('statistics.registrations')}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">{t('statistics.submissions')}</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">{t('statistics.views')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
