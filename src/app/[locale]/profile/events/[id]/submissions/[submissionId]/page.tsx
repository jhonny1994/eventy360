import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Badge } from 'flowbite-react'
import { HiChevronLeft, HiExternalLink } from 'react-icons/hi'
import ProfileCard from '@/app/[locale]/profile/ui/ProfileCard'
import { Json } from "@/database.types";

interface EventSubmissionDetailPageProps {
  params: Promise<{ locale: string; id: string; submissionId: string }>
}

// Define the interfaces for type safety
interface TranslationsObject {
  ar: string;
  en?: string;
  fr?: string;
}

interface ResearcherProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  institution?: string;
}

interface SubmissionData {
  id: string;
  created_at: string;
  updated_at: string;
  event_id: string;
  abstract_status: string | null;
  full_paper_status: string | null;
  status?: string | null;
  title_translations: TranslationsObject;
  abstract_translations: TranslationsObject;
  abstract_file_url?: string;
  abstract_file_metadata?: Json;
  full_paper_file_url?: string;
  full_paper_file_metadata?: Json;
  submitted_by: string;
  submission_date: string;
  researcher_profile?: ResearcherProfile;
}

// Interface for raw submission data from database
interface RawSubmission {
  id: string;
  created_at: string;
  updated_at: string;
  event_id: string;
  abstract_status: string | null;
  full_paper_status: string | null;
  status?: string | null;
  title_translations: TranslationsObject;
  abstract_translations: TranslationsObject;
  abstract_file_url?: string;
  abstract_file_metadata?: Json;
  full_paper_file_url?: string;
  full_paper_file_metadata?: Json;
  submitted_by: string;
  submission_date: string;
  review_date?: string;
  review_feedback_translations?: TranslationsObject;
  profiles?: {
    id: string;
    researcher_profiles?: {
  name: string;
    } | null;
  };
}

export async function generateMetadata({ params }: EventSubmissionDetailPageProps): Promise<Metadata> {
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
    title: `${title} - Submission Details`,
    description: `Submission details for ${title}`
  }
}

