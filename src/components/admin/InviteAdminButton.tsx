"use client";

import { useState } from "react";
import { InviteAdminModal } from "@/components/admin";
import useLocale from "@/hooks/useLocale";

type InviteAdminButtonProps = {
  locale?: string;
  translations: {
    inviteAdmin: string;
    inviteModal: {
      title: string;
      form: {
        emailLabel: string;
        emailPlaceholder: string;
        nameLabel: string;
        namePlaceholder: string;
        send: string;
        sending: string;
        cancel: string;
      };
      success: {
        title: string;
        message: string;
      };
      errors: {
        allFieldsRequired: string;
        invalidEmail: string;
        inviteFailed: string;
      };
    };
  };
  className?: string;
  onSuccess?: () => void;
};

/**
 * Self-contained button component for inviting new admins
 * Includes the button UI and the associated modal functionality
 */
export default function InviteAdminButton({
  locale,
  translations,
  className = "",
  onSuccess,
}: InviteAdminButtonProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const currentLocale = useLocale();
  
  // Use provided locale or fallback to current locale from hook
  const activeLocale = locale || currentLocale;
  
  // Handle modal close
  const handleCloseModal = () => {
    setShowInviteModal(false);
  };
  
  // Handle successful invitation
  const handleInviteSuccess = () => {
    // Close modal after a delay to allow user to see success message
    setTimeout(() => {
      setShowInviteModal(false);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: refresh the page to show the new admin
        window.location.reload();
      }
    }, 2000);
  };
  
  return (
    <>
      <button
        type="button"
        className={`px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ${className}`}
        onClick={() => setShowInviteModal(true)}
      >
        {translations.inviteAdmin}
      </button>
      
      <InviteAdminModal
        show={showInviteModal}
        onClose={handleCloseModal}
        onSuccess={handleInviteSuccess}
        locale={activeLocale}
      />
    </>
  );
} 