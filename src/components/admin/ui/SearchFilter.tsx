'use client';

import { useState } from 'react';
import { TextInput, Button } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  placeholder: string;
  initialValue?: string;
}

/**
 * Reusable search filter component for admin tables
 * 
 * @param props - Component props
 * @returns Search filter input with clear button
 */
export default function SearchFilter({
  onSearch,
  placeholder,
  initialValue = '',
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex w-full md:w-1/3 gap-2">
      <div className="relative w-full">
        <TextInput
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder={placeholder}
          rightIcon={HiSearch}
          className="w-full"
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-10 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={handleClear}
            type="button"
          >
            <HiX className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button color="info" onClick={handleSearch}>
        <HiSearch className="mr-1 h-4 w-4" />
        Search
      </Button>
    </div>
  );
} 