'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from 'flowbite-react';
import { HiExclamationCircle } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/database.types';
import { useUserProfile } from '@/hooks/useUserProfile';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import RepositorySearchBar from '@/app/[locale]/profile/repository/ui/RepositorySearchBar';
import RepositoryFilters from '@/app/[locale]/profile/repository/ui/RepositoryFilters';
import PaperCardGrid from '@/app/[locale]/profile/repository/ui/PaperCardGrid';
import RepositoryPagination from '@/app/[locale]/profile/repository/ui/RepositoryPagination';

// Extend the Paper type to include total_records, as it's added by the SQL function
type Paper = Database['public']['Functions']['discover_papers']['Returns'][0] & {
  total_records?: number;
  view_count?: number;
  download_count?: number;
};

// Types for location and topic data
interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface Daira {
  id: number;
  name_ar: string;
  name_other: string;
  wilaya_id: number;
}

interface Topic {
  id: string;
  name_translations: Record<string, string>;
  slug: string;
}

// After the Topic interface and before the RepositoryContainerProps interface
interface PaperAnalytics {
  submission_id: string;
  view_count: number;
  download_count: number;
}

interface RepositoryContainerProps {
  searchParams: {
    search?: string;
    topics?: string;
    location?: string;
    daira?: string;
    start_date?: string;
    end_date?: string;
    researcher?: string;
    page?: string;
    page_size?: string;
  };
  locale: string;
  organizerId?: string;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Main container for research repository functionality
 * Handles search, filtering, and pagination state
 * Integrates with database functions for paper retrieval
 * Uses standardized hooks:
 * - useAuth: For supabase client access
 * - useUserProfile: For user profile data
 * - useTranslations: For i18n translations
 * - useLocale: For locale-aware formatting
 */
export default function RepositoryContainer({
  searchParams,
  locale,
  organizerId
}: RepositoryContainerProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository');
  useLocale();
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { supabase } = useAuth();
  // Will be used in future implementation for user-specific features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { profile: userProfile, loading: profileLoading, error: profileError } = useUserProfile();

  // Parse search parameters
  const search = searchParams.search || '';
  const topicsParam = searchParams.topics || '';
  const locationParam = searchParams.location || '';
  const dairaParam = searchParams.daira || '';
  const startDate = searchParams.start_date || '';
  const endDate = searchParams.end_date || '';
  const researcherParam = searchParams.researcher || '';
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = parseInt(searchParams.page_size || DEFAULT_PAGE_SIZE.toString(), 10);

  // Component state
  const [papers, setPapers] = useState<Paper[]>([]);
  const [totalPapers, setTotalPapers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Reference data for locations and topics
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isReferenceDataLoading, setIsReferenceDataLoading] = useState(true);

  // Parse topic IDs from URL parameter
  const selectedTopics = useMemo(() => {
    return topicsParam ? topicsParam.split(',').filter(Boolean) : [];
  }, [topicsParam]);

  // Parse location (wilaya_id) from URL parameter  
  const selectedLocation = useMemo(() => {
    return locationParam ? parseInt(locationParam, 10) : null;
  }, [locationParam]);

  // Parse daira_id from URL parameter
  const selectedDaira = useMemo(() => {
    return dairaParam ? parseInt(dairaParam, 10) : null;
  }, [dairaParam]);

  // Parse researcher ID from URL parameter
  const selectedResearcher = useMemo(() => {
    return researcherParam || null;
  }, [researcherParam]);

  // Fetch reference data (wilayas, dairas, topics)
  useEffect(() => {
    const fetchReferenceData = async () => {
      setIsReferenceDataLoading(true);
      
      try {
        // Fetch wilayas
        const { data: wilayasData, error: wilayasError } = await supabase
          .from('wilayas')
          .select('id, name_ar, name_other')
          .order('id');
          
        if (wilayasError) throw wilayasError;
        setWilayas(wilayasData || []);
        
        // Fetch dairas
        const { data: dairasData, error: dairasError } = await supabase
          .from('dairas')
          .select('id, name_ar, name_other, wilaya_id')
          .order('id');
          
        if (dairasError) throw dairasError;
        setDairas(dairasData || []);
        
        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('id, name_translations, slug')
          .order('slug');
          
        if (topicsError) throw topicsError;
        setTopics(topicsData || []);
        
      } catch (err) {
        console.error('Error fetching reference data:', err);
        // We don't set the main error state here as it's not critical for the main functionality
      } finally {
        setIsReferenceDataLoading(false);
      }
    };
    
    fetchReferenceData();
  }, [supabase]);

  // Fetch papers function
  const fetchPapers = useCallback(async () => {
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
        daira_id_param: selectedDaira || undefined, 
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        author_name_filter: selectedResearcher || undefined,
        organizer_id: organizerId || undefined,
        limit_count: pageSize,
        offset_count: offset,
      };

      // Call the function with the complete parameter set
      const { data: rpcData, error: fetchError } = await supabase.rpc('discover_papers', rpcParams);

      if (fetchError) {
        throw fetchError;
      }

      // Cast rpcData to Paper[] before using it
      const typedData = rpcData as Paper[] | null;
      
      if (typedData && typedData.length > 0) {
        // Fetch analytics data for the papers
        const paperIds = typedData.map(paper => paper.id);
        const { data: analyticsData, error: analyticsError } = await supabase.rpc(
          'get_papers_analytics',
          { p_submission_ids: paperIds }
        );
        
        if (!analyticsError && analyticsData) {
          // Merge analytics data with papers
          const papersWithAnalytics = typedData.map(paper => {
            const analytics = analyticsData.find((a: PaperAnalytics) => a.submission_id === paper.id);
            return {
              ...paper,
              view_count: analytics?.view_count || 0,
              download_count: analytics?.download_count || 0
            };
          });
          
          setPapers(papersWithAnalytics);
        } else {
          // If analytics fetch fails, still show papers without analytics
          setPapers(typedData);
        }
        
        if (typeof typedData[0].total_records === 'number') {
          setTotalPapers(typedData[0].total_records);
        } else {
          setTotalPapers(0);
        }
      } else {
        setPapers([]);
        setTotalPapers(0);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
      setPapers([]);
      setTotalPapers(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    supabase,
    search,
    selectedTopics,
    selectedLocation,
    selectedDaira,
    startDate,
    endDate,
    selectedResearcher,
    organizerId,
    page,
    pageSize,
    t,
    profileLoading
  ]);

  // Fetch papers when dependencies change
  useEffect(() => {
    if (profileError) {
      setError(t('errors.profileFetchFailed'));
      setIsLoading(false);
      return;
    }
    if (!profileLoading) {
      fetchPapers();
    }
  }, [fetchPapers, profileLoading, profileError, t]);

  // Will be implemented in future search component
  const handleSearchChange = useCallback((searchQuery: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/profile/repository?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Will be implemented in future filters component
  const handleFiltersChange = useCallback((filters: {
    topics?: string[];
    location?: number | null;
    daira?: number | null;
    startDate?: string;
    endDate?: string;
    researcher?: string | null;
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
    
    // Update daira filter
    if (filters.daira) {
      params.set('daira', filters.daira.toString());
    } else {
      params.delete('daira');
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
    
    // Update researcher filter
    if (filters.researcher) {
      params.set('researcher', filters.researcher);
    } else {
      params.delete('researcher');
    }
    
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/profile/repository?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Will be implemented in future pagination component
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/${locale}/profile/repository?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Will be implemented in future pagination component
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set('page_size', newPageSize.toString());
    params.delete('page'); // Reset to first page
    router.push(`/${locale}/profile/repository?${params.toString()}`);
  }, [urlSearchParams, router, locale]);

  // Will be used in future pagination component
  const totalPages = Math.ceil(totalPapers / pageSize);

  if (error) {
    return (
      <Alert color="failure" icon={HiExclamationCircle}>
        <span className="font-medium">{t('errors.title')}</span> {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <RepositorySearchBar
        initialValue={search}
        onSearch={handleSearchChange}
        isLoading={isLoading}
        locale={locale}
      />

      <RepositoryFilters
        selectedTopics={selectedTopics}
        selectedLocation={selectedLocation}
        selectedDaira={selectedDaira}
        selectedResearcher={selectedResearcher}
        startDate={startDate}
        endDate={endDate}
        onFiltersChange={handleFiltersChange}
        locale={locale}
      />

      <PaperCardGrid
        papers={papers}
        isLoading={isLoading || isReferenceDataLoading}
        locale={locale}
        wilayas={wilayas}
        dairas={dairas}
        topics={topics}
      />

      {!isLoading && totalPapers > 0 && (
        <RepositoryPagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalPapers}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          locale={locale}
        />
      )}
    </div>
  );
} 