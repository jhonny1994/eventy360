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
    allRequests: string;
    pending: string;
    approved: string;
    rejected: string;
  };
}

/**
 * Client component for filtering verification requests by status
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
    return `/${locale}/admin/verifications?${params.toString()}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={getFilterUrl(null)} >
        <Button 
          color={!activeFilter ? 'info' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiFilter className="mr-1 h-4 w-4" />
          {translations.allRequests}
        </Button>
      </Link>
      <Link href={getFilterUrl('pending')} >
        <Button 
          color={activeFilter === 'pending' ? 'warning' : 'light'}
          size="sm"
          className="flex items-center"
        >
          {translations.pending}
          <Badge color="warning" className="ms-2">
            {pendingCount}
          </Badge>
        </Button>
      </Link>
      <Link href={getFilterUrl('approved')} >
        <Button 
          color={activeFilter === 'approved' ? 'success' : 'light'}
          size="sm"
        >
          {translations.approved}
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