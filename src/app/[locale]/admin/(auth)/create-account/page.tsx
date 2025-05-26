import { getTranslations } from 'next-intl/server';
import { AdminCreateAccountForm, AuthCard, AuthLayout } from '@/components/admin/auth';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminCreateAccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('AdminAuth.CreateAccountPage');
  
  // Security check: if user is logged in but not admin, redirect to login
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no authenticated user, redirect to login
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }
  
  // Check if admin profile is already set up
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('name')
    .eq('profile_id', user.id)
    .single();
    
  // Also check the main profile's completion flag
  const { data: mainProfile } = await supabase
    .from('profiles')
    .select('is_extended_profile_complete, user_type')
    .eq('id', user.id)
    .single();
  
  // Only redirect to dashboard if BOTH conditions are met:
  // 1. Admin profile exists with a name
  // 2. Main profile is marked as complete
  // 3. User type is actually "admin"
  if (adminProfile?.name && 
      mainProfile?.is_extended_profile_complete === true && 
      mainProfile?.user_type === 'admin') {
    redirect(`/${locale}/admin/dashboard`);
  }
  
  // If we're here, at least one of the conditions wasn't met,
  // so we should show the account setup form
  return (
    <AuthLayout 
      illustrationSrc="/illustrations/signup.svg"
      illustrationAlt={t('illustrationAlt')}
    >
      <AuthCard 
        title={t('title')}
        logoAltText={t('logoAltText')}
      >
        <AdminCreateAccountForm />
      </AuthCard>
    </AuthLayout>
  );
} 