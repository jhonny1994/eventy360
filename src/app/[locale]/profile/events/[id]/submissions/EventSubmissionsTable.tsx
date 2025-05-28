'use client';

import { useState, useEffect } from 'react';
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
  locale
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

  // Get title based on locale
  const getTitle = (translations: Record<string, string>) => {
    if (locale === 'ar') return translations.ar;
    if (locale === 'en' && translations.en) return translations.en;
    if (locale === 'fr' && translations.fr) return translations.fr;
    return translations.ar; // Default to Arabic if preferred locale not available
  };
  
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
                          submission.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          submission.profiles.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = getEffectiveStatus(submission);
      const statusMatch = statusFilter === 'all' || status === statusFilter;
      
      return searchMatch && statusMatch;
    });
    
    setFilteredSubmissions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setIsLoading(false);
  }, [searchTerm, statusFilter, submissions]);

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
    <div className="space-y-4">
      {/* Filters */}
      <div className={`flex flex-col md:flex-row gap-4 ${isRtl ? 'md:flex-row-reverse' : ''}`}>
        <div className={`relative flex-grow ${isRtl ? 'md:ml-4' : 'md:mr-4'}`}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <HiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            type="text"
            placeholder={t('searchSubmissions')}
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10"
          />
        </div>
        
        <div className="flex items-center">
          <div className={`${isRtl ? 'ml-2' : 'mr-2'}`}>
            <HiFilter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="min-w-[180px]"
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
      <div className="text-sm text-gray-500 dark:text-gray-400">
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
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">{t('submissionTitle')}</th>
                  <th scope="col" className="px-6 py-3">{t('researcher')}</th>
                  <th scope="col" className="px-6 py-3">{t('submissionStatus')}</th>
                  <th scope="col" className="px-6 py-3">{t('lastUpdated')}</th>
                  <th scope="col" className="px-6 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((submission) => {
                    const status = getEffectiveStatus(submission);
                    return (
                      <tr key={submission.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {getTitle(submission.title_translations)}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">{submission.profiles.full_name}</div>
                            <div className="text-xs text-gray-500">{submission.profiles.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={statusColors[status] || 'gray'}>
                            {t(`status.${status}`)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {formatDate(submission.updated_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-2">
                            <Link 
                              href={`/${locale}/profile/submissions/${submission.id}`}
                              className="font-medium text-blue-600 hover:underline dark:text-blue-500 flex items-center gap-1"
                            >
                              <HiExternalLink className="w-4 h-4" />
                              {t('viewDetails')}
                            </Link>
                            
                            {/* Display different review options based on status */}
                            {status === 'abstract_submitted' && (
                              <Link 
                                href={`/${locale}/profile/submissions/${submission.id}/review-abstract`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className="w-4 h-4" />
                                {t('reviewAbstract')}
                              </Link>
                            )}
                            
                            {status === 'full_paper_submitted' && (
                              <Link 
                                href={`/${locale}/profile/submissions/${submission.id}/review-paper`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className="w-4 h-4" />
                                {t('reviewPaper')}
                              </Link>
                            )}
                            
                            {status === 'revision_submitted' && (
                              <Link 
                                href={`/${locale}/profile/submissions/${submission.id}/review-revision`}
                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500 flex items-center gap-1"
                              >
                                <HiDocumentText className="w-4 h-4" />
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
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400">{t('noMatchingSubmissions')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-4 gap-2">
              <Button
                size="sm"
                color="light"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  const pageNumber = i + 1 + Math.max(0, currentPage - 3);
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNumber}
                      size="sm"
                      color={pageNumber === currentPage ? 'blue' : 'light'}
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-8"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                size="sm"
                color="light"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 