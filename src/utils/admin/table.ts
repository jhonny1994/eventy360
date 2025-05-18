/**
 * Utility functions for data table operations in admin section
 */

interface SortableData {
  [key: string]: string | number | boolean | Date | null | undefined;
}

/**
 * Sort data based on column and direction
 * 
 * @param data - Array of objects to sort
 * @param sortField - Field to sort by
 * @param direction - Sort direction (asc or desc)
 * @returns Sorted array
 */
export function sortData<T extends SortableData>(
  data: T[],
  sortField: keyof T,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    // Handle string comparisons
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Handle date objects
    if (
      valueA instanceof Date && 
      valueB instanceof Date
    ) {
      return direction === 'asc'
        ? valueA.getTime() - valueB.getTime()
        : valueB.getTime() - valueA.getTime();
    }

    // Handle string dates
    if (
      typeof valueA === 'string' &&
      typeof valueB === 'string' &&
      !isNaN(Date.parse(valueA)) &&
      !isNaN(Date.parse(valueB))
    ) {
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      return direction === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    // Handle number comparisons
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    }

    // Handle boolean comparisons
    if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
      return direction === 'asc'
        ? Number(valueA) - Number(valueB)
        : Number(valueB) - Number(valueA);
    }

    // Handle null/undefined values
    if (valueA === null || valueA === undefined) {
      return direction === 'asc' ? -1 : 1;
    }
    if (valueB === null || valueB === undefined) {
      return direction === 'asc' ? 1 : -1;
    }

    // Default comparison
    return direction === 'asc'
      ? String(valueA).localeCompare(String(valueB))
      : String(valueB).localeCompare(String(valueA));
  });
}

/**
 * Filter data based on search query
 * 
 * @param data - Array of objects to filter
 * @param searchQuery - Search query
 * @param searchFields - Fields to search in
 * @returns Filtered array
 */
export function filterData<T extends Record<string, unknown>>(
  data: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchQuery) return data;
  
  const query = searchQuery.toLowerCase().trim();
  
  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      
      const stringValue = String(value).toLowerCase();
      return stringValue.includes(query);
    });
  });
} 