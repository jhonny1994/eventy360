# Standardized Hooks

This directory contains standardized hooks for use throughout the Eventy360 application. Using these hooks instead of directly importing from external libraries ensures consistent behavior, simplifies future refactoring, and makes components more maintainable.

## Available Hooks

### `useAuth`

Provides authentication state and Supabase client access.

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, supabase, isLoading, signOut } = useAuth();
  
  // Use authentication state and Supabase client
}
```

### `useUserProfile`

Provides access to the current user's profile data.

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function MyComponent() {
  const { profile, loading, error, refreshProfile } = useUserProfile();
  
  // Use profile data
}
```

### `useSubscription`

Provides subscription data and status.

```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { subscription, isLoading, isSubscribed, canAccessPremiumFeature } = useSubscription();
  
  // Use subscription data
}
```

### `useSubscriptionCheck`

For premium feature protection, with optional redirect.

```tsx
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

function MyComponent() {
  const { hasAccess, loading } = useSubscriptionCheck({
    redirectOnFailure: true,
    showToastOnRedirect: true
  });
  
  // Component will only render if user has access
}
```

### `useTranslations`

For i18n translations, wrapping next-intl's useTranslations.

```tsx
import useTranslations from '@/hooks/useTranslations';

function MyComponent() {
  const t = useTranslations('Namespace');
  
  return <h1>{t('title')}</h1>;
}
```

### `useLocale`

For locale-aware formatting and rendering.

```tsx
import useLocale from '@/hooks/useLocale';

function MyComponent() {
  const locale = useLocale();
  
  // Format dates, numbers, etc. based on locale
  const formattedDate = new Date().toLocaleDateString(locale);
  
  return <span>{formattedDate}</span>;
}
```

## Best Practices

1. **Always use these hooks** instead of importing directly from external libraries
2. **Document usage** in components with JSDoc-style comments
3. **Follow the hook standardization plan** in `src/app/[locale]/profile/HOOK_STANDARDIZATION_PLAN.md`

## Implementation Progress

Hook standardization is in progress across the application:
- ✅ 100% complete in Profile Core UI section
- ✅ 100% complete in Submissions section
- 🔄 Events section in progress
- 🔄 Other sections pending

Overall progress: 51% (18/35 components)

## Creating New Standardized Hooks

When creating new standardized hooks:

1. Create the hook in this directory
2. Document the hook in this README
3. Update the HOOK_STANDARDIZATION_PLAN.md file
4. Add usage examples and documentation 