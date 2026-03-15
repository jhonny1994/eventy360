import { getTranslations } from "next-intl/server";
import { Card } from "flowbite-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { formatDate } from "@/utils/admin/format";
import { PaginationClient } from "@/components/admin/ui";
import TopicActionButtons from "./TopicActionButtons";
import TopicUsageCount from "./TopicUsageCount";
import { revalidatePath } from "next/cache";
import TopicsSearchFilter from "./TopicsSearchFilter";

// Topic interface to properly type the data
interface Topic {
  id: string;
  slug: string;
  name_translations: {
    ar?: string;
    en?: string;
    fr?: string;
    [key: string]: string | undefined;
  };
  created_at: string;
  updated_at: string;
}

type TopicsListProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    page_size?: string;
  }>;
  params: Promise<{ locale: string }>;
};

// Default values for pagination
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

// Removed cache control headers for cacheComponents compatibility
/**
 * Admin topics overview page
 * Shows all topics with search functionality
 * Enhanced with improved UI and RTL support
 */
export default async function AdminTopicsPage({
  params,
  searchParams,
}: TopicsListProps) {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  const searchParamsData = await searchParams;
  const { search, page: pageParam, page_size: pageSizeParam } = searchParamsData || {};
  const t = await getTranslations("AdminTopics");

  // Parse pagination parameters with defaults
  const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE;
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Get all topics
  const { data: allTopics, error } = await supabase
    .from('topics')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Filter and paginate the topics in JS
  let topics: Topic[] = [];
  let filteredTopics = allTopics || [];
  
  // Apply search filter if provided
  if (search && search.trim() !== '' && allTopics) {
    const searchLower = search.toLowerCase();
    filteredTopics = filteredTopics.filter(topic => {
      // Search across all language translations
      const nameTranslations = topic.name_translations || {};
      return Object.values(nameTranslations).some(
        name => typeof name === 'string' && name.toLowerCase().includes(searchLower)
      );
    });
  }
  
  // Get total count
  const totalTopics = filteredTopics.length;
  
  // Paginate
  topics = filteredTopics.slice(offset, offset + pageSize) as Topic[];

  // Pagination translations
  const paginationTranslations = {
    showing: t('pagination.showing'),
    of: t('pagination.of'),
    entries: t('pagination.entries'),
    previousPage: t('pagination.previousPage'),
    nextPage: t('pagination.nextPage'),
    pageSize: t('pagination.pageSize'),
  };

  // Calculate total pages
  const totalPages = totalTopics ? Math.ceil(totalTopics / pageSize) : 0;

  // Function to get appropriate text align class based on RTL
  const getTextAlignClass = () => {
    return isRtl ? 'text-right' : 'text-left';
  };

  // Stronger RTL text direction enforcement classes
  const getRtlClass = () => {
    return isRtl ? 'rtl' : 'ltr';
  };

  // Function to force revalidation
  const forceRevalidate = async () => {
    'use server';
    revalidatePath(`/${locale}/admin/topics`);
  };

  return (
    <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t('description')}
        </p>
      </div>

      {/* Filter and action buttons section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center">
          <TopicActionButtons variant="create" onSuccess={async () => {
            'use server';
            // Force refresh the page to show the new topic
            await forceRevalidate();
          }} />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <TopicsSearchFilter
            activeSearch={search || null}
            locale={locale}
            pageSize={pageSize}
            translations={{
              search: t('filters.search'),
              searchPlaceholder: t('filters.searchPlaceholder'),
            }}
          />
        </div>
      </div>

      {/* Main content */}
      <Card>
        {error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t('fetchError')} {error.message}
          </div>
        ) : !topics || topics.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search ? t('filters.noMatchingTopics') : t('noTopics')}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()}`} dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t('table.name')}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t('table.slug')}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t('table.usageCount')}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t('table.createdAt')}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr
                      key={topic.id}
                      className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      <td className={`px-4 py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        {topic.name_translations?.ar || topic.name_translations?.en || t('table.untitled')}
                      </td>
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        {topic.slug}
                      </td>
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <TopicUsageCount topicId={topic.id} />
                      </td>
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        {formatDate(topic.created_at)}
                      </td>
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <TopicActionButtons 
                          variant="row" 
                          topic={topic} 
                          onSuccess={async () => {
                            'use server';
                            // Force refresh the page to show updated topics
                            await forceRevalidate();
                          }} 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination component */}
            <div className="p-4">
              <PaginationClient
                currentPage={page}
                totalItems={totalTopics}
                pageSize={pageSize}
                totalPages={totalPages}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/topics`}
                locale={locale}
                searchParams={Object.fromEntries(
                  Object.entries(searchParamsData).filter(([k]) => !['page', 'page_size'].includes(k))
                )}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
} 