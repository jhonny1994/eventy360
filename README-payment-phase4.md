# Subscription Protection System

This directory contains middleware and components for implementing subscription-based access control in the Eventy360 application. The system provides both server-side middleware protection and client-side component guards.

## Overview

The subscription protection system consists of:

1. **Middleware Protection**: Server-side route protection using Next.js middleware
2. **Component Guards**: Client-side component protection using a higher-order component (HOC)
3. **Subscription Hook**: React hook for accessing subscription data and status

## Server-Side Protection (Middleware)

The middleware system allows you to protect routes based on subscription status.

### Integration with Main Middleware

To protect routes, modify the main `middleware.ts` file to use the `applySubscriptionGuard` helper:

```typescript
// middleware.ts
import { applySubscriptionGuard } from "@/middleware/applySubscriptionGuard";
import { SubscriptionRestriction } from "@/middleware/subscriptionMiddleware";

export async function middleware(request: NextRequest) {
  // ... existing middleware code ...

  // Check for subscription-protected routes
  const subscriptionResponse = await applySubscriptionGuard(request, i18nResponse, [
    {
      pathPattern: '/premium-features',
      restriction: SubscriptionRestriction.REQUIRE_PAID
    },
    {
      pathPattern: /^\/researcher\/advanced\/.*/,
      restriction: SubscriptionRestriction.REQUIRE_RESEARCHER
    },
    {
      pathPattern: '/organizer/event-management',
      restriction: SubscriptionRestriction.REQUIRE_ORGANIZER
    },
    {
      pathPattern: '/trial-features',
      restriction: SubscriptionRestriction.ACCEPT_TRIAL
    }
  ]);

  if (subscriptionResponse) {
    return subscriptionResponse;
  }

  // ... rest of the middleware code ...
}
```

### Subscription Restriction Types

The following restriction types are available:

- `REQUIRE_PAID`: Requires any active paid subscription (paid_researcher or paid_organizer)
- `REQUIRE_RESEARCHER`: Requires an active paid researcher subscription specifically
- `REQUIRE_ORGANIZER`: Requires an active paid organizer subscription specifically
- `ACCEPT_TRIAL`: Accepts either an active paid subscription or an active trial

## Client-Side Protection (Component Guards)

For component-level protection, use the `withSubscriptionGuard` higher-order component:

```tsx
import { withSubscriptionGuard } from "@/components/hoc/withSubscriptionGuard";

function PremiumFeature() {
  return (
    <div>
      <h1>Premium Feature</h1>
      <p>This content is only available to subscribers.</p>
    </div>
  );
}

// Wrap the component with the subscription guard
export default withSubscriptionGuard(PremiumFeature);

// With custom options:
export default withSubscriptionGuard(PremiumFeature, {
  redirectToUpgrade: false, // Show message instead of redirecting
  CustomSubscriptionRequiredComponent: MyCustomPaywall // Optional custom component
});
```

## Hooks for Subscription Data

### useSubscription

Use this hook to access the user's subscription data:

```tsx
import { useSubscription } from "@/hooks/useSubscription";

function MyComponent() {
  const { 
    subscriptionData, 
    loading, 
    error,
    hasPaidSubscription,
    hasActiveTrialSubscription,
    canAccessPremiumFeature
  } = useSubscription();

  if (loading) {
    return <div>Loading subscription data...</div>;
  }

  if (error) {
    return <div>Error loading subscription data</div>;
  }

  return (
    <div>
      {canAccessPremiumFeature() ? (
        <div>Premium content here</div>
      ) : (
        <div>Subscribe to access premium features</div>
      )}
    </div>
  );
}
```

### useSubscriptionCheck

This hook combines middleware checks with client-side checks:

```tsx
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";

function ProtectedFeature() {
  const { 
    hasAccess, 
    loading, 
    middlewareResult 
  } = useSubscriptionCheck({
    redirectOnFailure: true,
    redirectPath: '/pricing',
    showToastOnRedirect: true,
    onCheckFailed: (reason) => {
      console.log('Subscription check failed:', reason);
    }
  });

  if (loading) {
    return <div>Checking subscription...</div>;
  }
  
  if (!hasAccess) {
    // This will likely never be shown because of the redirect
    return <div>Please subscribe to access this feature</div>;
  }

  return (
    <div>
      <h1>Protected Feature</h1>
      <p>This content requires an active subscription</p>
    </div>
  );
}
```

## Displaying Subscription Status

Use the `SubscriptionStatusIndicator` component to display the user's subscription status:

```tsx
import SubscriptionStatusIndicator from "@/components/ui/SubscriptionStatusIndicator";

function UserProfile() {
  const { subscriptionData } = useSubscription();
  
  return (
    <div>
      {subscriptionData?.subscription && (
        <SubscriptionStatusIndicator
          status={subscriptionData.subscription.status}
          tier={subscriptionData.subscription.tier}
          daysRemaining={subscriptionData.subscription.days_remaining}
          // Optional props:
          size="md"
          showIcon={true}
          showDaysRemaining={true}
          className="my-custom-class"
        />
      )}
    </div>
  );
}
```

## Backend Functions

The subscription system relies on these database functions:

- `get_subscription_details`: Returns comprehensive subscription details for a user
- `get_subscription_pricing`: Calculates prices based on user type and billing period 