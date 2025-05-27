'use client';

import { Button, Badge } from 'flowbite-react';
import Link from 'next/link';
import { HiFilter } from 'react-icons/hi';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface VerificationFilterProps {
  activeFilter: string | null;
  pendingCount: number;
  locale: string;
  search?: string;
  translations: {
    allRequests: string;
    pending: string;
    approved: string;
    rejected: string;
  };
}

/**
 * Custom filter component for verification requests
 * Shows filter options for verification status
 */
export default function VerificationFilter({
  activeFilter,
  pendingCount,
  locale,
  search,
  translations,
}: VerificationFilterProps) {
  
  // Build URLs for filter links
  const getFilterUrl = (filterStatus: string | null) => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (search) params.set("search", search);
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
      <Link href={getFilterUrl('pending' as VerificationStatus)} >
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
      <Link href={getFilterUrl('approved' as VerificationStatus)} >
        <Button 
          color={activeFilter === 'approved' ? 'success' : 'light'}
          size="sm"
        >
          {translations.approved}
        </Button>
      </Link>
      <Link href={getFilterUrl('rejected' as VerificationStatus)} >
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