import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { HiChevronLeft } from 'react-icons/hi'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import EventSubmissionsTable from './EventSubmissionsTable'

interface EventSubmissionsPageProps {
  params: Promise<{ locale: string; id: string }>
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

export async function generateMetadata({ params }: EventSubmissionsPageProps): Promise<Metadata> {
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
    title: `${title} - Submissions`,
    description: `Submissions for ${title}`
  }
}

export default async function EventSubmissionsPage({ params }: EventSubmissionsPageProps) {
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

  // Fetch event data to verify ownership
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', id)
    .single()

  if (eventError || !event) {
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
      {/* Back button */}
      <Link 
        href={`/${locale}/profile/events/${id}/manage`}
        className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <HiChevronLeft className={`h-4 w-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />
        {t('backToManagement')}
      </Link>

      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {tSubmissions('eventSubmissions')}
        </h1>
        <p className="text-gray-600">
          {tSubmissions('eventSubmissionsDescription')}
        </p>
      </div>

      {/* Submissions management interface */}
      <ProfileCard locale={locale}>
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
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{tSubmissions('noSubmissions')}</h3>
              <p className="text-gray-500">{tSubmissions('submissionsWillAppearHere')}</p>
            </div>
          )}
        </div>
      </ProfileCard>
    </div>
  )
} 