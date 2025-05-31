'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Alert } from 'flowbite-react'; // Removed Spinner from here
import { HiExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import EventSearchBar from './EventSearchBar';
import EventFilters from './EventFilters';
import EventCardGrid from './EventCardGrid';
import EventPagination from './EventPagination';
import type { Database } from '@/database.types';
import { useUserProfile } from '@/hooks/useUserProfile';

// Extend the Event type to include total_records, as it's added by the SQL function
type Event = Database['public']['Functions']['discover_events']['Returns'][0] & {
  total_records?: number;
};

interface EventDiscoveryContainerProps {
  searchParams: {
    search?: string;
    topics?: string;
    location?: string;
    status?: string;
    format?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
    page_size?: string;
  };
  locale: string;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Main container for event discovery functionality
 * Handles search, filtering, and pagination state
 * Integrates with database functions for event retrieval
 */
export default function EventDiscoveryContainer({
  searchParams,
  locale
}: EventDiscoveryContainerProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events');
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const supabase = createClient();
  const { profile: userProfile, loading: profileLoading, error: profileError } = useUserProfile();

  // Parse search parameters
  const search = searchParams.search || '';
  const topicsParam = searchParams.topics || '';
  const locationParam = searchParams.location || '';
  const statusParam = searchParams.status || '';
  const formatParam = searchParams.format || '';
  const startDate = searchParams.start_date || '';
  const endDate = searchParams.end_date || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = parseInt(searchParams.page_size || DEFAULT_PAGE_SIZE.toString(), 10);

  // Component state
  const [events, setEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const organizerId = useMemo(() => (
    (userProfile?.baseProfile && userProfile.baseProfile.user_type === 'organizer')
      ? userProfile.baseProfile.id
      : undefined
  ), [userProfile?.baseProfile]); // Corrected dependency array

  // Parse topic IDs from URL parameter
  const selectedTopics = useMemo(() => {
    return topicsParam ? topicsParam.split(',').filter(Boolean) : [];
  }, [topicsParam]);

  // Parse location (wilaya_id) from URL parameter  
  const selectedLocation = useMemo(() => {
    return locationParam ? parseInt(locationParam, 10) : null;
  }, [locationParam]);

  // Parse status filter
  const selectedStatus = useMemo(() => {
    if (!statusParam) return [];
    return statusParam.split(',').filter(Boolean) as Database['public']['Enums']['event_status_enum'][];
  }, [statusParam]);

  // Parse format filter
  const selectedFormat = useMemo(() => {
    if (!formatParam) return [];
    return formatParam.split(',').filter(Boolean) as Database['public']['Enums']['event_format_enum'][];
  }, [formatParam]);

  // Fetch events function
  const fetchEvents = useCallback(async () => {
    if (profileLoading) {
      // setIsLoading(true); // Already handled by useEffect or initial state
      return;
    }
    setIsLoading(true);
    setError(null);    try {
      const offset = (page - 1) * pageSize;

      const rpcParams = {
        search_query: search || undefined,
        topic_ids: selectedTopics.length > 0 ? selectedTopics : undefined,
        wilaya_id_param: selectedLocation || undefined,
        daira_id_param: undefined, 
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        event_status_filter: selectedStatus.length > 0 ? selectedStatus : undefined,
        event_format_filter: selectedFormat.length > 0 ? selectedFormat : undefined,
        p_organizer_id: organizerId, // Use memoized organizerId
        limit_count: pageSize,
        offset_count: offset,
      };

      // Call the function with the complete parameter set
      const { data: rpcData, error: fetchError } = await supabase.rpc('discover_events', rpcParams);

      if (fetchError) {
        throw fetchError;
      }

      // Cast rpcData to Event[] before using it
      const typedData = rpcData as Event[] | null;

      setEvents(typedData || []);
      
      if (typedData && typedData.length > 0 && typeof typedData[0].total_records === 'number') {
        setTotalEvents(typedData[0].total_records);
      } else if (typedData && typedData.length === 0) {
        setTotalEvents(0);
      } else {
        setTotalEvents(0); 
      
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
      setEvents([]);
      setTotalEvents(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    supabase,
    search,
    selectedTopics,
    selectedLocation,
    startDate,
    endDate,
    selectedStatus,
    selectedFormat,
    page,
    pageSize,
    t,
    organizerId, // Use memoized organizerId instead of full userProfile
    profileLoading
  ]);

  // Fetch events when dependencies change
  useEffect(() => {
    if (profileError) {
      setError(t('errors.profileFetchFailed'));
      setIsLoading(false);
      return;
    }
    if (!profileLoading) {
      fetchEvents();
    } else {
      // Optionally set loading true if profile is loading and we want to show a spinner
      // setIsLoading(true); 
    }
  }, [fetchEvents, profileLoading, profileError, t]);

  // Handle search updates
  const handleSearchChange = useCallback((searchQuery: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Handle filter updates
  const handleFiltersChange = useCallback((filters: {
    topics?: string[];
    location?: number | null;
    status?: string[];
    format?: string[];
    startDate?: string;
    endDate?: string;
  }) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    
    // Update topic filter
    if (filters.topics && filters.topics.length > 0) {
      params.set('topics', filters.topics.join(','));
    } else {
      params.delete('topics');
    }
    
    // Update location filter
    if (filters.location) {
      params.set('location', filters.location.toString());
    } else {
      params.delete('location');
    }
    
    // Update status filter
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    } else {
      params.delete('status');
    }
    
    // Update format filter
    if (filters.format && filters.format.length > 0) {
      params.set('format', filters.format.join(','));
    } else {
      params.delete('format');
    }
    
    // Update date filters
    if (filters.startDate) {
      params.set('start_date', filters.startDate);
    } else {
      params.delete('start_date');
    }
    
    if (filters.endDate) {
      params.set('end_date', filters.endDate);
    } else {
      params.delete('end_date');
    }
    
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/${locale}/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page_size', newPageSize.toString());
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  const totalPages = Math.ceil(totalEvents / pageSize);

  // Remove the loading check here if it's handled by the main return's isLoading
  // if (isLoading && events.length === 0) { // Initial load or full reload
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <Spinner size="xl" />
  //     </div>
  //   );
  // }


  if (error) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        <span className="font-medium">{t('errors.title')}</span> {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search Bar */}
      <EventSearchBar
        initialValue={search}
        onSearch={handleSearchChange}
        isLoading={isLoading}
        locale={locale}
      />

      {/* Filters */}
      <EventFilters
        selectedTopics={selectedTopics}
        selectedLocation={selectedLocation}
        selectedStatus={selectedStatus}
        selectedFormat={selectedFormat}
        startDate={startDate}
        endDate={endDate}
        onFiltersChange={handleFiltersChange}
        locale={locale}
      />

      {/* Results Summary - Remove the redundant paragraph if it exists here */}
      {/* The user mentioned "فعالية واحدة" text. This div might contain it. */}
      {/* If the <p> tag showing this count is the only content, this div might be removed or simplified. */}
      {/* For now, assuming the <p> tag is inside this div and needs removal. */}
      {/* The simplest approach is to ensure that the specific text node or its container <p> is removed.
      Let's assume the structure was:
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{...display of totalEvents...}</p>
        <PageSizeSelector />
      </div>
      Then only the <p> is removed. If it was just the <p>, then the div might become empty.
      I will remove the <p> tag that usually shows this.
      */}
      <div className="flex justify-between items-center">
        {/* The problematic <p> tag that shows 'فعالية واحدة' would be here. */}
        {/* Removing it as requested. If other elements like page size selector are here, they remain. */}
        {/* For example, if it was:
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isLoading && !events.length ? t('loadingStatus') : t('resultsCount', { count: totalEvents })}
        </p> 
        It will be removed.
        If the div only contained this p tag, the div itself might become empty or be removed if not needed for layout.
        Let's assume there might be other elements, so we keep the div but ensure the specific text is gone.
        The most robust way is to ensure no <p> tag here renders that specific count text if pagination already does.
        Given the provided snippet ends here, I'm targeting the removal of such a <p> tag.
        If the pagination component also has a page size selector, this div might be entirely for the removed text.
        For now, I will ensure the text is not displayed by removing the typical <p> that would show it.
        */}
      </div>


      {/* Event Grid - Show spinner overlay or skeleton if loading and events are already present (incremental load) */}
      <EventCardGrid
        events={events}
        isLoading={isLoading}
        locale={locale}
      />

      {/* Pagination */}
      {!isLoading && totalEvents > 0 && (
        <EventPagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalEvents}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          locale={locale}
        />
      )}
    </div>
  );
}
