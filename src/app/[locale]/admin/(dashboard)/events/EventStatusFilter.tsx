'use client';

import { Button, Badge } from 'flowbite-react';
import Link from 'next/link';
import { HiFilter, HiCalendar, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { useLocale } from 'next-intl';

interface EventStatusFilterProps {
  activeFilter: string | null;
  ongoingCount: number;
  completedCount: number;
  cancelledCount: number;
  locale: string;
  search?: string;
  page?: number;
  pageSize?: number;
  translations: {
    allEvents: string;
    ongoing: string;
    completed: string;
    cancelled: string;
  };
}

/**
 * Client component for filtering events by status
 * Consolidates event statuses into three categories:
 * - ongoing (published, abstract_review, full_paper_submission_open, full_paper_review)
 * - completed
 * - cancelled
 */
export default function EventStatusFilter({
  activeFilter,
  ongoingCount,
  completedCount,
  cancelledCount,
  locale,
  search,
  pageSize = 10,
  translations,
}: EventStatusFilterProps) {
  const appLocale = useLocale();
  const isRtl = appLocale === 'ar';

  // Build URLs for filter links
  const getFilterUrl = (filterType: string | null) => {
    const params = new URLSearchParams();
    if (filterType) params.set("status", filterType);
    if (search) params.set("search", search);
    // Reset to page 1 when changing filters
    params.set("page", "1");
    params.set("page_size", pageSize.toString());
    return `/${locale}/admin/events?${params.toString()}`;
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
          {translations.allEvents}
        </Button>
      </Link>
      <Link href={getFilterUrl('ongoing')}>
        <Button 
          color={activeFilter === 'ongoing' ? 'info' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiCalendar className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.ongoing}
          <Badge color="info" className={`${isRtl ? 'me-2' : 'ms-2'}`}>
            {ongoingCount}
          </Badge>
        </Button>
      </Link>
      <Link href={getFilterUrl('completed')}>
        <Button 
          color={activeFilter === 'completed' ? 'success' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiCheckCircle className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.completed}
          <Badge color="success" className={`${isRtl ? 'me-2' : 'ms-2'}`}>
            {completedCount}
          </Badge>
        </Button>
      </Link>
      <Link href={getFilterUrl('cancelled')}>
        <Button 
          color={activeFilter === 'cancelled' ? 'failure' : 'light'}
          size="sm"
          className="flex items-center"
        >
          <HiXCircle className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
          {translations.cancelled}
          <Badge color="failure" className={`${isRtl ? 'me-2' : 'ms-2'}`}>
            {cancelledCount}
          </Badge>
        </Button>
      </Link>
    </div>
  );
} 