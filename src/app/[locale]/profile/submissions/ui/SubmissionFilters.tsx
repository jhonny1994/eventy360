'use client';

import { useState } from 'react';
import useTranslations from '@/hooks/useTranslations';
import { Search, Filter } from 'lucide-react';

export interface SubmissionFiltersState {
  status: string;
  searchTerm: string;
}

interface SubmissionFiltersProps {
  onFilterChange: (filters: SubmissionFiltersState) => void;
  statusOptions: { value: string; label: string }[];
}

/**
 * SubmissionFilters component for filtering submission lists
 * 
 * Note: This component follows the standardized hook pattern by using:
 * - useTranslations - For i18n translations
 * 
 * This is a UI component that provides search and status filtering capabilities.
 */
export default function SubmissionFilters({ onFilterChange, statusOptions }: SubmissionFiltersProps) {
  const t = useTranslations('Submissions');
  const [filters, setFilters] = useState<SubmissionFiltersState>({
    status: 'all',
    searchTerm: '',
  });

  // Add "All" status to the beginning of status options
  const allStatusOptions = [
    { value: 'all', label: t('filters.allStatus') },
    ...statusOptions,
  ];

  // Handle filter changes
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, status: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, searchTerm: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={t('filters.searchPlaceholder')}
            value={filters.searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status filter */}
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={filters.status}
            onChange={handleStatusChange}
          >
            {allStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 