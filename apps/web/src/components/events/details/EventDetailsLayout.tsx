'use client';

/**
 * EventDetailsLayout component for displaying the overall event details page layout
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations (to be added for text content)
 */
import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import useTranslations from '@/hooks/useTranslations'

interface EventDetailsLayoutProps {
  event: {
    id: string
    title: { [key: string]: string } | string
    organizer: {
      display_name: string | null
      university: string | null
    } | null
  }
  locale: string
  userRole: 'owner' | 'participant' | 'visitor' | 'anonymous'
  children: React.ReactNode
}

export function EventDetailsLayout({ 
  event, 
  locale, 
  userRole, 
  children 
}: EventDetailsLayoutProps) {
  const t = useTranslations('EventDetails.layout')
  
  // Get localized title
  const title = typeof event.title === 'object' 
    ? event.title[locale] || event.title['ar'] || t('defaultTitle')
    : event.title || t('defaultTitle')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 py-4 text-sm">
            <Link 
              href={`/${locale}`}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              href={`/${locale}/profile`}
              className="text-gray-500 hover:text-gray-700"
            >
              {t('breadcrumbs.profile')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link 
              href={`/${locale}/profile/events`}
              className="text-gray-500 hover:text-gray-700"
            >
              {t('breadcrumbs.events')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              {/* Organizer Info */}
              {event.organizer && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('sidebar.organizer')}
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">
                      {event.organizer.display_name || t('sidebar.anonymousOrganizer')}
                    </p>
                    {event.organizer.university && (
                      <p className="text-sm text-gray-600">
                        {event.organizer.university}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions based on user role */}
              {userRole === 'owner' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {t('sidebar.quickActions')}
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href={`/${locale}/profile/events/${event.id}/manage`}
                      className="block w-full px-4 py-2 text-sm font-medium text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {t('sidebar.manageEvent')}
                    </Link>
                    <Link
                      href={`/${locale}/profile/events/${event.id}/edit`}
                      className="block w-full px-4 py-2 text-sm font-medium text-center border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {t('sidebar.editEvent')}
                    </Link>
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('sidebar.shareEvent')}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t('sidebar.shareDescription')}
                </p>
                <button className="w-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  {t('sidebar.copyLink')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
