'use client';

import { Button, Badge } from 'flowbite-react';
import Link from 'next/link';
import { HiInbox, HiClipboardCheck, HiCheckCircle, HiXCircle, HiFilter } from 'react-icons/hi';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';

interface SubmissionStatusFilterProps {
  activeFilter: string;
  receivedCount: number;
  underReviewCount: number;
  acceptedCount: number;
  rejectedCount: number;
  locale: string;
  search?: string;
  page?: number | string;
  pageSize?: number | string;
  translations: {
    allSubmissions: string;
    received: string;
    underReview: string;
    accepted: string;
    rejected: string;
  };
}

/**
 * Client component for filtering submissions by status
 */
export default function SubmissionStatusFilter({
  activeFilter,
  receivedCount,
  underReviewCount,
  acceptedCount,
  rejectedCount,
  locale,
  search,
  pageSize = 10,
  translations,
}: SubmissionStatusFilterProps) {
  const appLocale = useLocale();
  const isRtl = appLocale === 'ar';

  // Memoize the filter URLs to avoid recalculating on every render
  const filterUrls = useMemo(() => {
    const createUrl = (filterType: string) => {
      const params = new URLSearchParams();
      params.set("status", filterType);
      if (search) params.set("search", search);
      // Reset to page 1 when changing filters
      params.set("page", "1");
      params.set("pageSize", pageSize.toString());
      return `/${locale}/admin/submissions?${params.toString()}`;
    };

    return {
      all: createUrl("all"),
      received: createUrl("received"),
      underReview: createUrl("under_review"),
      accepted: createUrl("accepted"),
      rejected: createUrl("rejected")
    };
  }, [locale, search, pageSize]);

  // Memoize the RTL helper values
  const rtlClasses = useMemo(() => ({
    iconMargin: isRtl ? 'ml-1' : 'mr-1',
    badgeMargin: isRtl ? 'me-2' : 'ms-2'
  }), [isRtl]);

  // Memoize the total count
  const totalCount = useMemo(() => 
    receivedCount + underReviewCount + acceptedCount + rejectedCount,
  [receivedCount, underReviewCount, acceptedCount, rejectedCount]);

  // Helper function to determine if a filter is active
  const isActiveFilter = (filter: string) => activeFilter === filter;

  return (
    <div className="flex flex-wrap gap-2">
      {/* All filter */}
      <Link href={filterUrls.all}>
        <Button
          color={isActiveFilter("all") ? "info" : "light"}
          size="sm"
          className="flex items-center"
        >
          <HiFilter className={`${rtlClasses.iconMargin} h-4 w-4`} />
          {translations.allSubmissions}
          <Badge color="info" className={rtlClasses.badgeMargin}>
            {totalCount}
          </Badge>
        </Button>
      </Link>

      {/* Received filter */}
      <Link href={filterUrls.received}>
        <Button
          color={isActiveFilter("received") ? "info" : "light"}
          size="sm"
          className="flex items-center"
        >
          <HiInbox className={`${rtlClasses.iconMargin} h-4 w-4`} />
          {translations.received}
          <Badge color="info" className={rtlClasses.badgeMargin}>
            {receivedCount}
          </Badge>
        </Button>
      </Link>

      {/* Under review filter */}
      <Link href={filterUrls.underReview}>
        <Button
          color={isActiveFilter("under_review") ? "warning" : "light"}
          size="sm"
          className="flex items-center"
        >
          <HiClipboardCheck className={`${rtlClasses.iconMargin} h-4 w-4`} />
          {translations.underReview}
          <Badge color="warning" className={rtlClasses.badgeMargin}>
            {underReviewCount}
          </Badge>
        </Button>
      </Link>

      {/* Accepted filter */}
      <Link href={filterUrls.accepted}>
        <Button
          color={isActiveFilter("accepted") ? "success" : "light"}
          size="sm"
          className="flex items-center"
        >
          <HiCheckCircle className={`${rtlClasses.iconMargin} h-4 w-4`} />
          {translations.accepted}
          <Badge color="success" className={rtlClasses.badgeMargin}>
            {acceptedCount}
          </Badge>
        </Button>
      </Link>

      {/* Rejected filter */}
      <Link href={filterUrls.rejected}>
        <Button
          color={isActiveFilter("rejected") ? "failure" : "light"}
          size="sm"
          className="flex items-center"
        >
          <HiXCircle className={`${rtlClasses.iconMargin} h-4 w-4`} />
          {translations.rejected}
          <Badge color="failure" className={rtlClasses.badgeMargin}>
            {rejectedCount}
          </Badge>
        </Button>
      </Link>
    </div>
  );
} 