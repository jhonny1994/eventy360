import {getRequestConfig} from 'next-intl/server';
// import arMessages from './messages/ar.json'; // Static import REMOVED

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

  // let messagesToUse; // Block for static import REMOVED
  // if (finalLocale === 'ar') {
  //   messagesToUse = arMessages;
  // } else {
  //   // Fallback or error for other locales if you only have 'ar'
  //   console.warn(`Messages for locale ${finalLocale} not found, using empty object.`);
  //   messagesToUse = {}; 
  // }

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default // Using DYNAMIC import
    // messages: messagesToUse // REMOVED
  };
});