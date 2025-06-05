'use client';

import { useState, useCallback, useEffect } from 'react';
import { TextInput, Button, Spinner } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';

interface RepositorySearchBarProps {
  initialValue: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
  locale: string;
}

/**
 * Search bar component for research repository
 * Supports Arabic RTL layout and debounced search
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 * - useLocale: For RTL/LTR detection
 */
export default function RepositorySearchBar({
  initialValue,
  onSearch,
  isLoading,
  locale
}: RepositorySearchBarProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('ResearchRepository.search');
  useLocale();
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery !== initialValue) {
      onSearch(debouncedQuery.trim());
    }
  }, [debouncedQuery, onSearch, initialValue]);

  const handleSearch = useCallback(() => {
    // Immediately trigger search without waiting for debounce
    onSearch(searchQuery.trim());
  }, [searchQuery, onSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative flex">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none`}>
            <HiSearch className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <TextInput
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('placeholder')}
            className={`w-full ${isRtl ? 'pe-10' : 'ps-10'} ${searchQuery ? (isRtl ? 'ps-10' : 'pe-10') : ''}`}
            disabled={isLoading}
            dir={isRtl ? 'rtl' : 'ltr'}
            aria-label={t('placeholder')}
          />
          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className={`absolute inset-y-0 ${isRtl ? 'start-0 ps-3' : 'end-0 pe-3'} flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
              aria-label={t('clearFilters')}
            >
              <HiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <Button
          color="info"
          onClick={handleSearch}
          disabled={isLoading}
          className={`${isRtl ? 'me-2' : 'ms-2'} flex-shrink-0`}
        >
          {isLoading ? (
            <Spinner size="sm" className={isRtl ? 'ml-1' : 'mr-1'} />
          ) : null}
          {t('button')}
        </Button>
      </div>
    </div>
  );
} 