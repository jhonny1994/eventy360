'use client';

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
}

/**
 * Reusable pagination control for admin tables
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
  translations,
}: PaginationControlProps) {
  // Calculate the range of items currently showing
  const startItem = Math.min(totalItems, (currentPage - 1) * pageSize + 1);
  const endItem = Math.min(totalItems, currentPage * pageSize);
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 mt-4">
      <div className="text-sm text-gray-700 dark:text-gray-400">
        <span className="font-semibold">{translations.showing}</span> {startItem}-{endItem} {translations.of} {totalItems} {translations.entries}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Page size selector - only shown if onPageSizeChange is provided */}
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{translations.pageSize || 'Page size'}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Pagination controls */}
        <div className="flex items-center">
          <Button
            color="light"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            size="sm"
            title={translations.previousPage || 'Previous page'}
          >
            <HiChevronLeft className="h-5 w-5" />
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
            <HiChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 