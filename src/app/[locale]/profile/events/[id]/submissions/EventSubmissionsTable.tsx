'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge, Button, Select, TextInput, Spinner } from 'flowbite-react';
import { HiSearch, HiFilter, HiExternalLink, HiDocumentText } from 'react-icons/hi';

interface Profile {
  id: string;
  full_name: string;
  email: string;
}

interface Submission {
  id: string;
  created_at: string;
  updated_at: string;
  abstract_status: string | null;
  full_paper_status: string | null;
  title_translations: Record<string, string>;
  submitted_by: string;
  profiles: Profile;
}

interface EventSubmissionsTableProps {
  submissions: Submission[];
  locale: string;
  eventId: string;
}

// Define submission status colors
const statusColors: Record<string, string> = {
  abstract_submitted: "info",
  abstract_approved: "success",
  abstract_rejected: "failure",
  full_paper_submitted: "purple",
  full_paper_accepted: "success",
  full_paper_rejected: "failure",
  revision_requested: "warning",
  revision_submitted: "info"
};

// Status filter options
const statusFilterOptions = [
  { value: 'all', label: 'allStatuses' },
  { value: 'abstract_submitted', label: 'status.abstract_submitted' },
  { value: 'abstract_approved', label: 'status.abstract_approved' },
  { value: 'abstract_rejected', label: 'status.abstract_rejected' },
  { value: 'full_paper_submitted', label: 'status.full_paper_submitted' },
  { value: 'full_paper_accepted', label: 'status.full_paper_accepted' },
  { value: 'full_paper_rejected', label: 'status.full_paper_rejected' },
  { value: 'revision_requested', label: 'status.revision_requested' },
  { value: 'revision_submitted', label: 'status.revision_submitted' }
];

export default function EventSubmissionsTable({ 
  submissions,
  locale,
  eventId
}: EventSubmissionsTableProps) {
  const t = useTranslations('Submissions');
  const isRtl = locale === 'ar';
  
  // States for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(submissions);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Helper for consistent text alignment classes based on RTL
  const getTextAlignClass = () => {
    return isRtl ? 'text-right' : 'text-left';
  };

  // Get title based on locale
  const getTitle = useCallback((translations: Record<string, string>) => {
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

  // Determine the effective status of a submission
  const getEffectiveStatus = (submission: Submission) => {
    // If there's a full paper status, prioritize it
    if (submission.full_paper_status) {
      return submission.full_paper_status;
    }
    // Otherwise use the abstract status
    return submission.abstract_status || 'abstract_submitted';
  };

  // Filter submissions based on search term and status filter
  useEffect(() => {
    setIsLoading(true);
    
    // Apply filters
    const filtered = submissions.filter(submission => {
      const title = getTitle(submission.title_translations).toLowerCase();
      const searchMatch = searchTerm === '' || 
                          title.includes(searchTerm.toLowerCase()) ||
                          submission.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = getEffectiveStatus(submission);
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      return searchMatch && statusMatch;
    });
    
    setFilteredSubmissions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setIsLoading(false);
  }, [searchTerm, statusFilter, submissions, getTitle]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Filters */}
      <div className={`flex flex-col md:flex-row gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
        <div className={`relative flex-grow ${isRtl ? 'md:ml-4' : 'md:mr-4'}`}>
          <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
            <HiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            type="text"
            placeholder={t('searchSubmissions')}
            value={searchTerm}
            onChange={handleSearchChange}
            className={`block w-full ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'}`}
          />
        </div>
        
        <div className="flex items-center">
          <div className={`${isRtl ? 'ml-2' : 'mr-2'}`}>
            <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className={`min-w-[180px] ${isRtl ? 'text-right' : 'text-left'}`}
          >
            {statusFilterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </Select>
        </div>
      </div>
      
      {/* Results count */}
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${getTextAlignClass()}`}>
        {t('showingResults', { count: filteredSubmissions.length })}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="xl" />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-gray-500 dark:text-gray-400" dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr className={isRtl ? 'text-right' : 'text-left'}>
                  <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('submissionTitle')}</th>
                  <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('researcher')}</th>
                  <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('submissionStatus')}</th>
                  <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('lastUpdated')}</th>
                  <th scope="col" className="px-6 py-3" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((submission) => {
                    const status = getEffectiveStatus(submission);
                    return (
                      <tr key={submission.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${isRtl ? 'text-right' : 'text-left'}`}>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                          {getTitle(submission.title_translations)}
                        </td>
                        <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                          <div>
                            <div className="font-medium">{submission.profiles.full_name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                          <Badge color={statusColors[status] || 'gray'}>
                            {t(`status.${status}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                          {formatDate(submission.updated_at)}
                        </td>
                        <td className="px-6 py-4" style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Link
                              href={`/${locale}/profile/events/${eventId}/submissions/${submission.id}`}
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <HiExternalLink className={`h-4 w-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                              {t('viewDetails')}
                            </Link>
                            
                            {/* Display different review options based on status */}
                            {status === 'abstract_submitted' && (
                              <Link 
                                href={`/${locale}/profile/events/${eventId}/submissions/${submission.id}/review-abstract`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                                {t('reviewAbstract')}
                              </Link>
                            )}
                            
                            {status === 'full_paper_submitted' && (
                              <Link 
                                href={`/${locale}/profile/events/${eventId}/submissions/${submission.id}/review-paper`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                                {t('reviewPaper')}
                              </Link>
                            )}
                            
                            {status === 'revision_submitted' && (
                              <Link 
                                href={`/${locale}/profile/events/${eventId}/submissions/${submission.id}/review-paper`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className={`w-4 h-4 ${isRtl ? 'ml-1' : 'mr-1'}`} />
                                {t('reviewRevision')}
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center">
                      {t('noSubmissions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex ${isRtl ? 'flex-row-reverse' : 'flex-row'} justify-between items-center mt-4`}>
              <Button
                color="light"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {t('pagination.previous')}
              </Button>
              
              <span className="text-sm text-gray-700 dark:text-gray-400">
                {t('pagination.showing')} {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredSubmissions.length)} {t('pagination.of')} {filteredSubmissions.length}
              </span>
              
              <Button
                color="light"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {t('pagination.next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 