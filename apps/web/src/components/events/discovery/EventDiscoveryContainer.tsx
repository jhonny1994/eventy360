/**
 * Main container component for event discovery functionality
 * 
 * Handles search, filtering, and pagination state
 * Integrates with database functions for event retrieval
 * 
 * Uses standardized hooks:
 * - useAuth: For Supabase client access
 * - useUserProfile: For profile data access
 * - useTranslations: For i18n translations
 */
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useTranslations from '@/hooks/useTranslations';
import { Alert } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
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
  const { supabase } = useAuth();
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
  ), [userProfile?.baseProfile]);

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
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
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
        p_organizer_id: organizerId,
        limit_count: pageSize,
        offset_count: offset,
      };

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
    organizerId,
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
    router.push(`/${locale}/profile/events?${params.toString()}`);
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
    router.push(`/${locale}/profile/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/${locale}/profile/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page_size', newPageSize.toString());
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/profile/events?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  const totalPages = Math.ceil(totalEvents / pageSize);

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

      {/* Event Grid */}
      <EventCardGrid
        events={events}
        isLoading={isLoading}
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
