'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from 'flowbite-react';
import { Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import NoSubmissions from "./NoSubmissions";
import SubmissionFilters, { SubmissionFiltersState } from './SubmissionFilters';
import ActionButtons from './ActionButtons';

// Define the Submission type
export interface Submission {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  full_paper_status?: string;
  full_paper_file_url?: string;
  title_translations: {
    ar: string;
    en?: string;
    fr?: string;
  };
  events: {
    id: string;
    event_name_translations: {
      ar: string;
      en?: string;
      fr?: string;
    };
    event_type: string;
  };
}

interface SubmissionsListProps {
  submissions: Submission[];
  emptyMessage: string;
}

// Define submission status colors
const statusColors: Record<string, string> = {
  abstract_submitted: "info",
  abstract_under_review: "info",
  abstract_approved: "success",
  abstract_accepted: "success",
  abstract_rejected: "failure",
  full_paper_submitted: "purple",
  full_paper_under_review: "purple",
  full_paper_accepted: "success",
  full_paper_rejected: "failure",
  revision_requested: "warning",
  revision_submitted: "info",
  revision_under_review: "info",
  revision_accepted: "success",
  revision_rejected: "failure",
  published: "success"
};

export default function SubmissionsList({ submissions, emptyMessage }: SubmissionsListProps) {
  const t = useTranslations('Submissions');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'updated_at',
    direction: 'desc'
  });
  
  // State for filtering
  const [filters, setFilters] = useState<SubmissionFiltersState>({
    status: 'all',
    searchTerm: '',
  });
  
  // Get title based on locale
  const getTitle = useCallback((translations: { ar: string; en?: string; fr?: string }) => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  }, [locale]);
  
  // Format date based on locale
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Generate status options for filter
  const statusOptions = Object.keys(statusColors).map(status => ({
    value: status,
    label: t(`status.${status}`)
  }));
  
  // Handle filter changes
  const handleFilterChange = (newFilters: SubmissionFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply filters and sorting to submissions
  const filteredAndSortedSubmissions = useMemo(() => {
    // First, filter the submissions
    let result = [...submissions];
    
    // Filter by status
    if (filters.status !== 'all') {
      result = result.filter(item => item.status === filters.status);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(item => {
        const title = getTitle(item.title_translations).toLowerCase();
        const eventName = getTitle(item.events.event_name_translations).toLowerCase();
        return title.includes(searchLower) || eventName.includes(searchLower);
      });
    }
    
    // Then, sort the filtered submissions
    result.sort((a, b) => {
      if (sortConfig.key === 'title') {
        const aValue = getTitle(a.title_translations);
        const bValue = getTitle(b.title_translations);
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (sortConfig.key === 'event') {
        const aValue = getTitle(a.events.event_name_translations);
        const bValue = getTitle(b.events.event_name_translations);
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        const aValue = a[sortConfig.key as keyof Submission] as string;
        const bValue = b[sortConfig.key as keyof Submission] as string;
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
    });
    
    return result;
  }, [submissions, filters, sortConfig, getTitle]);
  
  // If no submissions after filtering, show modified empty state
  if (filteredAndSortedSubmissions.length === 0) {
    // If there are submissions but none match the filters
    if (submissions.length > 0) {
      return (
        <div className="space-y-4">
          <SubmissionFilters 
            onFilterChange={handleFilterChange} 
            statusOptions={statusOptions} 
          />
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {t('filters.noMatchingSubmissions')}
            </p>
          </div>
        </div>
      );
    }
    
    // If there are no submissions at all
    return <NoSubmissions message={emptyMessage} />;
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredAndSortedSubmissions.slice(startIndex, startIndex + itemsPerPage);
  
  // Render sort indicator
  const renderSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className={`w-4 h-4 ${isRtl ? 'mr-1' : 'ml-1'}`} /> 
      : <ArrowDown className={`w-4 h-4 ${isRtl ? 'mr-1' : 'ml-1'}`} />;
  };
  
  return (
    <div className="space-y-4">
      <SubmissionFilters 
        onFilterChange={handleFilterChange} 
        statusOptions={statusOptions} 
      />
      
    <div className="overflow-x-auto">
      <div className="w-full">
        <table className="w-full text-sm text-gray-500 dark:text-gray-400" dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr className={isRtl ? 'text-right' : 'text-left'}>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('title')}
                  style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}
                >
                  <div className="flex items-center">
                    {t('submissionTitle')}
                    {renderSortIndicator('title')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('event')}
                  style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}
                >
                  <div className="flex items-center">
                    {t('event')}
                    {renderSortIndicator('event')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('status')}
                  style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}
                >
                  <div className="flex items-center">
                    {t('submissionStatus')}
                    {renderSortIndicator('status')}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => requestSort('updated_at')}
                  style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}
                >
                  <div className="flex items-center">
                    {t('lastUpdated')}
                    {renderSortIndicator('updated_at')}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                  {t('actions')}
                </th>
            </tr>
          </thead>
          <tbody>
            {paginatedSubmissions.map((submission) => (
              <tr key={submission.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isRtl ? 'text-right' : 'text-left'}`}>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                  {getTitle(submission.title_translations)}
                </td>
                <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                  {getTitle(submission.events.event_name_translations)}
                </td>
                <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                  <Badge color={statusColors[submission.status] || 'gray'}>
                    {t(`status.${submission.status}`)}
                  </Badge>
                </td>
                  <td className="px-6 py-4 flex items-center gap-1" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                    <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(submission.updated_at)}
                </td>
                <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                    <ActionButtons submission={submission} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('pagination.showing')} {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAndSortedSubmissions.length)} {t('pagination.of')} {filteredAndSortedSubmissions.length}
            </div>
            
            <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {t('pagination.previous')}
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNumber = i + 1;
                  
                  // For more than 5 pages, show window around current page
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      // For first pages, show 1-5
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      // For last pages, show last 5
                      pageNumber = totalPages - 4 + i;
                    } else {
                      // For middle pages, show window around current
                      pageNumber = currentPage - 2 + i;
                    }
                  }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 rounded-md ${
                    pageNumber === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {t('pagination.next')}
          </button>
            </div>
        </div>
      )}
      </div>
    </div>
  );
} 