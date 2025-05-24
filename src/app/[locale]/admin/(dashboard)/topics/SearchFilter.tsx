'use client';

import { HiSearch, HiX } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SearchFilterProps {
  activeSearch: string | null;
  locale: string;
  pageSize?: number;
  translations: {
    search: string;
    searchPlaceholder: string;
  };
}

/**
 * Client component for searching topics by name
 * Supports searching across all language translations
 * Maintains RTL compatibility
 */
export default function SearchFilter({
  activeSearch,
  locale,
  pageSize = 10,
  translations,
}: SearchFilterProps) {
  const router = useRouter();
  const isRtl = locale === 'ar';
  const [searchTerm, setSearchTerm] = useState(activeSearch || '');

  // Update search term state when the activeSearch prop changes
  useEffect(() => {
    setSearchTerm(activeSearch || '');
  }, [activeSearch]);

  // Handle clear search button click
  const handleClearSearch = () => {
    setSearchTerm('');
    
    // Create new URL params without the search param
    const params = new URLSearchParams();
    params.set('page', '1'); // Reset to page 1 when clearing search
    params.set('page_size', pageSize.toString());
    
    router.push(`/${locale}/admin/topics?${params.toString()}`);
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <form action={`/${locale}/admin/topics`} method="get">
        {/* Hidden inputs to maintain pagination parameters */}
        <input type="hidden" name="page" value="1" /> {/* Reset to page 1 when searching */}
        <input type="hidden" name="page_size" value={pageSize.toString()} />
        
        <div className="relative">
          {/* Search icon - positioned based on RTL settings */}
          <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none`}>
            <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          
          {/* Search input */}
          <input
            type="search"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full p-2 ${isRtl ? 'pe-10' : 'ps-10'} pr-14 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
            placeholder={translations.searchPlaceholder}
          />
          
          {/* Clear button - show only when search has content */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={`absolute inset-y-0 ${isRtl ? 'start-12' : 'end-12'} flex items-center`}
            >
              <HiX className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
            </button>
          )}
          
          {/* Search button */}
          <button
            type="submit"
            className={`absolute top-0 ${isRtl ? 'start-0' : 'end-0'} p-2 text-sm font-medium h-full text-white bg-blue-700 ${isRtl ? 'rounded-s-lg' : 'rounded-e-lg'} border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
          >
            {translations.search}
          </button>
        </div>
      </form>
    </div>
  );
} 