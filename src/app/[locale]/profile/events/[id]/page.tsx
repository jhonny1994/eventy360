import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Edit3, Settings } from 'lucide-react'
import Link from 'next/link'
import ProfileCard from '../../ui/ProfileCard'
import { EventDetailsHeader } from '@/components/events/details/EventDetailsHeader'
import { EventDetailsTimeline } from '@/components/events/details/EventDetailsTimeline'
import { EventDetailsLocation } from '@/components/events/details/EventDetailsLocation'
import { EventDetailsDescription } from '@/components/events/details/EventDetailsDescription'
import { EventDetailsActions } from '@/components/events/details/EventDetailsActions'
import type { Database } from '@/database.types'
import ProfilePageHeader from '../../ui/ProfilePageHeader'
import { Button } from 'flowbite-react'

interface EventDetailsPageProps {
  params: Promise<{ locale: string; id: string }>
}

// Database result type
type EventFromDB = {
  id: string
  event_name_translations: Record<string, string>
  event_objectives_translations: Record<string, string>
  event_subtitle_translations: Record<string, string> | null
  event_type: Database['public']['Enums']['event_type_enum']
  event_date: string
  event_end_date: string
  abstract_submission_deadline: string | null
  full_paper_submission_deadline: string | null
  submission_verdict_deadline: string
  abstract_review_result_date: string | null
  daira_id: number
  wilaya_id: number
  price: number | null
  status: Database['public']['Enums']['event_status_enum']
  format: Database['public']['Enums']['event_format_enum']
  created_at: string
  updated_at: string
  created_by: string
  email: string
  phone: string
  website: string | null
  logo_url: string | null
  event_axes_translations: Record<string, string[]>
  brochure_url: string | null
  deleted_at: string | null
  problem_statement_translations: Record<string, string>
  qr_code_url: string | null
  scientific_committees_translations: Record<string, string> | null
  speakers_keynotes_translations: Record<string, string> | null
  submission_guidelines_translations: Record<string, string>
  target_audience_translations: Record<string, string> | null
  who_organizes_translations: Record<string, string>
  organizer: {
    profile_id: string
    name_translations: Record<string, string>
    bio_translations: Record<string, string> | null
    profile_picture_url: string | null
    institution_type: Database['public']['Enums']['institution_type_enum']
  } | null
}

// Component-expected type
interface EventWithOrganizer {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  event_type: string;
  event_date: string;
  event_end_date: string; // Added
  submission_deadline: string | null;
  review_deadline: string | null;
  notification_date: string | null;
  submission_verdict_deadline: string; // Added for timeline
  venue: string | null;
  location: string | null;
  topics: string[] | null;
  max_participants: number | null;
  registration_fee: number | null;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  organizer_id: string;
  format: string;
  problem_statement: string;
  target_audience: string | null;
  scientific_committees: string | null;
  speakers_keynotes: string | null;
  submission_guidelines: string;
  who_organizes: string; // Added
  brochure_url: string | null;
  qr_code_url: string | null;
  logo_url: string | null;
  website: string | null;
  phone: string;
  email: string;
  event_axes_translations: { [key: string]: string } | null; // Added for EventDetailsDescription
  organizer: {
    id: string;
    display_name: string | null;
    bio: string | null; // Added
    university: string; // Changed from string | null, as institution_type is not nullable
    department: string | null;
    profile_picture_url: string | null;
  } | null;
}

// Helper function for localization
function getLocalizedString(
  translations: Record<string, string> | null | undefined,
  locale: string,
  defaultText: string = ''
): string {
  if (!translations) return defaultText;
  // Standard fallback: current locale -> 'ar' -> 'en' -> defaultText
  return translations[locale] || translations['ar'] || translations['en'] || defaultText;
}

