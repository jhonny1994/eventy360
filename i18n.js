import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Use the requested locale as is without forcing it to 'ar'
  // This ensures proper locale handling throughout the application
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});