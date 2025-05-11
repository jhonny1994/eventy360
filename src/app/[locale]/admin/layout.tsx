import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

async function AdminSidebar({ locale, t }: { locale: string, t: (key: string) => string }) {
  const navItems = [
    { href: `/${locale}/admin`, label: t('nav.dashboard') },
    { href: `/${locale}/admin/users`, label: t('nav.userManagement') },
    { href: `/${locale}/admin/payments`, label: t('nav.paymentManagement') },
  ];

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 h-screen sticky top-0 shadow-lg">
      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default async function AdminLayout({ children, params: { locale } }: Props) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations({ locale, namespace: 'AdminPage' });

  if (!user) {
    return redirect(`/${locale}/login?redirectTo=/${locale}/admin`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.user_type !== 'admin') {
    return redirect(`/${locale}`);
  }
  
  return (
    <div className="flex" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <AdminSidebar locale={locale} t={t} />
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {children}
      </main>
    </div>
  );
} 