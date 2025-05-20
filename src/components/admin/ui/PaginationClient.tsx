'use client';

import { useRouter } from 'next/navigation';
import { PaginationControl } from '@/components/admin/ui';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  translations: {
    showing: string;
    of: string;
    entries: string;
    previousPage?: string;
    nextPage?: string;
    pageSize?: string;
  };
  // Generic props for different pages
  basePath?: string; // The base URL path for navigation
  locale?: string; // Optional locale for backward compatibility
  searchParams?: Record<string, string | undefined>; // Generic search params
  // Legacy props for backward compatibility
  status?: string | null;
  search?: string;
}

/**
 * Client-side pagination component that handles URL-based navigation
 * 
 * @param props Component props
 * @returns Pagination control that updates URL params
 */
export default function PaginationClient({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  translations,
  basePath,
  locale,
  searchParams = {},
  // Legacy props
  status,
  search,
}: PaginationClientProps) {
  const router = useRouter();
  
  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100];
  
  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    
    // Add all search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Legacy support
    if (status && !searchParams.status) params.set('status', status);
    if (search && !searchParams.search) params.set('search', search);
    
    // Set new pagination parameters
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    
    // Determine the URL path
    let path = '/admin/verifications'; // Default path for backward compatibility
    
    if (basePath) {
      path = basePath; // New way: explicit path
    } else if (locale) {
      path = `/${locale}/admin/verifications`; // Old way with locale
    }
    
    // Navigate to the new URL
    router.push(`${path}?${params.toString()}`);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    
    // Add all search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Legacy support
    if (status && !searchParams.status) params.set('status', status);
    if (search && !searchParams.search) params.set('search', search);
    
    // Reset to page 1 when changing page size
    params.set('page', '1');
    params.set('page_size', newPageSize.toString());
    
    // Determine the URL path
    let path = '/admin/verifications'; // Default path for backward compatibility
    
    if (basePath) {
      path = basePath; // New way: explicit path
    } else if (locale) {
      path = `/${locale}/admin/verifications`; // Old way with locale
    }
    
    // Navigate to the new URL
    router.push(`${path}?${params.toString()}`);
  };
  
  return (
    <PaginationControl
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
      totalItems={totalItems}
      pageSizeOptions={pageSizeOptions}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      translations={translations}
    />
  );
} 