// Transform database result to component-expected format
function transformEventData(dbEvent: EventFromDB, locale: string, topics: string[] = []): EventWithOrganizer {
  return {
    id: dbEvent.id,
    title: getLocalizedString(dbEvent.event_name_translations, locale, 'Untitled Event'),
    subtitle: dbEvent.event_subtitle_translations ? getLocalizedString(dbEvent.event_subtitle_translations, locale) : null,
    description: getLocalizedString(dbEvent.event_objectives_translations, locale, 'No description provided.'),
    event_type: dbEvent.event_type,
    event_date: dbEvent.event_date,
    event_end_date: dbEvent.event_end_date, // Mapped event_end_date
    submission_deadline: dbEvent.abstract_submission_deadline,
    review_deadline: dbEvent.full_paper_submission_deadline,
    notification_date: dbEvent.abstract_review_result_date,
    submission_verdict_deadline: dbEvent.submission_verdict_deadline, // Added for timeline
    venue: null, // Not available in current schema
    location: null, // Not available in current schema
    topics: topics, // Uses the pre-processed topics array
    max_participants: null, // Not available in current schema
    registration_fee: dbEvent.price,
    status: dbEvent.status,
    visibility: dbEvent.status === 'published' ? 'public' : 'private',
    created_at: dbEvent.created_at,
    updated_at: dbEvent.updated_at,
    organizer_id: dbEvent.created_by,
    format: dbEvent.format,
    problem_statement: getLocalizedString(dbEvent.problem_statement_translations, locale),
    target_audience: dbEvent.target_audience_translations ? getLocalizedString(dbEvent.target_audience_translations, locale) : null,
    scientific_committees: dbEvent.scientific_committees_translations ? getLocalizedString(dbEvent.scientific_committees_translations, locale) : null,
    speakers_keynotes: dbEvent.speakers_keynotes_translations ? getLocalizedString(dbEvent.speakers_keynotes_translations, locale) : null,
    submission_guidelines: getLocalizedString(dbEvent.submission_guidelines_translations, locale),
    who_organizes: getLocalizedString(dbEvent.who_organizes_translations, locale),
    brochure_url: dbEvent.brochure_url,
    qr_code_url: dbEvent.qr_code_url,
    logo_url: dbEvent.logo_url,
    website: dbEvent.website,
    phone: dbEvent.phone,
    email: dbEvent.email,
    event_axes_translations: dbEvent.event_axes_translations ? 
      Object.fromEntries(Object.entries(dbEvent.event_axes_translations).map(([key, value]) => [key, Array.isArray(value) ? value.join('\n') : value])) : null, // Convert array to string for display
    organizer: dbEvent.organizer ? {
      id: dbEvent.organizer.profile_id,
      display_name: getLocalizedString(dbEvent.organizer.name_translations, locale),
      bio: dbEvent.organizer.bio_translations ? getLocalizedString(dbEvent.organizer.bio_translations, locale) : null,
      university: dbEvent.organizer.institution_type, // This is an enum, not a translation object
      department: null, // Remains null as per original structure
      profile_picture_url: dbEvent.organizer.profile_picture_url
    } : null
  };
}

