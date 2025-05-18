import { getTranslations } from 'next-intl/server';
import { redirectAuthenticatedAdmin } from '@/utils/admin/auth-navigation';
import { AuthLayout, AuthCard, AdminLoginForm } from '@/components/admin/auth';

export default async function AdminLoginPage({ params }: { params: { locale: string } }) {
  // Redirect to dashboard if already logged in as admin
  await redirectAuthenticatedAdmin(params.locale);
  const t = await getTranslations('AdminAuth.LoginPage');
  
  return (
    <AuthLayout 
      illustrationSrc="/illustrations/admin_login.svg"
      illustrationAlt={t('illustrationAlt')}
    >
      <AuthCard 
        title={t('title')}
        logoAltText={t('logoAltText')}
      >
        <AdminLoginForm />
      </AuthCard>
    </AuthLayout>
  );
}