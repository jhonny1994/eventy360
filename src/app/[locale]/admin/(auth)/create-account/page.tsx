import { getTranslations } from 'next-intl/server';
import { AdminCreateAccountForm, AuthCard, AuthLayout } from '@/components/admin/auth';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminCreateAccountPage({ params }: { params: { locale: string } }) {
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
  
  // If admin profile already set up, redirect to dashboard
  if (adminProfile?.name) {
    redirect(`/${locale}/admin/dashboard`);
  }
  
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