export async function generateMetadata({ params }: EventDetailsPageProps): Promise<Metadata> {
  const { locale, id } = await params
  const supabase = await createServerSupabaseClient()
  
  // Fetch event for metadata
  const { data: event } = await supabase
    .from('events')
    .select('event_name_translations, event_objectives_translations')
    .eq('id', id)
    .single()

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.'
    }
  }
  // Get localized title and description
  const title = (event.event_name_translations as Record<string, string>)?.[locale] || 
                (event.event_name_translations as Record<string, string>)?.['ar'] || 'Event Details'
  const description = (event.event_objectives_translations as Record<string, string>)?.[locale] || 
                     (event.event_objectives_translations as Record<string, string>)?.['ar'] || 'Event information'

  return {
    title: `${title} - Eventy360`,
    description: description.substring(0, 160)
  }
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { locale, id } = await params
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations({ locale, namespace: 'EventDetails' })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()  // Fetch event with organizer information
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      id,
      event_name_translations,
      event_objectives_translations,
      event_subtitle_translations,
      event_type,
      event_date,
      event_end_date,
      abstract_submission_deadline,
      full_paper_submission_deadline,
      submission_verdict_deadline,
      abstract_review_result_date,
      daira_id,
      wilaya_id,
      price,
      status,
      format,
      created_at,
      updated_at,
      created_by,
      email,
      phone,
      website,
      logo_url,
      event_axes_translations,
      brochure_url,
      problem_statement_translations,
      qr_code_url,
      scientific_committees_translations,
      speakers_keynotes_translations,
      submission_guidelines_translations,
      target_audience_translations,
      who_organizes_translations
    `)
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Fetch topics for this event
  const { data: eventTopics } = await supabase
    .from('event_topics')
    .select(`
      topics (
        name_translations
      )
    `)
    .eq('event_id', id)

  // Extract topic names in the appropriate locale
  const topics = eventTopics?.map(et => {
    const topic = et.topics as { name_translations: Record<string, string> }
    return topic.name_translations[locale] || topic.name_translations['ar'] || 'Unknown Topic'
  }) || []

  // Fetch organizer info separately
  let organizerInfo = null
  if (event.created_by) {
    const { data: organizer } = await supabase
      .from('organizer_profiles')
      .select(`
        profile_id,
        name_translations,
        bio_translations,
        profile_picture_url,
        institution_type
      `)
      .eq('profile_id', event.created_by)
      .single()
    
    organizerInfo = organizer
  }

  // Combine event with organizer
  const eventWithOrganizerData = {
    ...event,
    organizer: organizerInfo
  }  // Transform to component-expected format
  const eventWithOrganizer = transformEventData(eventWithOrganizerData as EventFromDB, locale, topics)

  // Get user profile if authenticated
  let userProfile: { user_type: string; subscription_status: string } | null = null
  let userSubscription = null
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    if (profile) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      userSubscription = subscription ? {
        plan: subscription.tier,
        status: subscription.status
      } : null

      userProfile = {
        user_type: profile.user_type,
        subscription_status: subscription?.status || 'none'
      }
    }
  }

  // Implement access control
  const canViewEvent = checkEventAccess(eventWithOrganizer, user, userProfile)
  
  if (!canViewEvent) {
    notFound()
  }
  // Determine user role for the event
  const userRole = getUserEventRole(eventWithOrganizer, user, userProfile)
  const isRtl = locale === 'ar'

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <ProfilePageHeader
        title={t('title')}
        iconName="calendar"
        iconBgColor="bg-purple-100 dark:bg-purple-900"
        iconTextColor="text-purple-600 dark:text-purple-300"
        locale={locale}
      >
        {userRole === 'owner' && (
          <div className="flex space-x-3">
            <Link
              href={`/${locale}/profile/events/${eventWithOrganizer.id}/edit`}
              passHref
            >
              <Button outline={true} color="gray" size="sm">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Event
              </Button>
            </Link>
            <Link
              href={`/${locale}/profile/events/${eventWithOrganizer.id}/manage`}
              passHref
            >
              <Button color="purple" size="sm">
                <Settings className="mr-2 h-4 w-4" /> Manage Event
              </Button>
            </Link>
          </div>
        )}
      </ProfilePageHeader>

      <ProfileCard locale={locale}>
        <EventDetailsHeader 
          event={eventWithOrganizer}
          locale={locale}
          userRole={userRole}
        />
      </ProfileCard>
      
      {/* Timeline and Description - Full Width */}
      <div className="space-y-6">
        <ProfileCard title={t('timeline.title')} locale={locale}>
          <EventDetailsTimeline 
            event={eventWithOrganizer}
            locale={locale}
          />
        </ProfileCard>

        {(eventWithOrganizer.venue || eventWithOrganizer.location) && (
          <ProfileCard title={t('venue')} locale={locale}>
            <EventDetailsLocation 
              event={eventWithOrganizer}
              locale={locale}
            />
          </ProfileCard>
        )}

        <ProfileCard title={t('description.title')} locale={locale}>
          <EventDetailsDescription 
            event={eventWithOrganizer}
            locale={locale}
          />
        </ProfileCard>

        {/* Actions for non-owners in full width layout */}
        {userRole !== 'owner' && (
          <ProfileCard locale={locale}>
            <EventDetailsActions 
              event={eventWithOrganizer}
              locale={locale}
              userRole={userRole}
              userProfile={userProfile}
              userSubscription={userSubscription}
            />
          </ProfileCard>
        )}
      </div>
    </div>
  )
}

/**
 * Check if the current user can view this event
 */
function checkEventAccess(
  event: EventWithOrganizer, 
  user: { id: string } | null, 
  userProfile: { user_type: string } | null
): boolean {
  // Public events can be viewed by anyone
  if (event.visibility === 'public' && event.status === 'published') {
    return true
  }

  // Private events or drafts require authentication
  if (!user || !userProfile) {
    return false
  }

  // Admins can view all events
  if (userProfile.user_type === 'admin') {
    return true
  }

  // Organizers can only view their own events
  if (userProfile.user_type === 'organizer') {
    return event.organizer_id === user.id
  }

  // Researchers can view published events
  if (userProfile.user_type === 'researcher') {
    return event.status === 'published'
  }

  return false
}

/**
 * Determine the user's role for this specific event
 */
function getUserEventRole(
  event: EventWithOrganizer, 
  user: { id: string } | null, 
  userProfile: { user_type: string } | null
): 'owner' | 'participant' | 'visitor' | 'anonymous' {
  if (!user || !userProfile) {
    return 'anonymous'
  }

  if (userProfile.user_type === 'admin') {
    return 'owner' // Admins have owner-like permissions
  }

  if (event.organizer_id === user.id) {
    return 'owner'
  }

  if (userProfile.user_type === 'researcher') {
    return 'participant'
  }

  return 'visitor'
}
