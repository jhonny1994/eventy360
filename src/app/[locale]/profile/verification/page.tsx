import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import VerificationSection from '../ui/VerificationSection';
import ProfilePageHeader from '../ui/ProfilePageHeader';
import ProfileCard from '../ui/ProfileCard';

type Props = {
  params: { locale: string };
};

/**
 * Dedicated page for user verification section
 * Shows verification status and document upload interface
 * Enhanced with better layout and RTL support
 */
export default async function VerificationPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'ProfilePage' });
  const tVerification = await getTranslations({ locale, namespace: 'ProfilePage.VerificationSection' });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get profile data to check verification status
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profileData) {
    redirect(`/${locale}/profile/setup`);
  }

  const translations = {
    verified: t('verified'),
    notVerified: t('notVerifiedLabel'),
    verifiedLabel: t('verificationLabel'),
    verificationDescription: {
      verified: tVerification('verifiedDescription'),
      notVerified: tVerification('notVerifiedDescription'),
    },
    requestVerification: t('requestVerification'),
    verificationStatusError: tVerification('verificationStatusError'),
    // Add translations for the verification info panel
    verificationInfoTitle: tVerification('verificationInfoTitle'),
    verificationInfoDesc: tVerification('verificationInfoDesc'),
    docsTitle: tVerification('docsTitle'),
    docsList: [
      tVerification('docsList.academicId'),
      tVerification('docsList.officialLetter'),
      tVerification('docsList.membershipCard'),
      tVerification('docsList.otherDocs')
    ]
  };

  return (
    <div className="space-y-6">
      <ProfilePageHeader 
        title={t('verificationLabel')} 
        iconName="shield"
        iconBgColor="bg-indigo-100 dark:bg-indigo-900"
        iconTextColor="text-indigo-600 dark:text-indigo-300"
        locale={locale}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <ProfileCard locale={locale}>
          <VerificationSection
            isVerified={profileData.is_verified}
            userId={user.id}
            translations={translations}
            locale={locale}
          />
        </ProfileCard>
        
        {/* Information panel about verification */}
        <ProfileCard 
          locale={locale}
          title={translations.verificationInfoTitle}
        >
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>{translations.verificationInfoDesc}</p>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                {translations.docsTitle}
              </h3>
              <ul className={`list-disc ${locale === 'ar' ? 'mr-5' : 'ml-5'} space-y-1 text-blue-700 dark:text-blue-300`}>
                {translations.docsList.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </ProfileCard>
      </div>
    </div>
  );
}