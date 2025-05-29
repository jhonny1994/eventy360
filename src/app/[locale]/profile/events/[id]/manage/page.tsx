import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Card, Badge, Tabs, TabItem } from 'flowbite-react'
import Link from 'next/link'
import {
  HiDocumentText,
  HiPencil,
  HiClock,
  HiTag,
  HiChevronLeft,
  HiChartPie
} from 'react-icons/hi'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import EventStatisticsTab from './components/EventStatisticsTab'

interface EventManagementPageProps {
  params: Promise<{ locale: string; id: string }>
}

// Define types for event data
interface EventData {
  id: string
  event_name_translations: Record<string, string>
  created_by: string
  created_at: string
  event_type: string
  status: string
  // Add other fields as needed
}

export async function generateMetadata({ params }: EventManagementPageProps): Promise<Metadata> {
  const { locale, id } = await params
  const supabase = await createServerSupabaseClient()
  
  // Fetch event for metadata
  const { data: event } = await supabase
    .from('events')
    .select('event_name_translations')
    .eq('id', id)
    .single<{ event_name_translations: Record<string, string> }>()

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.'
    }
  }

  // Get localized title
  const title = event.event_name_translations[locale] || 
                event.event_name_translations['ar'] || 
                'Event Management'

  return {
    title: `Manage: ${title}`,
    description: `Management dashboard for ${title}`
  }
}

export default async function EventManagementPage({ params }: EventManagementPageProps) {
  const { locale, id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('EventManagement')
  const tEventType = await getTranslations('Enums.EventType')
  const isRtl = locale === 'ar'
  
  // Redirect if user is not authenticated
  if (!user) {
    redirect(`/${locale}/login`)
  }

  // Fetch event data
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      event_name_translations,
      created_by
    `)
    .eq('id', id)
    .single<EventData>()

  if (error || !event) {
    notFound()
  }

  // Check if user is the owner of this event
  if (event.created_by !== user.id) {
    // Check if user is an admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    if (!profileData || profileData.user_type !== 'admin') {
      // If not owner or admin, redirect to event details
      redirect(`/${locale}/profile/events/${id}`)
    }
  }

  // Get localized event title
  const eventTitle = event.event_name_translations[locale] || 
                     event.event_name_translations['ar'] || 
                     'Untitled Event'
                     
  // Get localized event type
  let eventTypeDisplay = event.event_type
  try {
    // Try to get the translated event type
    eventTypeDisplay = tEventType(event.event_type)
  } catch {
    // If translation fails, use the original value
    console.error('Translation failed for event type:', event.event_type)
  }

  // Fetch submission count
  const submissionsCount = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', id)
    .then(res => res.count || 0)

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <Link 
        href={`/${locale}/profile/events/${id}`}
        className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <HiChevronLeft className={`h-4 w-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />
        {t('backToEventDetails')}
      </Link>

      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('title')} - {eventTitle}
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {t('manageEventDescription')}
          </p>
          <Link
            href={`/${locale}/profile/events/${id}/edit`}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 flex items-center"
          >
            <HiPencil className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('editEvent')}
          </Link>
        </div>
      </div>

      {/* Dashboard stats - Only show submissions */}
      <Card className="overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">
              {t('metrics.submissions')}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {submissionsCount}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <HiDocumentText className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Management content */}
      <ProfileCard locale={locale}>
        <Tabs variant="underline">
          <TabItem active title={t('overview')}>
            <div className="flex items-center gap-2">
              <HiDocumentText className="h-5 w-5" />
              <span>{t('overview')}</span>
            </div>
        <div className="space-y-6 p-4">
          {/* Event Status */}
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-gray-700 font-medium">{t('status')}:</span>
            <Badge color={event.status === 'published' ? 'success' : 'warning'}>
              {event.status === 'published' ? t('statusPublished') : t('statusDraft')}
            </Badge>
          </div>

          {/* Event Info */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('eventInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Created date */}
            <div className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
              <HiClock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t('createdAt')}</p>
                <p className="text-sm text-gray-600">
                  {new Date(event.created_at).toLocaleDateString(
                    locale === 'ar' ? 'ar-DZ' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
            
            {/* Event type */}
            <div className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
              <HiTag className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">{t('eventType')}</p>
                <p className="text-sm text-gray-600">{eventTypeDisplay}</p>
              </div>
            </div>
          </div>

          {/* Submissions Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('submissionsManagement')}</h3>
            
            {submissionsCount > 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-4 border-b">
                  <p className="font-medium">{t('submissionsList')}</p>
                </div>
                <div className="p-4">
                  <Link
                    href={`/${locale}/profile/events/${id}/submissions`}
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <HiDocumentText className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {t('viewAllSubmissions')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <HiDocumentText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">{t('noSubmissionsYet')}</p>
                <p className="text-sm text-gray-500">{t('submissionsWillAppearHere')}</p>
              </div>
            )}
          </div>
        </div>
          </TabItem>
          
          <TabItem title={t('statistics')}>
            <div className="flex items-center gap-2">
              <HiChartPie className="h-5 w-5" />
              <span>{t('statistics')}</span>
            </div>
            <div className="p-4">
              {/* Statistics Tab Content */}
              <EventStatisticsTab eventId={id} locale={locale} />
            </div>
          </TabItem>
        </Tabs>
      </ProfileCard>
    </div>
  )
} 