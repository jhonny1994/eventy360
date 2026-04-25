import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SubmissionFormWithCheck from "../../create/SubmissionFormWithCheck";

interface SubmitToEventPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: SubmitToEventPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Submissions" });
  
  return {
    title: t("submitAbstractTitle"), 
    description: t("submitAbstractDescription"), 
  };
}

export default async function SubmitToEventPage({ params }: SubmitToEventPageProps) {
  const { locale, id: eventId } = await params;
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations({ locale, namespace: "Submissions" });

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect(`/${locale}/login`);
  }

  // Get user profile to verify they are a researcher
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type, is_verified")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect(`/${locale}/complete-profile`);
  }

  // Only researchers can create submissions
  if (profile.user_type !== "researcher") {
    redirect(`/${locale}/profile`);
  }

  // Check if the event exists and is accepting submissions
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`
      id,
      event_name_translations,
      event_type,
      abstract_submission_deadline,
      status
    `)
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    redirect(`/${locale}/profile/events`);
  }

  // Check if submission deadline has passed
  const now = new Date();
  const submissionDeadline = event.abstract_submission_deadline
    ? new Date(event.abstract_submission_deadline)
    : null;
  
  const isSubmissionOpen = submissionDeadline
    ? submissionDeadline > now
    : false;

  if (!isSubmissionOpen) {
    redirect(`/${locale}/profile/events/${eventId}?error=deadline_passed`);
  }

  // Check if the user has already submitted to this event
  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("id")
    .eq("event_id", eventId)
    .eq("submitted_by", user.id)
    .maybeSingle();

  if (existingSubmission) {
    redirect(`/${locale}/profile/submissions/${existingSubmission.id}`);
  }

  // Helper function to get title based on locale
  const getTitle = (translations: { ar: string; en?: string; fr?: string }): string => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };

  const eventTitle = getTitle(event.event_name_translations as { ar: string; en?: string; fr?: string });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("submitAbstractTitle")}
        description={t("submitAbstractDescription")}
      />

      <Link 
        href={`/${locale}/profile/events/${eventId}`}
        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-500 mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        {t('backToEvent')}
      </Link>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-center">
            {t('submittingTo')}: {eventTitle}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            {t('deadlineInfo')}: {submissionDeadline?.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US')}
          </p>
        </div>
        
        <SubmissionFormWithCheck eventId={eventId} />
      </div>
    </div>
  );
} 
