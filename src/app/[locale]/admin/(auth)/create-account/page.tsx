import { getTranslations } from 'next-intl/server';
import { AdminCreateAccountForm, AuthCard, AuthLayout } from '@/components/admin/auth';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminCreateAccountPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations('AdminAuth.CreateAccountPage');
  
  // Security check: verify if this is a valid admin setup flow or redirect
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no authenticated user, redirect to login
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }
  
  // Check if user is admin and if profile is already set up
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, is_extended_profile_complete')
    .eq('id', user.id)
    .single();
    
  // If not admin type, redirect to login
  if (!profile || profile.user_type !== 'admin') {
    await supabase.auth.signOut();
    redirect(`/${locale}/admin/login`);
  }
  
  // If profile is already set up, redirect to dashboard
  if (profile.is_extended_profile_complete) {
    redirect(`/${locale}/admin/dashboard`);
  }
  
  // Only show the form if this is a valid admin who hasn't completed account setup
  return (
    <AuthLayout 
      illustrationSrc="/illustrations/signup.svg"
      illustrationAlt={t('illustrationAlt')}
    >
      <AuthCard 
        title={t('title')}
        logoAltText={t('logoAltText')}
      >
        <AdminCreateAccountForm redirectPath={`/${locale}/admin/dashboard`} />
      </AuthCard>
    </AuthLayout>
  );
} 