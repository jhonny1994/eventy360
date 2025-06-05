'use client';

import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';

interface EventPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  locale: string;
}

/**
 * EventPagination component for paginating through event results
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 */
export default function EventPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  locale
}: EventPaginationProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events.pagination');

  const pageSizeOptions = [12, 24, 48, 96];

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  // Calculate showing text
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div 
      className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Results Info */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <span>
          {t('showing')} {startItem} {t('to')} {endItem} {t('of')} {totalItems} {t('results')}
        </span>
      </div>

      {/* Page Size Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t('pageSize')}:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Pagination Controls */}
      <div className={`flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-1`}>
        {/* Previous Button */}
        <Button
          color="light"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center"
        >
          {isRtl ? (
            <HiChevronRight className="h-4 w-4" />
          ) : (
            <HiChevronLeft className="h-4 w-4" />
          )}
          <span className={isRtl ? 'mr-1' : 'ml-1'}>{t('previous')}</span>
        </Button>

        {/* Page Numbers */}
        <div className={`flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-1`}>
          {pages.map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-3 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  color={currentPage === page ? 'info' : 'light'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next Button */}
        <Button
          color="light"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center"
        >
          <span className={isRtl ? 'ml-1' : 'mr-1'}>{t('next')}</span>
          {isRtl ? (
            <HiChevronLeft className="h-4 w-4" />
          ) : (
            <HiChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
