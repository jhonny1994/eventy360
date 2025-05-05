import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  // Provide a fallback for locale to ensure it's always 'ar'
  const finalLocale = locale === 'ar' ? locale : 'ar';

  if (finalLocale !== 'ar') {
    // This should ideally not be reached due to the fallback and middleware,
    // but kept for robustness.
    console.error('Invalid locale detected in getRequestConfig despite fallback:', locale);
    // Handle error appropriately, e.g., throw new Error('Invalid locale');
  }

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default
  };
});