export default async function EventSubmissionDetailPage({ params }: EventSubmissionDetailPageProps) {
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
  // Fetch submission details
  const { data: submission, error: submissionError } = await supabase
    .from('submissions')
    .select(`
      id,
      created_at,
      updated_at,
      event_id,
      abstract_status,
      full_paper_status,
      status,
      title_translations,
      abstract_translations,
      abstract_file_url,
      abstract_file_metadata,
      full_paper_file_url,
      full_paper_file_metadata,
      submitted_by,
      submission_date,
      review_date,
      review_feedback_translations,
      profiles:submitted_by(id, researcher_profiles(name))
    `)
    .eq('id', submissionId)
    .eq('event_id', eventId)
    .single()

  if (submissionError || !submission) {
    console.error('Error fetching submission:', submissionError)
    redirect(`/${locale}/profile/events/${eventId}/submissions`)
  }

  // Cast submission to typed data for safety
  const typedSubmission = submission as unknown as RawSubmission;

  // Create researcher profile from the joined data
  const researcher: ResearcherProfile = {
        id: typedSubmission.submitted_by,
    full_name: typedSubmission.profiles?.researcher_profiles?.name || 'Unknown Researcher',
    email: '',
    phone: undefined,
    institution: undefined
  };

  // Define status colors
  const statusColors: Record<string, string> = {
    abstract_submitted: "info",
    abstract_approved: "success",
    abstract_rejected: "failure",
    full_paper_submitted: "purple",
    full_paper_accepted: "success",
    full_paper_rejected: "failure",
    revision_requested: "warning",
    revision_submitted: "info"
  };

  // Get title based on locale
  const getTitle = (translations: TranslationsObject): string => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };

  // Format date 
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format file size

  // Determine the effective status of a submission
  const getEffectiveStatus = (submission: SubmissionData): string => {
    // If there's a full paper status, prioritize it
    if (submission.full_paper_status) {
      return submission.full_paper_status;
    }
    // Otherwise use the abstract status
    return submission.abstract_status || 'abstract_submitted';
  };
  // Create the complete submission data
  const submissionData: SubmissionData = {
    id: typedSubmission.id,
    created_at: typedSubmission.created_at,
    updated_at: typedSubmission.updated_at,
    event_id: typedSubmission.event_id,
    abstract_status: typedSubmission.abstract_status,
    full_paper_status: typedSubmission.full_paper_status,
    status: typedSubmission.status,
    title_translations: typedSubmission.title_translations,
    abstract_translations: typedSubmission.abstract_translations,
    abstract_file_url: typedSubmission.abstract_file_url,
    abstract_file_metadata: typedSubmission.abstract_file_metadata,
    full_paper_file_url: typedSubmission.full_paper_file_url,
    full_paper_file_metadata: typedSubmission.full_paper_file_metadata,
    submitted_by: typedSubmission.submitted_by,
    submission_date: typedSubmission.submission_date,
    researcher_profile: researcher
  };

  // Determine current status and next possible statuses
  const currentStatus = getEffectiveStatus(submissionData);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Back button */}
      <Link 
        href={`/${locale}/profile/events/${eventId}/submissions`}
        className={`flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 ${isRtl ? 'flex-row-reverse' : ''}`}
      >
        <HiChevronLeft className={`h-4 w-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />
        {tSubmissions('backToSubmissions')}
      </Link>

      {/* Page header */}
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {tSubmissions('submissionDetails')}
          </h1>
          <Badge color={statusColors[currentStatus] || 'gray'} size="lg">
            {tSubmissions(`status.${currentStatus}`)}
          </Badge>
        </div>
        <p className="text-gray-600">
          {tSubmissions('submissionDetailsDescription')}
        </p>
      </div>

      {/* Submission details */}
      <ProfileCard locale={locale}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Left column - Submission info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {getTitle(submissionData.title_translations)}
              </h2>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {tSubmissions("submittedOn")}: {formatDate(submissionData.created_at)}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {tSubmissions("lastUpdated")}: {formatDate(submissionData.updated_at)}
                </span>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {tSubmissions("abstract")}
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {submissionData.abstract_translations && 
                     getTitle(submissionData.abstract_translations)}
                  </p>              </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Researcher info & Actions */}
          <div className="space-y-6">
            {/* Researcher info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {tSubmissions("researcherInformation")}
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tSubmissions("researcherName")}</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {submissionData.researcher_profile?.full_name}
                  </p>
                </div>
                
                {submissionData.researcher_profile?.phone && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tSubmissions("phone")}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {submissionData.researcher_profile.phone}
                    </p>
                  </div>
                )}
                
                {submissionData.researcher_profile?.institution && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tSubmissions("institution")}</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {submissionData.researcher_profile.institution}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {tSubmissions("actions")}
              </h3>
              
              <div className="space-y-3">
                {/* Different actions based on current status */}
                {currentStatus === 'abstract_submitted' && (
                  <Link 
                    href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}/review-abstract`}
                    className="flex items-center w-full justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                  >
                    <HiExternalLink className={`w-4 h-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {tSubmissions('reviewAbstract')}
                  </Link>
                )}
                
                {currentStatus === 'full_paper_submitted' && (
                  <Link 
                    href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}/review-paper`}
                    className="flex items-center w-full justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                  >
                    <HiExternalLink className={`w-4 h-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {tSubmissions('reviewPaper')}
                  </Link>
                )}
                
                {currentStatus === 'revision_submitted' && (
                  <Link 
                    href={`/${locale}/profile/events/${eventId}/submissions/${submissionId}/review-revision`}
                    className="flex items-center w-full justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                  >
                    <HiExternalLink className={`w-4 h-4 ${isRtl ? 'ml-2' : 'mr-2'}`} />
                    {tSubmissions('reviewRevision')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProfileCard>
    </div>
  )
} 