import { getTranslations } from 'next-intl/server';
import { AdminLoginForm, AuthCard, AuthLayout } from '@/components/admin/auth';
import { redirectAuthenticatedAdmin } from '@/utils/admin/auth-navigation';

export default async function AdminLoginPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations('AdminAuth.LoginPage');
  
  // Redirect if already authenticated as admin
  await redirectAuthenticatedAdmin(locale);
  
  return (
    <AuthLayout 
      illustrationSrc="/illustrations/login.svg"
      illustrationAlt={t('illustrationAlt')}
    >
      <AuthCard 
        title={t('title')}
        logoAltText={t('logoAltText')}
      >
        <AdminLoginForm redirectPath={`/${locale}/admin/dashboard`} />
      </AuthCard>
    </AuthLayout>
  );
}