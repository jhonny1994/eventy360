import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { Button } from 'flowbite-react'
import Link from 'next/link'
import {
  HiDocumentText,
  HiPencil
} from 'react-icons/hi'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import ProfilePageHeader from '@/app/[locale]/profile/ui/ProfilePageHeader'
import BackButton from '@/components/ui/BackButton'
import EventStatisticsTab from './components/EventStatisticsTab'
import EventSubmissionsTable from '../submissions/EventSubmissionsTable'

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

// Define the submission type that matches the component's expected type
interface SubmissionData {
  id: string;
  created_at: string;
  updated_at: string;
  abstract_status: string | null;
  full_paper_status: string | null;
  title_translations: Record<string, string>;
  submitted_by: string;
  profiles: {
    id: string;
    full_name: string;
    email: string;
  };
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
  const tSubmissions = await getTranslations('Submissions')
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
                     
  // Fetch submissions for this event
  const { data: submissionsData, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      id,
      created_at,
      updated_at,
      abstract_status,
      full_paper_status,
      title_translations,
      submitted_by
    `)
    .eq('event_id', id)
    .order('updated_at', { ascending: false })

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  // Fetch researcher details for each submission
  let submissions: SubmissionData[] = [];
  
  if (submissionsData && submissionsData.length > 0) {
    // Get unique profile IDs
    const profileIds = [...new Set(submissionsData.map(s => s.submitted_by))];
    
    // Fetch researcher profiles in one query
    const { data: researcherProfiles } = await supabase
      .from('researcher_profiles')
      .select('profile_id, name')
      .in('profile_id', profileIds);
    
    // Create a map of profile ID to researcher name
    const researcherNamesMap = new Map();
    if (researcherProfiles) {
      researcherProfiles.forEach(profile => {
        researcherNamesMap.set(profile.profile_id, profile.name);
      });
    }
    
    // Create submissions with available data
    submissions = submissionsData.map(item => ({
      id: item.id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      abstract_status: item.abstract_status,
      full_paper_status: item.full_paper_status,
      title_translations: item.title_translations as Record<string, string>,
      submitted_by: item.submitted_by,
      profiles: {
        id: item.submitted_by,
        full_name: researcherNamesMap.get(item.submitted_by),
        email: `user-${item.submitted_by.substring(0, 8)}@example.com` // Placeholder email
      }
    }));
  }

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button using standard component */}
      <BackButton 
        href={`/${locale}/profile/events/${id}`} 
        label={t('backToEventDetails')}
      />

      {/* Standard page header */}
      <ProfilePageHeader
        title={`${t('title')} - ${eventTitle}`}
        iconName="calendar"
        iconBgColor="bg-purple-100 dark:bg-purple-900"
        iconTextColor="text-purple-600 dark:text-purple-300"
        locale={locale}
      >
        <Link
          href={`/${locale}/profile/events/${id}/edit`}
          passHref
        >
          <Button color="blue" size="sm">
            <HiPencil className={`h-4 w-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
            {t('editEvent')}
          </Button>
        </Link>
      </ProfilePageHeader>

      {/* Statistics Section */}
      <ProfileCard locale={locale} title={t('statistics')}>
        <div className="p-4">
          <EventStatisticsTab eventId={id} locale={locale} />
        </div>
      </ProfileCard>

      {/* Submissions Section */}
      <ProfileCard locale={locale} title={tSubmissions('eventSubmissions')}>
        <div className="p-4">
          {submissions && submissions.length > 0 ? (
            <EventSubmissionsTable 
              submissions={submissions} 
              locale={locale}
              eventId={id}
            />
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-100">
                <HiDocumentText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noSubmissionsYet')}</h3>
              <p className="text-gray-500">{t('submissionsWillAppearHere')}</p>
            </div>
          )}
        </div>
      </ProfileCard>
    </div>
  )
} 