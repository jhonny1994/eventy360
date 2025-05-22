# Subscription Protection System

The subscription protection system in Eventy360 provides multiple layers of access control for premium features based on users' subscription status. This system consists of middleware protection, component guards, and subscription hooks.

## Overview

The system has three main components:

1. **Server-side Middleware Protection**: Protects routes at the server level before they're rendered
2. **Component Guards**: Protects components at the client level through higher-order components
3. **Subscription Hook**: Provides subscription data to components for conditional rendering

## Server-side Protection

### Integration with Next.js Middleware

To protect routes with subscription requirements, integrate the `applySubscriptionGuard` helper in your `middleware.ts` file:

```typescript
// middleware.ts
import { applySubscriptionGuard } from "@/middleware/applySubscriptionGuard";
import { SubscriptionRestriction } from "@/middleware/subscriptionMiddleware";

export async function middleware(request: NextRequest) {
  // ... existing middleware code ...
  
  // Apply subscription guards after authentication checks
  if (user && user.email_confirmed_at) {
    const subscriptionGuardsConfig = [
      // Premium features routes
      {
        pathPattern: /^\/[a-z]{2}\/premium-features.*/,
        restriction: SubscriptionRestriction.REQUIRE_PAID
      },
      // Researcher-specific routes
      {
        pathPattern: /^\/[a-z]{2}\/researcher\/advanced.*/,
        restriction: SubscriptionRestriction.REQUIRE_RESEARCHER
      },
      // Organizer-specific routes
      {
        pathPattern: /^\/[a-z]{2}\/organizer\/manage.*/,
        restriction: SubscriptionRestriction.REQUIRE_ORGANIZER
      },
      // Routes that accept trial subscriptions
      {
        pathPattern: /^\/[a-z]{2}\/trial-features.*/,
        restriction: SubscriptionRestriction.ACCEPT_TRIAL
      }
    ];
    
    const guardedResponse = await applySubscriptionGuard(
      request, 
      response, 
      subscriptionGuardsConfig
    );
    
    if (guardedResponse) {
      return guardedResponse;
    }
  }
  
  // ... rest of middleware code ...
}
```

### Subscription Restriction Types

The system supports the following restriction types:

- `REQUIRE_PAID`: Requires any active paid subscription (researcher or organizer)
- `REQUIRE_RESEARCHER`: Requires an active paid researcher subscription
- `REQUIRE_ORGANIZER`: Requires an active paid organizer subscription
- `ACCEPT_TRIAL`: Accepts either an active paid subscription or a trial subscription

## Client-side Protection

### Component Guards

For client-side protection, use the `withSubscriptionGuard` higher-order component (HOC):

```typescript
import { withSubscriptionGuard } from '@/components/hoc/withSubscriptionGuard';

// Your premium component
function PremiumFeature() {
  return <div>This is a premium feature</div>;
}

// Wrap the component with the subscription guard
export default withSubscriptionGuard(PremiumFeature);
```

You can customize the behavior:

```typescript
// Custom options
export default withSubscriptionGuard(PremiumFeature, {
  redirectToUpgrade: false, // Show a message instead of redirecting
  CustomSubscriptionRequiredComponent: MyCustomMessage // Custom component to show when subscription is required
});
```

### Subscription Hooks

Two hooks are available for accessing subscription data:

1. **useSubscription**: Basic hook for fetching subscription data

```typescript
import { useSubscription } from '@/hooks/useSubscription';

function MyComponent() {
  const { 
    subscriptionData, 
    loading, 
    hasPaidSubscription,
    hasActiveTrialSubscription,
    canAccessPremiumFeature
  } = useSubscription();
  
  if (loading) return <Spinner />;
  
  return (
    <div>
      {canAccessPremiumFeature() ? (
        <PremiumContent />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

2. **useSubscriptionCheck**: Enhanced hook that combines middleware checks with client-side verification

```typescript
import { useSubscriptionCheck } from '@/hooks/useSubscriptionCheck';

function ProtectedPage() {
  const { hasAccess, loading } = useSubscriptionCheck({
    redirectOnFailure: true,
    redirectPath: '/custom-upgrade-path',
    showToastOnRedirect: true,
    onCheckFailed: (result) => console.log('Subscription check failed:', result)
  });
  
  if (loading) return <Spinner />;
  
  // This will only render if the user has access
  return <div>Protected content</div>;
}
```

## Displaying Subscription Status

Use the `SubscriptionStatusIndicator` component to display the user's subscription status:

```typescript
import SubscriptionStatusIndicator from '@/components/ui/SubscriptionStatusIndicator';

function ProfileComponent({ user }) {
  const { subscriptionData } = useSubscription();
  
  if (!subscriptionData?.subscription) return null;
  
  return (
    <div>
      <h3>Subscription Status</h3>
      <SubscriptionStatusIndicator
        status={subscriptionData.subscription.status}
        tier={subscriptionData.subscription.tier}
        daysRemaining={subscriptionData.subscription.days_remaining}
      />
    </div>
  );
}
```

## Backend Functions

The subscription system is backed by Supabase database functions:

- `get_subscription_details`: Fetches current subscription details for a user
- `get_subscription_pricing`: Provides pricing information for subscriptions

These functions are called by the middleware and hooks as needed. 