/**
 * Date formatting utilities
 */

/**
 * Format a date string or Date object based on locale
 * @param date Date string or Date object
 * @param locale Locale string (e.g. 'en', 'ar')
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, locale: string = 'ar'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a time string or Date object based on locale
 * @param date Date string or Date object
 * @param locale Locale string (e.g. 'en', 'ar')
 * @returns Formatted time string
 */
export function formatTime(date: string | Date, locale: string = 'ar'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Format a date and time string or Date object based on locale
 * @param date Date string or Date object
 * @param locale Locale string (e.g. 'en', 'ar')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date, locale: string = 'ar'): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    // Format options
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
} 