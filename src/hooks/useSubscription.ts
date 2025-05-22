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

export const useSubscription = (targetUserId?: string) => {
  const { supabase, user, loading: authLoading } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user && !targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: rpcError } = await supabase.rpc(
          "get_subscription_details",
          targetUserId ? { target_user_id: targetUserId } : {}
        );

        if (rpcError) {
          setError(rpcError);
          setLoading(false);
          return;
        }

        setSubscriptionData(data as UserSubscriptionData);
      } catch (e) {
        setError(e as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSubscriptionDetails();
    }
  }, [supabase, user, authLoading, targetUserId]);

  const hasPaidSubscription = () => {
    if (!subscriptionData?.has_subscription) return false;
    if (!subscriptionData?.subscription?.is_active) return false;
    return ['paid_researcher', 'paid_organizer'].includes(subscriptionData.subscription.tier);
  };

  const hasActiveTrialSubscription = () => {
    if (!subscriptionData?.has_subscription) return false;
    if (!subscriptionData?.subscription?.is_active) return false;
    return subscriptionData.subscription.status === 'trial';
  };

  const canAccessPremiumFeature = () => {
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

  return { 
    subscriptionData, 
    loading: authLoading || loading, 
    error, 
    hasPaidSubscription,
    hasActiveTrialSubscription,
    canAccessPremiumFeature,
    getDaysRemaining,
    getSubscriptionTier,
    getSubscriptionStatus
  };
}; 