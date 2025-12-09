"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import PaymentInstructionsDisplay from "@/components/ui/PaymentInstructionsDisplay";
import PricingModal from "@/components/ui/PricingModal";
import type { AppSettings } from "@/lib/appConfig";
import { useLocale } from "next-intl";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionActionsProps {
  texts: {
    reactivateSubscription: string;
    upgradeTo: string;
    premiumTier: string;
    // Potentially add more texts if needed by the button or modal
  };
  appSettings: AppSettings | null;
  userType: "researcher" | "organizer" | null;
  locale?: string; // Kept for backward compatibility
  userId?: string;
}

export default function SubscriptionActions({
  texts,
  appSettings,
  userType,
  userId
}: SubscriptionActionsProps) {
  const appLocale = useLocale();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    tier: "researcher" | "organizer";
    period: "monthly" | "quarterly" | "biannual" | "annual";
    amount: number;
  } | null>(null);

  // Use the subscription hook to get subscription data
  const { subscriptionData } = useSubscription(userId);

  // Extract subscription details from the hook data
  const subscription = subscriptionData?.subscription;

  let buttonText = texts.upgradeTo + " " + texts.premiumTier;
  const showUpgradeButton = true;

  if (subscription) {
    // Ensure trial_ends_at is handled correctly for Date comparison
    const trialEnds = subscription.trial_ends_at
      ? new Date(subscription.trial_ends_at)
      : new Date(0);
    const now = new Date();

    if (
      subscription.status === "expired" ||
      (subscription.tier === "trial" && trialEnds < now)
    ) {
      buttonText = texts.reactivateSubscription;
    } else if (
      subscription.status === "active" &&
      (subscription.tier === "paid_researcher" ||
        subscription.tier === "paid_organizer")
    ) {
      // Logic for already active paid members can be refined here
      // For example, change buttonText to "Manage Subscription" or set showUpgradeButton = false
      // buttonText = "Manage Subscription";
      // showUpgradeButton = false;
    }
  } else {
    // No subscription data, default to upgrade text
    buttonText = texts.upgradeTo + " " + texts.premiumTier;
  }

  const handlePlanSelect = (
    tier: "researcher" | "organizer",
    period: "monthly" | "quarterly" | "biannual" | "annual",
    amount: number
  ) => {
    setSelectedPlan({ tier, period, amount });
    setShowPricingModal(false);
    setShowPaymentModal(true);
  };

  return (
    <>
      {showUpgradeButton && (
        <Button
          onClick={() => setShowPricingModal(true)}
          className={`text-white font-medium rounded-lg py-2 px-4 transition-colors duration-200 w-full ${subscription?.status === "expired" ||
              (subscription?.tier === "trial" &&
                (subscription.trial_ends_at
                  ? new Date(subscription.trial_ends_at)
                  : new Date(0)) < new Date())
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {buttonText}
        </Button>
      )}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          setIsOpen={setShowPricingModal}
          appSettings={appSettings}
          userType={userType}
          onPlanSelect={handlePlanSelect}
        />
      )}
      {showPaymentModal && (
        <PaymentInstructionsDisplay
          isOpen={showPaymentModal}
          setIsOpen={setShowPaymentModal}
          appSettings={appSettings}
          selectedPlan={selectedPlan}
          locale={appLocale}
          userId={userId}
        />
      )}
    </>
  );
}
