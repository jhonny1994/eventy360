'use client';

import { useState, useCallback } from 'react';
import { TextInput, Button, Spinner } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';
import useTranslations from '@/hooks/useTranslations';

interface EventSearchBarProps {
  initialValue: string;
  onSearch: (query: string) => void;
  isLoading: boolean;
  locale: string;
}

/**
 * EventSearchBar component for searching events
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 */
export default function EventSearchBar({
  initialValue,
  onSearch,
  isLoading,
  locale
}: EventSearchBarProps) {
  const isRtl = locale === 'ar';
  const t = useTranslations('Events.search');
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSearch = useCallback(() => {
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
          />
          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className={`absolute inset-y-0 ${isRtl ? 'start-0 ps-3' : 'end-0 pe-3'} flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
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

      {/* Search Suggestions or Quick Filters could go here */}
      {searchQuery && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {t('tip')}
        </div>
      )}
    </div>
  );
}
