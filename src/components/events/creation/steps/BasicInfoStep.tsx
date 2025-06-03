/**
 * BasicInfoStep
 * 
 * This component provides the first step in the event creation process,
 * collecting basic information about the event including:
 * - Event name and subtitle
 * - Event type and format
 * - Location (wilaya/daira)
 * - Contact information
 * 
 * Features:
 * - Dynamic location selection with cascading dropdowns
 * - Form validation with error messages
 * - Responsive input fields
 * - Required field indicators
 * 
 * Standardized Patterns Used:
 * - useAuth: For Supabase client access instead of direct createClient
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and RTL support
 * - Consistent error handling and loading states
 * - Type-safe form handling with react-hook-form
 */

"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import { Label, TextInput, Select } from "flowbite-react";
import { useAuth } from "@/hooks/useAuth";

import { CreateEventFormDataStatic as CreateEventFormData, eventTypeValues, eventFormatValues } from "@/lib/schemas/event";

interface BasicInfoStepProps {
  form: UseFormReturn<CreateEventFormData>;
}

interface Wilaya {
  id: number;
  name_ar: string;
  name_other: string;
}

interface Daira {
  id: number;
  wilaya_id: number;
  name_ar: string;
  name_other: string;
}

export default function BasicInfoStep({ form }: BasicInfoStepProps) {
  const t = useTranslations("Events.Creation");
  const locale = useLocale();
  const { supabase } = useAuth();
  const isRtl = locale === 'ar';
  
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [dairas, setDairas] = useState<Daira[]>([]);
  const [loadingWilayas, setLoadingWilayas] = useState(true);
  const [loadingDairas, setLoadingDairas] = useState(false);

  const { register, watch, setValue, formState: { errors } } = form;
  const selectedWilayaId = watch("wilaya_id");

  // Load wilayas on component mount
  useEffect(() => {
    const loadWilayas = async () => {
      try {
        const { data, error } = await supabase
          .from("wilayas")
          .select("id, name_ar, name_other")
          .order("id");

        if (error) throw error;
        setWilayas(data || []);
      } catch  {
      } finally {
        setLoadingWilayas(false);
      }
    };

    loadWilayas();
  }, [supabase]);

  // Load dairas when wilaya changes
  useEffect(() => {
    const loadDairas = async () => {
      if (!selectedWilayaId) {
        setDairas([]);
        setValue("daira_id", "");
        return;
      }

      setLoadingDairas(true);
      try {
        const { data, error } = await supabase
          .from("dairas")
          .select("id, wilaya_id, name_ar, name_other")
          .eq("wilaya_id", parseInt(selectedWilayaId))
          .order("id");

        if (error) throw error;
        setDairas(data || []);
        
        // Reset daira selection when wilaya changes
        setValue("daira_id", "");
      } catch  {
      } finally {
        setLoadingDairas(false);
      }
    };

    loadDairas();
  }, [selectedWilayaId, setValue, supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t("basicInfo.title")}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("basicInfo.description")}
        </p>
      </div>

      {/* Event Name (Arabic) */}
      <div>
        <Label htmlFor="event_name_ar">{t("basicInfo.eventNameAr")} <span className="text-red-500">*</span></Label>
        <TextInput
          id="event_name_ar"
          {...register("event_name_ar")}
          placeholder={t("basicInfo.eventNameArPlaceholder")}
          color={errors.event_name_ar ? "failure" : "gray"}
          dir={isRtl ? "rtl" : "ltr"}
        />
        {errors.event_name_ar && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errors.event_name_ar.message}
          </p>
        )}
      </div>

      {/* Event Subtitle (Arabic) */}
      <div>
        <Label htmlFor="event_subtitle_ar">{t("basicInfo.eventSubtitleAr")}</Label>
        <TextInput
          id="event_subtitle_ar"
          {...register("event_subtitle_ar")}
          placeholder={t("basicInfo.eventSubtitleArPlaceholder")}
          color={errors.event_subtitle_ar ? "failure" : "gray"}
          dir={isRtl ? "rtl" : "ltr"}
        />
        {errors.event_subtitle_ar && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-500">
            {errors.event_subtitle_ar.message}
          </p>
        )}
      </div>
      
      {/* Event Type */}
      <div>
        <Label htmlFor="event_type">
          {t("basicInfo.fields.eventType.label")} <span className="text-red-500">*</span>
        </Label>        <Select
          id="event_type"
          {...register("event_type")}
          color={errors.event_type ? "failure" : "gray"}
          className="w-full focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
          style={{ textAlign: isRtl ? 'right' : 'left', paddingRight: isRtl ? '2.5rem' : undefined }}
        >
          <option value="">{t("basicInfo.fields.eventType.placeholder")}</option>
          {eventTypeValues.map((type) => (
            <option key={type} value={type}>
              {t(`basicInfo.fields.eventType.options.${type}`)}
            </option>
          ))}
        </Select>
        {errors.event_type && (
          <p className="text-red-500 text-xs mt-1">{String(errors.event_type.message)}</p>
        )}
      </div>

      {/* Event Format */}
      <div>
        <Label htmlFor="format">
          {t("basicInfo.fields.eventFormat.label")} <span className="text-red-500">*</span>
        </Label>
        <Select
          id="format"
          {...register("format")}
          color={errors.format ? "failure" : "gray"}
          className="w-full focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
          style={{ textAlign: 'right', paddingRight: '2.5rem' }}
        >
          <option value="">{t("basicInfo.fields.eventFormat.placeholder")}</option>
          {eventFormatValues.map((format) => (
            <option key={format} value={format}>
              {t(`basicInfo.fields.eventFormat.options.${format}`)}
            </option>
          ))}
        </Select>
        {errors.format && (
          <p className="text-red-500 text-xs mt-1">{String(errors.format.message)}</p>
        )}
      </div>

      {/* Wilaya */}
      <div>
        <Label htmlFor="wilaya_id">
          {t("basicInfo.fields.wilaya.label")} <span className="text-red-500">*</span>
        </Label>
        <Select
          id="wilaya_id"
          {...register("wilaya_id")}
          color={errors.wilaya_id ? "failure" : "gray"}
          disabled={loadingWilayas}
          className="w-full focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
          style={{ textAlign: 'right', paddingRight: '2.5rem' }}
        >
          <option value="">
            {loadingWilayas ? t("loading.loadingLocations") : t("basicInfo.fields.wilaya.placeholder")}
          </option>
          {wilayas.map((wilaya) => (
            <option key={wilaya.id} value={wilaya.id.toString()}>
              {wilaya.name_ar}
            </option>
          ))}
        </Select>
        {errors.wilaya_id && (
          <p className="text-red-500 text-xs mt-1">{String(errors.wilaya_id.message)}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("basicInfo.fields.wilaya.description")}
        </p>
      </div>

      {/* Daira */}
      <div>
        <Label htmlFor="daira_id">
          {t("basicInfo.fields.daira.label")} <span className="text-red-500">*</span>
        </Label>
        <Select
          id="daira_id"
          {...register("daira_id")}
          color={errors.daira_id ? "failure" : "gray"}
          disabled={loadingDairas || !selectedWilayaId}
          className="w-full focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
          style={{ textAlign: 'right', paddingRight: '2.5rem' }}
        >
          <option value="">
            {loadingDairas 
              ? t("loading.loadingLocations") 
              : !selectedWilayaId 
              ? t("basicInfo.fields.wilaya.placeholder")
              : t("basicInfo.fields.daira.placeholder")
            }
          </option>
          {dairas.map((daira) => (
            <option key={daira.id} value={daira.id.toString()}>
              {daira.name_ar}
            </option>
          ))}
        </Select>
        {errors.daira_id && (
          <p className="text-red-500 text-xs mt-1">{String(errors.daira_id.message)}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("basicInfo.fields.daira.description")}
        </p>
      </div>

      {/* Contact Email */}
      <div>
        <Label htmlFor="email">
          {t("basicInfo.fields.contactEmail.label")} <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id="email"
          type="email"
          {...register("email")}
          placeholder={t("basicInfo.fields.contactEmail.placeholder")}
          color={errors.email ? "failure" : "gray"}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("basicInfo.fields.contactEmail.description")}
        </p>
      </div>

      {/* Contact Phone */}
      <div>
        <Label htmlFor="phone">
          {t("basicInfo.fields.contactPhone.label")} <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id="phone"
          {...register("phone")}
          placeholder={t("basicInfo.fields.contactPhone.placeholder")}
          color={errors.phone ? "failure" : "gray"}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{String(errors.phone.message)}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t("basicInfo.fields.contactPhone.description")}
        </p>
      </div>
    </div>
  );
}
