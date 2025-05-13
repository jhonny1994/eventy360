"use client";

import { useState } from "react";
import { Button } from "flowbite-react";
import PaymentInstructionsDisplay from "@/components/ui/PaymentInstructionsDisplay";
import PricingModal from "@/components/ui/PricingModal";
import type { AppSettings } from "@/lib/appConfig";

// Match the Subscription interface from ProfilePage.tsx
interface Subscription {
  id: string;
  user_id: string;
  tier: "free" | "paid_researcher" | "paid_organizer" | "trial";
  status: "active" | "expired" | "trial" | "cancelled";
  start_date: string;
  end_date: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SubscriptionActionsProps {
  texts: {
    reactivateSubscription: string;
    upgradeTo: string;
    premiumTier: string;
    // Potentially add more texts if needed by the button or modal
  };
  subscriptionData: Subscription | null; // Changed type to Subscription
  appSettings: AppSettings | null; // Added appSettings prop
  userType: "researcher" | "organizer" | null; // Added userType prop
  // Add locale if needed for any specific formatting within this component, though translations are passed via texts
}

export default function SubscriptionActions({
  texts,
  subscriptionData,
  appSettings,
  userType,
}: SubscriptionActionsProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    tier: "researcher" | "organizer";
    period: "monthly" | "quarterly" | "biannual" | "annual";
    amount: number;
  } | null>(null);

  let buttonText = texts.upgradeTo + " " + texts.premiumTier;
  const showUpgradeButton = true;

  if (subscriptionData) {
    // Ensure trial_ends_at is handled correctly for Date comparison
    const trialEnds = subscriptionData.trial_ends_at
      ? new Date(subscriptionData.trial_ends_at)
      : new Date(0);
    const now = new Date();

    if (
      subscriptionData.status === "expired" ||
      (subscriptionData.tier === "trial" && trialEnds < now)
    ) {
      buttonText = texts.reactivateSubscription;
    } else if (
      subscriptionData.status === "active" &&
      (subscriptionData.tier === "paid_researcher" ||
        subscriptionData.tier === "paid_organizer")
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
    console.log("Plan selected:", { tier, period, amount });
  };

  return (
    <>
      {showUpgradeButton && (
        <Button
          onClick={() => setShowPricingModal(true)}
          className={`text-white font-medium rounded-lg py-2 px-4 transition-colors duration-200 w-full ${
            subscriptionData?.status === "expired" ||
            (subscriptionData?.tier === "trial" &&
              (subscriptionData.trial_ends_at
                ? new Date(subscriptionData.trial_ends_at)
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
        />
      )}
    </>
  );
}
 