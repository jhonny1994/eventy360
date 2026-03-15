import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PostgrestError } from "@supabase/supabase-js";

export interface SubscriptionPayment {
  id: string;
  status: "pending_verification" | "verified" | "rejected";
  amount: number;
  billing_period: "monthly" | "quarterly" | "biannual" | "annual";
  payment_method: "bank" | "check" | "cash" | "online";
  reported_at: string;
  verified_at: string | null;
  reference_number: string | null;
  has_proof_document: boolean;
}

export interface SubscriptionPricing {
  base_price_monthly: number;
  billing_period: "monthly" | "quarterly" | "biannual" | "annual";
  discount_percentage: number;
  number_of_months: number;
  price_before_discount: number;
  discount_amount: number;
  final_price: number;
  currency: string;
  user_type: "researcher" | "organizer";
}

export interface SubscriptionDetails {
  id: string;
  tier: "free" | "paid_researcher" | "paid_organizer" | "trial";
  status: "active" | "expired" | "trial" | "cancelled";
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  days_remaining: number;
  is_active: boolean;
}

export interface UserSubscriptionData {
  has_subscription: boolean;
  user_id: string;
  user_type: "researcher" | "organizer" | "admin";
  subscription?: SubscriptionDetails;
  profile: {
    is_verified: boolean;
    user_type: "researcher" | "organizer" | "admin";
  };
  payments: SubscriptionPayment[];
  pricing?: SubscriptionPricing;
}

// Cache configuration
const CACHE_KEY_PREFIX = 'eventy360_subscription_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

interface CachedSubscriptionData {
  data: UserSubscriptionData;
  timestamp: number;
}

// Helper functions for cache management
const getSubscriptionCacheKey = (userId: string): string => {
  return `${CACHE_KEY_PREFIX}${userId}`;
};

const getCachedSubscriptionData = (userId: string): CachedSubscriptionData | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cachedData = localStorage.getItem(getSubscriptionCacheKey(userId));
    if (!cachedData) return null;

    const parsedData = JSON.parse(cachedData) as CachedSubscriptionData;
    const now = Date.now();

    // Check if cache is still valid
    if (now - parsedData.timestamp > CACHE_TTL_MS) {
      // Cache expired
      localStorage.removeItem(getSubscriptionCacheKey(userId));
      return null;
    }

    return parsedData;
  } catch {
    return null;
  }
};

const setCachedSubscriptionData = (userId: string, data: UserSubscriptionData): void => {
  if (typeof window === 'undefined') return;

  try {
    const cacheData: CachedSubscriptionData = {
      data,
      timestamp: Date.now()
    };

    localStorage.setItem(getSubscriptionCacheKey(userId), JSON.stringify(cacheData));
  } catch {
    // Silent fail for cache
  }
};

export const clearSubscriptionCache = (userId: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(getSubscriptionCacheKey(userId));
  } catch {
    // Silent fail for cache
  }
};

export const useSubscription = (targetUserId?: string) => {
  const { supabase, user, loading: authLoading } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [apiErrorOccurred, setApiErrorOccurred] = useState(false);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user && !targetUserId) {
        setLoading(false);
        return;
      }

      // Use targetUserId if provided, otherwise use current user's ID
      const userId = targetUserId || user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      // Check cache first (skip cache if targetUserId is provided, as we're likely viewing another user)
      if (!targetUserId) {
        const cachedData = getCachedSubscriptionData(userId);
        if (cachedData) {
          setSubscriptionData(cachedData.data);
          setLoading(false);
          return;
        }
      }

      try {
        const { data, error: rpcError } = await supabase.rpc(
          "get_subscription_details",
          targetUserId ? { target_user_id: targetUserId } : {}
        );

        if (rpcError) {
          setError(rpcError);
          setApiErrorOccurred(true);
          setLoading(false);
          return;
        }

        setApiErrorOccurred(false);
        setSubscriptionData(data as UserSubscriptionData);

        // Cache data if it's for the current user
        if (!targetUserId && user?.id) {
          setCachedSubscriptionData(user.id, data as UserSubscriptionData);
        }
      } catch (e) {
        setError(e as PostgrestError);
        setApiErrorOccurred(true);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubscriptionDetails();
    }
  }, [supabase, user, authLoading, targetUserId]);

  const hasPaidSubscription = () => {
    if (apiErrorOccurred) {
      // If there was an API error, check if the user was recently created (within 30 days)
      // and assume they're on a trial if so
      if (user?.created_at) {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation <= 30; // Assume user is on trial if account is less than 30 days old
      }
      return false;
    }

    if (!subscriptionData?.has_subscription) return false;
    if (!subscriptionData?.subscription?.is_active) return false;
    return ['paid_researcher', 'paid_organizer'].includes(subscriptionData.subscription.tier);
  };

  const hasActiveTrialSubscription = () => {
    if (apiErrorOccurred) {
      // If there was an API error, check if the user was recently created (within 30 days)
      // and assume they're on a trial if so
      if (user?.created_at) {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation <= 30; // Assume user is on trial if account is less than 30 days old
      }
      return false;
    }

    if (!subscriptionData?.has_subscription) return false;
    if (!subscriptionData?.subscription?.is_active) return false;
    return subscriptionData.subscription.status === 'trial';
  };

  const canAccessPremiumFeature = () => {
    // If we had an API error and the user's account is new (less than 30 days),
    // we'll allow access to premium features under the assumption they're on a trial
    if (apiErrorOccurred) {
      if (user?.created_at) {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation <= 30; // Assume user is on trial if account is less than 30 days old
      }
    }

    return hasPaidSubscription() || hasActiveTrialSubscription();
  };

  const getDaysRemaining = () => {
    return subscriptionData?.subscription?.days_remaining || 0;
  };

  const getSubscriptionTier = () => {
    return subscriptionData?.subscription?.tier || 'free';
  };

  const getSubscriptionStatus = () => {
    return subscriptionData?.subscription?.status || 'expired';
  };

  // Function to refresh subscription data manually (skip cache)
  const refreshSubscriptionData = async () => {
    if (!user && !targetUserId) {
      return;
    }

    setLoading(true);

    // Clear cache for current user
    if (user?.id) {
      clearSubscriptionCache(user.id);
    }

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "get_subscription_details",
        targetUserId ? { target_user_id: targetUserId } : {}
      );

      if (rpcError) {
        setError(rpcError);
        setApiErrorOccurred(true);
        setLoading(false);
        return;
      }

      setApiErrorOccurred(false);
      setSubscriptionData(data as UserSubscriptionData);

      // Cache fresh data if it's for the current user
      if (!targetUserId && user?.id) {
        setCachedSubscriptionData(user.id, data as UserSubscriptionData);
      }
    } catch (e) {
      setError(e as PostgrestError);
      setApiErrorOccurred(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    subscriptionData,
    loading: authLoading || loading,
    error,
    apiErrorOccurred,
    hasPaidSubscription,
    hasActiveTrialSubscription,
    canAccessPremiumFeature,
    getDaysRemaining,
    getSubscriptionTier,
    getSubscriptionStatus,
    refreshSubscriptionData
  };
}; 