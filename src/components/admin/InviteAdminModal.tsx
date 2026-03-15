"use client";

import { useState } from "react";
import {
  Button,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
} from "flowbite-react";
import { HiOutlineMail, HiOutlineUserCircle } from "react-icons/hi";
import useTranslations from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import useLocale from "@/hooks/useLocale";

type InviteAdminModalProps = {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  locale?: string; // Make locale optional since we can get it from hook
};

/**
 * Modal component for inviting new admin users
 * Includes form with email and name fields
 * Handles validation and submission to invite-admin edge function
 */
export default function InviteAdminModal({
  show,
  onClose,
  onSuccess,
  locale,
}: InviteAdminModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations("AdminAdmins.inviteModal");
  const currentLocale = useLocale(); // Get current locale from hook

  // Use provided locale or fallback to current locale from hook
  const activeLocale = locale || currentLocale;
  const isRtl = activeLocale === "ar";

  // Get auth context
  const { session } = useAuth();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const resetForm = () => {
    setEmail("");
    setName("");
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!email || !name) {
      setError(t("errors.allFieldsRequired"));
      return;
    }

    if (!emailRegex.test(email)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    // Check if user is authenticated
    if (!session?.access_token) {
      setError("Authentication required");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Get the Supabase URL and function name
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("Supabase URL not configured");
      }

      // Call the invite-admin edge function with auth token
      const functionUrl = `${supabaseUrl}/functions/v1/invite-admin`;
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          invitedUserEmail: email,
          invitedUserName: name,
          roleName: "admin",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t("errors.inviteFailed"));
      }

      // Success
      setSuccess(true);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.inviteFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onClose={handleClose} dismissible position="center">
      <ModalHeader className={isRtl ? "text-right" : ""}>
        {t("title")}
      </ModalHeader>
      <ModalBody>
        {success ? (
          <div className="text-center p-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              {t("success.title")}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("success.message")}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="email"
                  className={isRtl ? "text-right block" : ""}
                >
                  {t("form.emailLabel")}
                </Label>
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={HiOutlineMail}
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="name"
                  className={isRtl ? "text-right block" : ""}
                >
                  {t("form.nameLabel")}
                </Label>
              </div>
              <TextInput
                id="name"
                type="text"
                placeholder={t("form.namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={HiOutlineUserCircle}
                required
              />
            </div>
          </form>
        )}
      </ModalBody>
      <ModalFooter>
        {!success && (
          <div
            className={`w-full flex ${isRtl ? "flex-row-reverse" : ""} gap-2`}
          >
            <Button
              color="blue"
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("form.sending") : t("form.send")}
            </Button>
            <Button color="gray" onClick={handleClose}>
              {t("form.cancel")}
            </Button>
          </div>
        )}
      </ModalFooter>
    </Modal>
  );
}
