'use client';

import { Button, Badge } from 'flowbite-react';
import Link from 'next/link';
import { HiFilter, HiLibrary, HiTicket } from 'react-icons/hi';
import { useLocale } from 'next-intl';

interface UserTypeFilterProps {
  activeFilter: string | null;
  researchersCount: number;
  organizersCount: number;
  locale: string;
  search?: string;
  page?: number;
  pageSize?: number;
  translations: {
    allUsers: string;
    researchers: string;
    organizers: string;
  };
}

/**
 * Client component for filtering users by type
 */
export default function UserTypeFilter({
  activeFilter,
  researchersCount,
  organizersCount,
  locale,
  search,
  pageSize = 10,
  translations,
}: UserTypeFilterProps) {
  const appLocale = useLocale();
  const isRtl = appLocale === 'ar';

  // Build URLs for filter links
  const getFilterUrl = (filterType: string | null) => {
    const params = new URLSearchParams();
    if (filterType) params.set("user_type", filterType);
    if (search) params.set("search", search);
    // Reset to page 1 when changing filters
    params.set("page", "1");
    params.set("page_size", pageSize.toString());
    return `/${locale}/admin/users?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={getFilterUrl(null)}>
        <Button 
          color={!activeFilter ? 'info' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiFilter className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.allUsers}
        </Button>
      </Link>
      <Link href={getFilterUrl('researcher')}>
        <Button 
          color={activeFilter === 'researcher' ? 'info' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiLibrary className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.researchers}
          <Badge color="info" className={`${isRtl ? 'me-2' : 'ms-2'}`}>
            {researchersCount}
          </Badge>
        </Button>
      </Link>
      <Link href={getFilterUrl('organizer')}>
        <Button 
          color={activeFilter === 'organizer' ? 'purple' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiTicket className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.organizers}
          <Badge color="purple" className={`${isRtl ? 'me-2' : 'ms-2'}`}>
            {organizersCount}
          </Badge>
        </Button>
      </Link>
    </div>
  );
} 