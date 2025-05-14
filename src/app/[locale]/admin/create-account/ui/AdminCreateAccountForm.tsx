"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button, Label, TextInput, Alert, Spinner } from "flowbite-react";
import {
  HiInformationCircle,
  HiEye,
  HiEyeOff,
  HiOutlineUser,
  HiOutlineMail,
  HiCheckCircle,
} from "react-icons/hi";
import { toast } from "react-hot-toast";

// Define Zod schema for the form
const getAdminCreateAccountSchema = (
  tValidation: ReturnType<typeof useTranslations>
) =>
  z
    .object({
      // fullName: z.string().min(3, tValidation("minLength", { min: 3 })),
      password: z.string().min(8, tValidation("passwordMinLength")),
      confirmPassword: z.string().min(8, tValidation("passwordMinLength")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: tValidation("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

type AdminCreateAccountFormData = z.infer<
  ReturnType<typeof getAdminCreateAccountSchema>
>;

export default function AdminCreateAccountForm() {
  const t = useTranslations("AdminAuth.CreateAccountForm");
  const tValidation = useTranslations("Validations");
  const tAria = useTranslations("AriaLabels");
  const tCommon = useTranslations("Common");

  const { supabase, user } = useAuth();
  const router = useRouter();
  const [isCheckingInvite, setIsCheckingInvite] = useState(true);
  const [isInviteValid, setIsInviteValid] = useState<boolean | null>(null); // null: undecided, true: valid, false: invalid
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userFullName, setUserFullName] = useState<string | undefined>(
    undefined
  );
  const [formError, setFormError] = useState<string | null>(null); // For submission errors
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submissionCompletedSuccessfully, setSubmissionCompletedSuccessfully] =
    useState(false);

  useEffect(() => {
    let toastId: string | undefined;

    const processAuthState = (sessionUser: typeof user | null | undefined) => {
      // If submission was successful, we are in a sign-out phase, don't show new invite errors.
      if (submissionCompletedSuccessfully) {
        setIsCheckingInvite(false);
        return;
      }

      if (!sessionUser && !window.location.hash.includes("access_token")) {
        setIsInviteValid(false);
        // Only show this toast if there isn't a more specific form error already displayed
        // and if the submission process hasn't already started showing its own toasts.
        if (!formError) { 
          toastId = toast.error(t("invalidInviteNoUser"), {
            duration: 6000, // Longer duration for important initial error
            id: "invalid-invite-toast",
          });
        }
      } else if (sessionUser) {
        setIsInviteValid(true);
        setUserEmail(sessionUser.email);
        setUserFullName(sessionUser.user_metadata?.full_name);
        // If a user session IS established, it means the invite token was likely valid.
        // We can dismiss any lingering generic invite error toast if one was somehow shown.
        toast.dismiss("invalid-invite-toast");
      } else {
        // Still waiting or in an indeterminate state (e.g. token in hash but session not yet fully processed)
        // We don't set isInviteValid yet, wait for onAuthStateChange or fallback.
      }
      setIsCheckingInvite(false);
    };

    processAuthState(user); // Check initial user state from AuthProvider

    const { data: authListenerData } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "INITIAL_SESSION" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ) {
          processAuthState(session?.user);
        } else if (event === "SIGNED_OUT") {
          processAuthState(null);
        }
        // No need to call setIsCheckingInvite(false) here again as processAuthState does it
      }
    );

    const fallbackTimeout = setTimeout(() => {
      if (isCheckingInvite && isInviteValid === null) {
        // Only run fallback if still checking and undecided
        supabase.auth.getSession().then(({ data: { session } }) => {
          processAuthState(session?.user);
        });
      }
    }, 2000); // Slightly longer fallback, gives onAuthStateChange more time

    return () => {
      authListenerData.subscription?.unsubscribe();
      clearTimeout(fallbackTimeout);
      if (toastId) toast.dismiss(toastId); // Clean up specific toast on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, t, submissionCompletedSuccessfully, formError]); // Added submissionCompletedSuccessfully and formError

  const adminCreateAccountSchema = getAdminCreateAccountSchema(tValidation);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AdminCreateAccountFormData>({
    resolver: zodResolver(adminCreateAccountSchema),
    defaultValues: {
      // fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // user object might change, ensure email and name are updated
    if (user) {
      setUserEmail(user.email);
      setUserFullName(user.user_metadata?.full_name);
    }
  }, [user]);

  const onSubmit = async (data: AdminCreateAccountFormData) => {
    if (!user || !isInviteValid) {
      // Also check isInviteValid here
      setFormError(t("userNotAuthenticatedError")); // Or a more specific invite error
      toast.error(t("userNotAuthenticatedError"));
      return;
    }

    // Retrieve full_name from user_metadata before other operations
    const currentFullNameFromAuthUser = user?.user_metadata?.full_name;

    if (!currentFullNameFromAuthUser) {
      // This case should ideally not happen if invite sets the name
      setFormError(t("missingNameError"));
      toast.error(t("missingNameError")); // Note: submissionToastId is not yet created here
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    const submissionToastId = toast.loading(t("submitting"));

    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (passwordError) {
        setFormError(passwordError.message);
        toast.error(`${t("passwordUpdateFailed")}: ${passwordError.message}`, {
          id: submissionToastId,
        });
        return;
      }

      // Use the pre-fetched currentFullNameFromAuthUser for subsequent operations
      const { data: existingAdminProfile, error: fetchError } = await supabase
        .from("admin_profiles")
        .select("profile_id")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        setFormError(fetchError.message);
        toast.error(`${t("profileUpdateFailed")}: ${fetchError.message}`, {
          id: submissionToastId,
        });
        return;
      }

      const adminProfilePayload = {
        profile_id: user.id,
        name: currentFullNameFromAuthUser,
      };
      let profileMutationError;

      if (existingAdminProfile) {
        const { error } = await supabase
          .from("admin_profiles")
          .update({
            name: currentFullNameFromAuthUser,
            updated_at: new Date().toISOString(),
          })
          .eq("profile_id", user.id);
        profileMutationError = error;
      } else {
        const { error } = await supabase
          .from("admin_profiles")
          .insert(adminProfilePayload);
        profileMutationError = error;
      }

      if (profileMutationError) {
        setFormError(profileMutationError.message);
        toast.error(
          `${t("profileUpdateFailed")}: ${profileMutationError.message}`,
          { id: submissionToastId }
        );
        return;
      }

      const { error: generalProfileError } = await supabase
        .from("profiles")
        .update({
          is_extended_profile_complete: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (generalProfileError) {
        toast.error(
          `${t("generalProfileUpdateFailedWarning")}: ${
            generalProfileError.message
          }`,
          { duration: 5000 }
        );
      }

      await supabase.auth.signOut();
      setFormSuccess(t("accountSetupSuccess"));
      toast.success(t("accountSetupSuccessToast"), { id: submissionToastId });
      setSubmissionCompletedSuccessfully(true); // Set submission success state

      // Note: Unlike regular redirect patterns, admins must explicitly sign in after initial setup
      // This ensures they're aware of their credentials and the session is fresh
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("unexpectedError");
      setFormError(message);
      toast.error(`${t("submissionFailed")}: ${message}`, {
        id: submissionToastId,
      });
    } finally {
      // setIsLoading(false); // isSubmitting handles this
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  if (submissionCompletedSuccessfully) {
    return (
      <div className="text-center py-8">
        <HiCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold mb-2">
          {t("accountSetupSuccessTitle")}
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {t("accountSetupSuccessBody")}
        </p>
        <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <Spinner size="sm" className="mr-3" />
          {tCommon("redirectingToLogin")}
        </div>
      </div>
    );
  }

  if (isCheckingInvite) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner aria-label={tAria("loading")} size="xl" />
        <p className="ml-4 text-lg text-gray-600 dark:text-gray-400">
          {t("verifyingInvite")}
        </p>
      </div>
    );
  }

  if (!isInviteValid) {
    // Covers null and false
    return (
      <Alert color="failure" icon={HiInformationCircle} className="mb-6">
        <span className="font-medium">{t("errorAlertTitle")}</span>{" "}
        {t("invalidOrExpiredInvite")}
      </Alert>
    );
  }

  if (!user) {
    // Should be caught by isInviteValid, but as a safeguard
    return (
      <Alert color="failure" icon={HiInformationCircle} className="mb-6">
        <span className="font-medium">{t("errorAlertTitle")}</span>{" "}
        {t("sessionExpiredUserNotFound")}
      </Alert>
    );
  }

  return (
    <div className="mt-8 w-full max-w-md space-y-6 rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 sm:p-8">
      <h1 className="text-center text-2xl font-bold text-foreground">
        {t("title")}
      </h1>
      {isCheckingInvite ? (
        <div className="flex justify-center py-8">
          <Spinner aria-label={tAria("loading")} size="xl" />
        </div>
      ) : !isInviteValid && !submissionCompletedSuccessfully ? (
        <Alert
          color="failure"
          icon={HiInformationCircle}
          className="mb-4 p-4"
          title={t("invalidInviteTitle")}
        >
          {t("invalidInviteMessage")}
        </Alert>
      ) : formSuccess && submissionCompletedSuccessfully ? (
        <div className="text-center py-8">
          <HiCheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="text-xl font-semibold mb-2">
            {t("accountSetupSuccessTitle")}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {t("accountSetupSuccessBody")}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <Spinner size="sm" className="mr-3" />
            {tCommon("redirectingToLogin")}
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {formError && !submissionCompletedSuccessfully && (
            <Alert color="failure" icon={HiInformationCircle} className="mb-2">
              <span className="font-medium">{t("setupFailed")}!</span>{" "}
              {formError}
            </Alert>
          )}

          {/* Full Name (Read-only) */}
          <div>
            <Label htmlFor="fullName">{t("fullNameLabel")}</Label>
            <TextInput
              id="fullName"
              type="text"
              icon={HiOutlineUser}
              value={userFullName || ""}
              color="gray"
              disabled
              className="mt-1"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <TextInput
              id="email"
              type="email"
              icon={HiOutlineMail}
              value={userEmail || ""}
              color="gray"
              disabled
              className="mt-1"
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <div className="relative mt-1">
              <TextInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                {...register("password")}
                color={errors.password ? "failure" : "gray"}
                required
                className="mt-1"
                disabled={isSubmitting || !!formSuccess || !user}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword ? tAria("hidePassword") : tAria("showPassword")
                }
                disabled={isSubmitting || !!formSuccess || !user}
              >
                {showPassword ? (
                  <HiEyeOff className="h-5 w-5" />
                ) : (
                  <HiEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-2 text-sm text-red-600 dark:text-red-500"
              >
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
            <div className="relative mt-1">
              <TextInput
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                {...register("confirmPassword")}
                color={errors.confirmPassword ? "failure" : "gray"}
                required
                className="mt-1"
                disabled={isSubmitting || !!formSuccess || !user}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirmPassword
                    ? tAria("hidePassword")
                    : tAria("showPassword")
                }
                disabled={isSubmitting || !!formSuccess || !user}
              >
                {showConfirmPassword ? (
                  <HiEyeOff className="h-5 w-5" />
                ) : (
                  <HiEye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="mt-2 text-sm text-red-600 dark:text-red-500"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              !isDirty ||
              !isInviteValid ||
              submissionCompletedSuccessfully
            }
            className="mt-2 w-full"
            size="md"
          >
            {isSubmitting ? (
              <>
                <Spinner aria-label={tAria("submitting")} size="sm" />
                <span className="pl-3">{t("submitting")}</span>
              </>
            ) : (
              t("submitButton")
            )}
          </Button>

          {!submissionCompletedSuccessfully && isInviteValid && (
            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              {t("termsHint")}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
