import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (locale !== 'ar') {
    // Optionally handle invalid locales here, e.g., throw an error or redirect
    // For now, we assume only 'ar' will be passed due to middleware.
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  };
}); 