import { z } from "zod";
import type { useTranslations } from "next-intl";

type TFunction = ReturnType<typeof useTranslations<string>>;

/**
 * Creates a Zod schema for topic form validation
 * 
 * @param t Translation function from next-intl
 * @returns A Zod schema for topic form validation
 */
export const getTopicSchema = (t: TFunction) => {
  return z.object({
    name_translations: z.object({
      ar: z.string()
        .min(3, t('nameArMinLength'))
        .trim()
        .nonempty(t('nameArRequired')),
      en: z.string().trim().optional(),
      fr: z.string().trim().optional(),
    }),
    // Slug is auto-generated and shown as read-only in the UI
    // It's not part of the form data the user can edit
    slug: z.string().optional(),
  });
};

export type TopicFormData = z.infer<ReturnType<typeof getTopicSchema>>;

/**
 * Arabic character transliteration map
 * Maps Arabic characters to their Latin equivalents for URL-friendly slugs
 */
const arabicToLatinMap: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a',
  'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'th', 'ر': 'r',
  'ز': 'z', 'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd', 'ط': 't',
  'ظ': 'z', 'ع': 'a', 'غ': 'gh',
  'ف': 'f', 'ق': 'q', 'ك': 'k',
  'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
  'ة': 'a', 'ء': '', 'ؤ': 'o', 'ئ': 'e'
};

/**
 * Transliterates Arabic text to Latin characters
 * 
 * @param text Arabic text to transliterate
 * @returns Transliterated text using Latin characters
 */
const transliterateArabic = (text: string): string => {
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += arabicToLatinMap[char] || char;
  }
  
  return result;
};

/**
 * Generates a slug from Arabic text
 * Converts Arabic text to a URL-friendly string
 * 
 * @param text Arabic text to convert to slug
 * @param useTransliteration Whether to transliterate Arabic characters (default: false)
 * @returns A URL-friendly slug string
 */
export const generateSlug = (text: string, useTransliteration = false): string => {
  if (!text) return "";
  
  // Trim and normalize spaces
  const trimmed = text.trim().replace(/\s+/g, ' ');
  
  // Apply transliteration if enabled
  const processedText = useTransliteration ? transliterateArabic(trimmed) : trimmed;
  
  // Remove special characters, keeping Arabic Unicode ranges if not transliterating
  const alphanumeric = processedText.replace(/[^\p{L}\p{N}\s-]/gu, '');
  
  // Replace spaces with hyphens and convert to lowercase
  const slug = alphanumeric.replace(/\s/g, '-').toLowerCase();
  
  // Ensure no consecutive hyphens and trim hyphens from start/end
  return slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
}; 