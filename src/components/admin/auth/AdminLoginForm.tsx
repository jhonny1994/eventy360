"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import {
  HiInformationCircle,
  HiMail,
  HiKey,
  HiEye,
  HiEyeOff,
} from "react-icons/hi";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { getLoginSchema, handleAdminLogin } from "@/utils/admin/auth-forms";

type LoginFormValues = {
  email: string;
  password: string;
};

interface AdminLoginFormProps {
  redirectPath?: string;
}

/**
 * Standardized admin login form component with validation and error handling
 */
export default function AdminLoginForm({ redirectPath }: AdminLoginFormProps) {
  const router = useRouter();
  const tCommon = useTranslations("Common");
  const tValidations = useTranslations("Validations");
  const tLogin = useTranslations("AdminAuth.LoginForm");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Create a translation function with the specific signature expected by getLoginSchema
  const validationTranslator = (
    key: string,
    values?: Record<string, unknown>
  ) => {
    return tValidations(key, values as Record<string, string | number | Date>);
  };

  const loginSchema = getLoginSchema(validationTranslator);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const { success, error } = await handleAdminLogin(
        data.email,
        data.password,
        (key: string) => tCommon(key)
      );

      if (!success && error) {
        setAuthError(error);
        setIsSubmitting(false);
        return;
      }

      // Redirect based on provided path or URL parameter
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        // Default redirect to dashboard
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setAuthError(tLogin("unexpectedError"));
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {authError && (
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">{tLogin("loginFailed")}</span> {authError}
        </Alert>
      )}

      <div>
        <div className="mb-2 block">
          <Label htmlFor="email">{tLogin("emailLabel")}</Label>
        </div>
        <TextInput
          id="email"
          icon={HiMail}
          placeholder={tLogin("emailPlaceholder")}
          {...register("email")}
          color={errors.email ? "failure" : "gray"}
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="mb-2 block">
          <Label htmlFor="password">{tLogin("passwordLabel")}</Label>
        </div>
        <div className="relative">
          <TextInput
            id="password"
            type={showPassword ? "text" : "password"}
            icon={HiKey}
            placeholder={tLogin("passwordPlaceholder")}
            {...register("password")}
            color={errors.password ? "failure" : "gray"}
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute top-0 bottom-0 end-0 flex items-center px-3 text-gray-500"
            tabIndex={-1}
            aria-label={
              showPassword ? tLogin("hidePassword") : tLogin("showPassword")
            }
          >
            {showPassword ? (
              <HiEyeOff className="h-5 w-5" />
            ) : (
              <HiEye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        color="primary"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? tLogin("loading") : tLogin("submitButton")}
      </Button>
    </form>
  );
}
