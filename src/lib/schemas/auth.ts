import { z } from "zod";

import type { useTranslations } from "next-intl";

const BaseLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const BaseRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  userType: z.enum(["researcher", "organizer"]),
});

export type UserType = z.infer<typeof BaseRegisterSchema>["userType"];

const BaseForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const BaseResetPasswordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
});

const BaseAdminCreateAccountSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
});

export type LoginFormData = z.infer<typeof BaseLoginSchema>;
export type RegisterFormData = z.infer<typeof BaseRegisterSchema>;
export type ForgotPasswordFormData = z.infer<typeof BaseForgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof BaseResetPasswordSchema>;
export type AdminCreateAccountFormData = z.infer<typeof BaseAdminCreateAccountSchema>;

type TFunction = ReturnType<typeof useTranslations<string>>;

/**
 * Generates the Login schema with translated error messages.
 * @param t - The translation function from `useTranslations`.
 * @returns The Zod schema for login.
 */
export const getLoginSchema = (t: TFunction) => {
  return BaseLoginSchema.extend({
    email: z.string().email({ message: t("email") }),
    password: z.string().min(1, { message: t("passwordRequired") }),
  });
};

/**
 * Generates the Register schema with translated error messages.
 * @param t - The translation function from `useTranslations` (scoped to 'Validations').
 * @returns The Zod schema for registration.
 */
export const getRegisterSchema = (t: TFunction) => {
  const schema = BaseRegisterSchema.extend({
    email: z.string().email({ message: t("email") }),
    password: z.string().min(6, { message: t("passwordMinLength") }),
    confirmPassword: z.string(),
    userType: z.enum(["researcher", "organizer"], {
      required_error: t("userTypeRequired"),
      invalid_type_error: t("userTypeRequired"),
    }),
  });

  return schema.refine(
    (data: RegisterFormData) => data.password === data.confirmPassword,
    {
      message: t("passwordsDontMatch"),
      path: ["confirmPassword"],
    }
  );
};

/**
 * Generates the Forgot Password schema with translated error messages.
 * @param t - The translation function from `useTranslations` (scoped to 'Validations').
 * @returns The Zod schema for forgot password.
 */
export const getForgotPasswordSchema = (t: TFunction) => {
  return BaseForgotPasswordSchema.extend({
    email: z.string().email({ message: t("email") }),
  });
};

/**
 * Generates the Reset Password schema with translated error messages.
 * @param t - The translation function from `useTranslations` (scoped to 'Validations').
 * @returns The Zod schema for reset password.
 */
export const getResetPasswordSchema = (t: TFunction) => {
  const schema = BaseResetPasswordSchema.extend({
    password: z.string().min(8, { message: t("passwordMinLength") }),
    confirmPassword: z.string(),
  });

  return schema.refine(
    (data: ResetPasswordFormData) => data.password === data.confirmPassword,
    {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    }
  );
};

/**
 * Generates the Admin Create Account schema with translated error messages.
 * Used for admin invite flow where admins set their initial password.
 * @param t - The translation function from `useTranslations` (scoped to 'Validations').
 * @returns The Zod schema for admin account creation.
 */
export const getAdminCreateAccountSchema = (t: TFunction) => {
  const schema = BaseAdminCreateAccountSchema.extend({
    password: z.string().min(8, { message: t("passwordMinLength") }),
    confirmPassword: z.string(),
  });

  return schema.refine(
    (data: AdminCreateAccountFormData) => data.password === data.confirmPassword,
    {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    }
  );
};

