import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfilePageHeader from '@/app/[locale]/profile/ui/ProfilePageHeader';
import PaperDetailsContent from './ui/PaperDetailsContent';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { type UserSubscriptionData } from '@/hooks/useSubscription';

interface PageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;
  const t = await getTranslations({ locale, namespace: 'ResearchRepository.paperDetails' });
  
  try {
    const supabase = await createServerSupabaseClient();
    
    // Fetch paper details using discover_papers with filter
    const { data: papers, error } = await supabase.rpc('discover_papers', {
      search_query: '',
      topic_ids: [],
      wilaya_id_param: undefined,
      daira_id_param: undefined,
      start_date: undefined,
      end_date: undefined,
      author_name_filter: undefined,
      limit_count: 1,
      offset_count: 0
    }).eq('id', id);
    
    if (error || !papers || papers.length === 0) {
      return {
        title: t('notFound'),
      };
    }
    
    const paper = papers[0];
    
    // Get paper title in the current locale or fallback
    const titleTranslations = paper.paper_title_translations as Record<string, string>;
    const title = titleTranslations[locale] || 
                 Object.values(titleTranslations)[0] || 
                 t('untitled');
    
    // Get paper abstract for description
    const abstractTranslations = paper.paper_abstract_translations as Record<string, string>;
    const abstract = abstractTranslations[locale] || 
                    Object.values(abstractTranslations)[0] || 
                    '';
    
    return {
      title: `${title} - ${t('paperDetails')}`,
      description: abstract.substring(0, 160) || t('noAbstract'),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: t('paperDetails'),
    };
  }
}

/**
 * Check if the user can access premium features based on subscription data
 * This matches the logic in useSubscription hook's canAccessPremiumFeature
 */
function canAccessPremiumFeature(subscriptionData: UserSubscriptionData): boolean {
  if (!subscriptionData?.has_subscription) return false;
  if (!subscriptionData?.subscription?.is_active) return false;
  return ['paid_researcher', 'paid_organizer', 'trial'].includes(subscriptionData.subscription.tier);
}

export default async function PaperDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id, locale } = resolvedParams;
  const isRtl = locale === 'ar';
  const t = await getTranslations({ locale, namespace: 'ResearchRepository.paperDetails' });
  
  // Check authentication
  const supabase = await createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return redirect(`/${locale}/login?redirect=/profile/repository/papers/${id}`);
  }
  
  // Check subscription access using the standardized pattern
  const { data: subscriptionData, error: subscriptionError } = await supabase.rpc(
    "get_subscription_details"
  );

  if (subscriptionError) {
    console.error("Error fetching subscription details:", subscriptionError);
    // Redirect to subscription page if we can't verify subscription status
    return redirect(`/${locale}/profile/subscription?redirect=/profile/repository/papers/${id}`);
  }

  // Cast to the correct type defined in hooks/useSubscription.ts
  const typedSubscriptionData = subscriptionData as unknown as UserSubscriptionData;
  
  // Check if user has premium access using the helper function
  if (!canAccessPremiumFeature(typedSubscriptionData)) {
    return redirect(`/${locale}/profile/subscription?redirect=/profile/repository/papers/${id}`);
  }
  
  // Fetch paper details
  const { data: papers, error: paperError } = await supabase.rpc('discover_papers', {
    search_query: '',
    topic_ids: [],
    wilaya_id_param: undefined,
    daira_id_param: undefined,
    start_date: undefined,
    end_date: undefined,
    author_name_filter: undefined,
    limit_count: 1,
    offset_count: 0
  }).eq('id', id);
  
  if (paperError || !papers || papers.length === 0) {
    return notFound();
  }
  
  const paper = papers[0];
  
  // Fetch analytics data specifically for better accuracy
  let analyticsData = { view_count: 0, download_count: 0 };
  try {
    const { data: analytics } = await supabase.rpc('get_paper_analytics', {
      p_submission_id: id
    });
    
    if (analytics && analytics.length > 0) {
      analyticsData = {
        view_count: Number(analytics[0].view_count) || 0,
        download_count: Number(analytics[0].download_count) || 0
      };
    }
  } catch (analyticsError) {
    console.error('Error fetching analytics:', analyticsError);
    // Continue even if analytics fail
  }
  
  // Merge paper with analytics data
  const paperWithAnalytics = { ...paper, ...analyticsData };
  
  // Record view event
  try {
    await supabase.rpc('track_paper_activity', {
      p_submission_id: id,
      p_action_type: 'view'
    });
  } catch (error) {
    console.error('Error recording view event:', error);
    // Continue with page rendering even if tracking fails
  }
  
  // Get paper title in the current locale or fallback
  const titleTranslations = paper.paper_title_translations as Record<string, string>;
  const title = titleTranslations[locale] || 
               Object.values(titleTranslations)[0] || 
               t('untitled');
  
  // Get paper abstract in the current locale or fallback
  const abstractTranslations = paper.paper_abstract_translations as Record<string, string>;
  const abstract = abstractTranslations[locale] || 
                  Object.values(abstractTranslations)[0] || 
                  '';
  
  // Get event name in the current locale or fallback
  const eventNameTranslations = paper.event_name_translations as Record<string, string>;
  const eventName = eventNameTranslations[locale] || 
                   Object.values(eventNameTranslations)[0] || 
                   t('unknownEvent');
  
  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <ProfilePageHeader
        title={t('paperDetails')}
        iconName="documentText"
        iconBgColor="bg-blue-100 dark:bg-blue-900"
        iconTextColor="text-blue-600 dark:text-blue-300"
        locale={locale}
      >
        <Link
          href={`/${locale}/profile/repository`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          {t('backToRepository')}
        </Link>
      </ProfilePageHeader>
      
      <PaperDetailsContent
        paper={paperWithAnalytics}
        eventName={eventName}
        title={title}
        abstract={abstract}
        locale={locale}
      />
    </div>
  );
} 