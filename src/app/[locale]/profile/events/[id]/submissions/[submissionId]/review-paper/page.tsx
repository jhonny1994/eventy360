import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { HiChevronLeft } from 'react-icons/hi';
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard';
import FullPaperReviewComponent from '@/components/submissions/FullPaperReviewComponent';

interface ReviewPaperPageProps {
  params: Promise<{ locale: string; id: string; submissionId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Submissions');

  return {
    title: t('reviewPaper'),
    description: t('reviewPaperDescription'),
  };
}

export default async function ReviewPaperPage({ params }: ReviewPaperPageProps) {
  const { locale, id: eventId, submissionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('Submissions');
  const isRtl = locale === 'ar';
  
  // Redirect if user is not authenticated
  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Fetch event data to verify ownership
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('created_by')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Check if user is the owner of this event
  if (event.created_by !== user.id) {
    // Check if user is an admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    
    if (!profileData || profileData.user_type !== 'admin') {
      // If not owner or admin, redirect to event details
      redirect(`/${locale}/profile/events/${eventId}`);
    }
  }

  // Fetch submission to verify it exists and belongs to this event
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select('id, full_paper_status')
    .eq('id', submissionId)
    .eq('event_id', eventId)
    .single();

  if (submissionError || !submission) {
    redirect(`/${locale}/profile/events/${eventId}/submissions`);
  }

  // Check if the submission status allows for review
  // Using string comparison to avoid type issues
  const status = submission.full_paper_status as string;
  if (status !== 'full_paper_submitted' && status !== 'revision_submitted') {
    // If not in a reviewable state, redirect to submission details
    redirect(`/${locale}/profile/events/${eventId}/submissions/${submissionId}`);
  }

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <Link 
        href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}`}
        className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <HiChevronLeft className={`h-4 w-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />
        {t('backToSubmission')}
      </Link>

      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {t('reviewPaper')}
        </h1>
        <p className="text-gray-600">
          {t('reviewPaperDescription')}
        </p>
      </div>

      {/* Review component */}
      <ProfileCard locale={locale}>
        <div className="p-4">
          <FullPaperReviewComponent 
            submissionId={submissionId} 
          />
        </div>
      </ProfileCard>
    </div>
  );
} 