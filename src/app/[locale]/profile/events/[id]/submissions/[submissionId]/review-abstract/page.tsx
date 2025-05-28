import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { HiChevronLeft } from 'react-icons/hi'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import AbstractReviewForm from './AbstractReviewForm'

interface AbstractReviewPageProps {
  params: Promise<{ locale: string; id: string; submissionId: string }>
}

export default async function AbstractReviewPage({ params }: AbstractReviewPageProps) {
  const { locale, id: eventId, submissionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
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
    .eq('id', eventId)
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
      redirect(`/${locale}/profile/events/${eventId}`)
    }
  }

  // Fetch submission details to check status
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      abstract_status,
      title_translations
    `)
    .eq('id', submissionId)
    .eq('event_id', eventId)
    .single()

  if (submissionError || !submission) {
    console.error('Error fetching submission:', submissionError)
    redirect(`/${locale}/profile/events/${eventId}/submissions`)
  }

  // Only allow reviewing if status is 'abstract_submitted'
  if (submission.abstract_status !== 'abstract_submitted') {
    redirect(`/${locale}/profile/events/${eventId}/submissions/${submissionId}`)
  }

  // Get title based on locale
  const getTitle = (translations: Record<string, string>): string => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };

  const submissionTitle = getTitle(submission.title_translations as Record<string, string>);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <Link 
        href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}`}
        className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <HiChevronLeft className={`h-4 w-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />
        {tSubmissions('backToSubmissionDetails')}
      </Link>

      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {tSubmissions('reviewAbstract')}
        </h1>
        <p className="text-gray-600">
          {tSubmissions('reviewAbstractDescription')}
        </p>
      </div>

      {/* Submission title */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {tSubmissions('submissionTitle')}: {submissionTitle}
        </h2>
      </div>

      {/* Review form */}
      <ProfileCard locale={locale}>
        <div className="p-6">
          <AbstractReviewForm 
            submissionId={submissionId} 
            eventId={eventId} 
            locale={locale} 
          />
        </div>
      </ProfileCard>
    </div>
  )
} 