import { Metadata } from 'next';
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import ProfilePageHeader from '@/app/[locale]/profile/ui/ProfilePageHeader'
import BackButton from '@/components/ui/BackButton'
import AbstractReviewComponent from '@/components/submissions/AbstractReviewComponent'

interface ReviewAbstractPageProps {
  params: Promise<{ locale: string; id: string; submissionId: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Submissions');

  return {
    title: t('reviewAbstract'),
    description: t('reviewAbstractDescription'),
  };
}

export default async function ReviewAbstractPage({ params }: ReviewAbstractPageProps) {
  const { locale, id: eventId, submissionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('Submissions')
  const isRtl = locale === 'ar'

  // Redirect if user is not authenticated
  if (!user) {
    redirect(`/${locale}/auth/signin`)
  }

  // Fetch submission to verify it exists and belongs to this event
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, abstract_status')
    .eq('id', submissionId)
    .eq('event_id', eventId)
    .single()

  if (submissionError || !submission) {
    redirect(`/${locale}/profile/events/${eventId}/manage`)
  }

  // Security check - verify user is authorized to review this submission
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single()

  if (eventError || !event || event.created_by !== user.id) {
    redirect(`/${locale}/profile/events/${eventId}/manage`)
  }

  // Check if the submission status allows for review
  if (submission.abstract_status !== 'abstract_submitted') {
    // If already reviewed, redirect to submission details
    redirect(`/${locale}/profile/events/${eventId}/submissions/${submissionId}`)
  }

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button using standard component */}
      <BackButton
        href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}`}
        label={t('backToSubmission')}
      />

      {/* Standard page header */}
      <ProfilePageHeader
        title={t('reviewAbstract')}
        iconName="documentText"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      />

      {/* Review component */}
      <ProfileCard locale={locale}>
        <div className="p-4">
          <AbstractReviewComponent
            submissionId={submissionId}
          />
        </div>
      </ProfileCard>
    </div>
  )
} 