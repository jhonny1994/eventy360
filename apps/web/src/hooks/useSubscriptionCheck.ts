import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription, clearSubscriptionCache } from "./useSubscription";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

/**
 * Possible subscription check results from middleware
 */
export type SubscriptionCheckResult =
  | "passed"
  | "failed-no-user"
  | "failed-error"
  | "failed-insufficient"
  | "failed-unknown"
  | null;

/**
 * Hook options for useSubscriptionCheck
 */
export interface UseSubscriptionCheckOptions {
  /**
   * Whether to redirect to the subscription page if the check fails
   * @default true
   */
  redirectOnFailure?: boolean;

  /**
   * Custom redirect path if redirectOnFailure is true
   * @default "/profile?tab=subscription" (localized)
   */
  redirectPath?: string;

  /**
   * Whether to show a toast message when redirecting due to subscription check failure
   * @default true
   */
  showToastOnRedirect?: boolean;

  /**
   * Callback to run when a subscription check fails
   */
  onCheckFailed?: (result: SubscriptionCheckResult) => void;
}

/**
 * Hook to check subscription status
 *
 * This uses headers set by the middleware when available, and falls back
 * to client-side subscription checking otherwise.
 */
export function useSubscriptionCheck(
  options: UseSubscriptionCheckOptions = {}
) {
  const {
    redirectOnFailure = true,
    redirectPath,
    showToastOnRedirect = true,
  } = options;
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const {
    subscriptionData,
    canAccessPremiumFeature,
    loading,
    refreshSubscriptionData  // Use the refresh function
  } = useSubscription();
  const [middlewareResult, setMiddlewareResult] =
    useState<SubscriptionCheckResult>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Try to get header set by middleware if present
    if (typeof window !== "undefined") {
      // Check for the x-subscription-check header in document.cookie (not directly accessible)
      // This is just a basic check - the middleware has ultimate authority
      const middlewareHeader = document.querySelector(
        'meta[name="x-subscription-check"]'
      );
      if (middlewareHeader) {
        const content = middlewareHeader.getAttribute("content");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMiddlewareResult(content as SubscriptionCheckResult);

        if (content === "passed") {
          setHasAccess(true);
        } else if (content?.startsWith("failed-")) {
          setHasAccess(false);

          // If check failed, clear the subscription cache to force a refresh next time
          if (user?.id) {
            clearSubscriptionCache(user.id);
          }

          if (redirectOnFailure) {
            const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
            const locale = localeMatch ? localeMatch[1] : "ar"; // Default to Arabic locale

            const targetPath =
              redirectPath || `/${locale}/profile?tab=subscription`;

            if (showToastOnRedirect) {
              // Toast would be shown here via toast system
            }

            if (options.onCheckFailed) {
              options.onCheckFailed(content as SubscriptionCheckResult);
            }

            router.push(targetPath);
          }
        }
      }
    }
  }, [
    options,
    pathname,
    redirectOnFailure,
    redirectPath,
    router,
    showToastOnRedirect,
    user
  ]);

  // If no middleware result, use client-side check
  useEffect(() => {
    if (middlewareResult === null && !loading) {
      const hasAccess = canAccessPremiumFeature();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAccess(hasAccess);

      if (!hasAccess && redirectOnFailure) {
        // If check failed on client-side, clear cache and force refresh data next time
        if (user?.id) {
          clearSubscriptionCache(user.id);
        }

        const localeMatch = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
        const locale = localeMatch ? localeMatch[1] : "ar"; // Default to Arabic locale

        const targetPath =
          redirectPath || `/${locale}/profile?tab=subscription`;

        if (showToastOnRedirect) {
          // Toast would be shown here via toast system
        }

        if (options.onCheckFailed) {
          options.onCheckFailed("failed-insufficient");
        }

        router.push(targetPath);
      }
    }
  }, [
    subscriptionData,
    middlewareResult,
    loading,
    canAccessPremiumFeature,
    redirectOnFailure,
    pathname,
    redirectPath,
    showToastOnRedirect,
    options,
    router,
    user
  ]);

  return {
    hasAccess,
    loading: loading || hasAccess === null,
    middlewareResult,
    subscriptionData,
    refreshSubscriptionData // Expose the refresh function
  };
}
