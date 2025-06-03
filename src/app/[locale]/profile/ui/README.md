# Profile UI Components and Hook Usage Guidelines

This directory contains UI components for the profile section of the Eventy360 application. This document outlines the standardized hook usage patterns to ensure consistency across the profile section.

## Standardized Hooks

### 1. `useUserProfile`

Used to access the user's profile data in client components.

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function MyComponent() {
  const { profile, loading, error } = useUserProfile();
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return <div>{profile.baseProfile.user_type}</div>;
}
```

For consistent profile data access, use the `ProfileDataProvider` component:

```tsx
import ProfileDataProvider from './ProfileDataProvider';

function MyComponent() {
  return (
    <ProfileDataProvider>
      {(profile) => (
        <div>{profile.baseProfile.user_type}</div>
      )}
    </ProfileDataProvider>
  );
}
```

### 2. `useSubscription`

Used to access subscription data and check subscription status.

```tsx
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { 
    subscriptionData, 
    loading, 
    hasPaidSubscription,
    hasActiveTrialSubscription,
    canAccessPremiumFeature,
    refreshSubscriptionData
  } = useSubscription();
  
  if (loading) return <Loading />;
  
  const hasAccess = canAccessPremiumFeature();
  
  return hasAccess ? <PremiumFeature /> : <SubscriptionPrompt />;
}
```

### 3. `useSubscriptionCheck`

Used to protect premium features with automatic redirection.

```tsx
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

function PremiumFeatureComponent() {
  const { hasAccess, loading } = useSubscriptionCheck({
    redirectOnFailure: true, // Redirects to subscription page if check fails
    redirectPath: '/ar/profile?tab=subscription', // Optional custom path
    showToastOnRedirect: true // Shows a toast notification when redirecting
  });
  
  if (loading) return <Loading />;
  if (!hasAccess) return null; // Will redirect
  
  return <div>Premium feature content</div>;
}
```

For consistent premium feature protection, use the `PremiumFeatureGuard` component:

```tsx
import PremiumFeatureGuard from './PremiumFeatureGuard';

function MyComponent() {
  return (
    <PremiumFeatureGuard>
      <PremiumFeatureComponent />
    </PremiumFeatureGuard>
  );
}
```

### 4. `useTranslations`

Always use the custom wrapper for translations in client components.

```tsx
import useTranslations from '@/hooks/useTranslations';

function MyComponent() {
  const t = useTranslations('ProfilePage');
  
  return <div>{t('someKey')}</div>;
}
```

### 5. `useAuth`

Used to access the Supabase client and authentication state.

```tsx
import { useAuth } from '@/components/providers/AuthProvider';

function MyComponent() {
  const { user, supabase, loading, logout } = useAuth();
  
  if (loading) return <Loading />;
  if (!user) return <NotLoggedIn />;
  
  return <div>Welcome, {user.email}</div>;
}
```

## Component Patterns

1. Server components should use server-side data fetching with `createServerSupabaseClient`
2. Client components should use the appropriate hooks above
3. For complex data fetching, create custom hooks that build on these base hooks
4. Use TypeScript properly with all hooks to ensure type safety

## Data Flow Patterns

1. Server components fetch and pass data to client components
2. Client components use hooks for dynamic data and interactions
3. Use the Provider components for standardized access to common data
4. Update cache invalidation appropriately when data changes

Following these patterns ensures consistent hook usage throughout the profile section. 