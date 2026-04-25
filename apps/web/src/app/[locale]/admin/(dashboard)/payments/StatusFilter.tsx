'use client';

import { Button, Badge } from 'flowbite-react';
import Link from 'next/link';
import { HiFilter } from 'react-icons/hi';

interface StatusFilterProps {
  activeFilter: string | null;
  pendingCount: number;
  locale: string;
  search?: string;
  page?: number;
  pageSize?: number;
  translations: {
    allPayments: string;
    pending_verification: string;
    verified: string;
    rejected: string;
  };
}

/**
 * Client component for filtering payment entries by status
 */
export default function StatusFilter({
  activeFilter,
  pendingCount,
  locale,
  search,
  pageSize = 10,
  translations,
}: StatusFilterProps) {
  // Build URLs for filter links
  const getFilterUrl = (filterStatus: string | null) => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
    // Reset to page 1 when changing filters
    params.set("page", "1"); 
    params.set("page_size", pageSize.toString());
    return `/${locale}/admin/payments?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <Link href={getFilterUrl(null)} >
        <Button 
          color={!activeFilter ? 'info' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiFilter className={`${locale === 'ar' ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.allPayments}
        </Button>
      </Link>
      <Link href={getFilterUrl('pending_verification')} >
        <Button 
          color={activeFilter === 'pending_verification' ? 'warning' : 'light'}
          size="sm"
          className="flex items-center"
        >
          {translations.pending_verification}
          <Badge color="warning" className={locale === 'ar' ? 'me-2' : 'ms-2'}>
            {pendingCount}
          </Badge>
        </Button>
      </Link>
      <Link href={getFilterUrl('verified')} >
        <Button 
          color={activeFilter === 'verified' ? 'success' : 'light'}
          size="sm"
        >
          {translations.verified}
        </Button>
      </Link>
      <Link href={getFilterUrl('rejected')} >
        <Button 
          color={activeFilter === 'rejected' ? 'failure' : 'light'}
          size="sm"
        >
          {translations.rejected}
        </Button>
      </Link>
    </div>
  );
} 