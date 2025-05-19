'use client';

import { useRouter } from 'next/navigation';
import { PaginationControl } from '@/components/admin/ui';

interface PaginationClientProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  locale: string;
  status?: string | null;
  search?: string;
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
  locale,
  status,
  search,
  translations,
}: PaginationClientProps) {
  const router = useRouter();
  
  // Available page size options
  const pageSizeOptions = [10, 25, 50, 100];
  
  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    
    // Keep existing filters
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    
    // Set new pagination parameters
    params.set('page', page.toString());
    params.set('page_size', pageSize.toString());
    
    // Navigate to the new URL
    router.push(`/${locale}/admin/verifications?${params.toString()}`);
  };
  
  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams();
    
    // Keep existing filters
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    
    // Reset to page 1 when changing page size
    params.set('page', '1');
    params.set('page_size', newPageSize.toString());
    
    // Navigate to the new URL
    router.push(`/${locale}/admin/verifications?${params.toString()}`);
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