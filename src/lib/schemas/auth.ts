import { z } from 'zod';
// Correct the import: useTranslations (hook) is not the type, need the ReturnType
import type { useTranslations } from 'next-intl';

// --- Base Schemas (for type inference) ---
const BaseLoginSchema = z.object({
  email: z.string().email(), // Message added dynamically
  password: z.string().min(1) // Message added dynamically
});

const BaseRegisterSchema = z.object({
  email: z.string().email(), // Message added dynamically
  password: z.string().min(6), // Message added dynamically
  confirmPassword: z.string(),
  userType: z.enum(['researcher', 'organizer']) // Add userType enum
}); // Removed refine here, apply after extend

// --- Exported Types ---
export type LoginFormData = z.infer<typeof BaseLoginSchema>;
export type RegisterFormData = z.infer<typeof BaseRegisterSchema>;

// --- Schema Generator Functions ---

// Type for the translation function `t`
type TFunction = ReturnType<typeof useTranslations<string>>; // Get ReturnType of the hook

/**
 * Generates the Login schema with translated error messages.
 * @param t - The translation function from `useTranslations`.
 * @returns The Zod schema for login.
 */
export const getLoginSchema = (t: TFunction) => {
  return BaseLoginSchema.extend({
    email: z.string().email({ message: t('email') }),
    password: z.string().min(1, { message: t('passwordRequired') })
  });
};

/**
 * Generates the Register schema with translated error messages.
 * @param t - The translation function from `useTranslations` (scoped to 'Validations').
 * @returns The Zod schema for registration.
 */
export const getRegisterSchema = (t: TFunction) => {
  // Define the schema with fields first, then refine
  const schema = BaseRegisterSchema
    .extend({
      email: z.string().email({ message: t('email') }),
      password: z.string().min(6, { message: t('passwordMinLength') }),
      confirmPassword: z.string(),
      userType: z.enum(['researcher', 'organizer'], {
        required_error: t('userTypeRequired'),
        invalid_type_error: t('userTypeRequired')
      })
    })

  // Apply refine to the extended schema
  return schema.refine((data: RegisterFormData) => data.password === data.confirmPassword, {
      message: t('passwordsDontMatch'),
      path: ["confirmPassword"], // Attach error to confirmPassword field
    });
};
