'use client';

import { useLocale } from 'next-intl';
import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  translations: {
    showing: string;
    of: string;
    entries: string;
    previousPage?: string;
    nextPage?: string;
    pageSize?: string;
  };
  // locale prop is kept for backward compatibility but no longer used as default
  locale?: string;
}

/**
 * Reusable pagination control for admin tables
 * Supports RTL languages with proper direction and button ordering
 * Uses the application's locale context for consistent behavior
 * 
 * @param props Component props
 * @returns Pagination control with page size selector
 */
export default function PaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  translations
}: PaginationControlProps) {
  // Get the locale from the application context
  const appLocale = useLocale();
  
  // Calculate the range of items currently showing
  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, currentPage * pageSize);
  
  // Check if we're using RTL
  const isRtl = appLocale === 'ar';
  
  // Previous/Next icons based on text direction
  const PreviousIcon = isRtl ? HiChevronRight : HiChevronLeft;
  const NextIcon = isRtl ? HiChevronLeft : HiChevronRight;
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 mt-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-sm text-gray-700 dark:text-gray-400">
        <span className="font-semibold">{translations.showing}</span> {startItem}-{endItem} {translations.of} {totalItems} {translations.entries}
      </div>
      
      <div className={`flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
        {/* Page size selector - only shown if onPageSizeChange is provided */}
        {onPageSizeChange && (
          <div className={`flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
            <span className="text-sm text-gray-500 dark:text-gray-400">{translations.pageSize || 'Page size'}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Pagination controls */}
        <div className={`flex items-center ${isRtl ? 'space-x-reverse' : ''} space-x-2`}>
          <Button
            color="light"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            size="sm"
            title={translations.previousPage || 'Previous page'}
          >
            <PreviousIcon className="h-5 w-5" />
          </Button>
          
          <div className="px-3 text-sm text-gray-700 dark:text-gray-400">
            {currentPage} / {totalPages}
          </div>
          
          <Button
            color="light"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            size="sm"
            title={translations.nextPage || 'Next page'}
          >
            <NextIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 