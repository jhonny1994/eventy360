'use client';

import { Link } from '@/i18n/navigation';
import { Button, Tooltip } from 'flowbite-react';
import { HiPencil, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function ProfilePageActions() {
  const { logout } = useAuth();
  const t = useTranslations('ProfilePage');
  const params = useParams();
  const locale = params.locale as string;
  
  // Determine tooltip placement based on text direction
  const tooltipPlacement = locale === 'ar' ? 'right' : 'left';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex md:flex-col flex-row items-center gap-3">
      <Tooltip content={t('editProfileButton')} placement={tooltipPlacement}>
        <Link href="/profile/edit" className="inline-block">
          <Button 
            color="gray"
            pill
            className="shadow-sm hover:shadow-md transition-all !p-2.5 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <HiPencil className="h-5 w-5" />
            <span className="sr-only">{t('editProfileButton')}</span>
          </Button>
        </Link>
      </Tooltip>
      
      <Tooltip content={t('logoutButton')} placement={tooltipPlacement}>
        <Button 
          color="gray"
          pill
          className="shadow-sm hover:shadow-md transition-all !p-2.5 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          onClick={handleLogout}
        >
          <HiArrowRightOnRectangle className="h-5 w-5" />
          <span className="sr-only">{t('logoutButton')}</span>
        </Button>
      </Tooltip>
    </div>
  );
} 