/**
 * ReportPaymentForm
 * 
 * This component provides a form for users to report payments.
 * It implements a multi-step process for payment reporting and document upload.
 * 
 * Features:
 * - Two-step process: form entry and document upload
 * - Form validation with Zod
 * - Integration with app settings
 * - Payment method selection
 * - Detailed payment information display
 * - Support for different user types
 * - Full RTL support
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 * - useLocale: For locale-aware formatting and rendering
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import { Button, Label, TextInput, Select, Textarea, Alert } from 'flowbite-react';
import { z } from 'zod';
import PaymentProofUpload from './PaymentProofUpload';
import { HiInformationCircle } from 'react-icons/hi';
import type { AppSettings } from '@/lib/appConfig';

interface ReportPaymentFormProps {
  appSettings?: AppSettings | null;
  userType?: 'researcher' | 'organizer';
  selectedPlan?: {
    tier: 'researcher' | 'organizer';
    period: 'monthly' | 'quarterly' | 'biannual' | 'annual';
    amount: number;
  } | null;
  onSuccess?: () => void;
  locale?: string; // Kept for backward compatibility
}

// Form type will be generated from Zod schema
type PaymentFormData = {
  amount: number;
  billing_period: 'monthly' | 'quarterly' | 'biannual' | 'annual';
  payment_method: 'bank' | 'check' | 'cash' | 'online';
  reference_number?: string;
  notes?: string;
};

// Payment data type for the upload step
type PaymentUploadData = {
  amount: number;
  billing_period: string;
  payment_method_reported: string;
  reference_number?: string;
  payer_notes?: string;
};

export default function ReportPaymentForm({
  selectedPlan,
  onSuccess,
  locale
}: ReportPaymentFormProps) {
  const t = useTranslations('PaymentSection.ReportPayment');
  const tCommon = useTranslations('Common');
  const defaultLocale = useLocale();
  const currentLocale = locale || defaultLocale;
  const isRtl = currentLocale === 'ar';
  
  const [step, setStep] = useState<'form' | 'upload'>(selectedPlan ? 'upload' : 'form');
  const [paymentData, setPaymentData] = useState<PaymentUploadData | null>(selectedPlan ? {
    amount: selectedPlan.amount,
    billing_period: selectedPlan.period,
    payment_method_reported: 'bank', // Default to bank transfer
    reference_number: undefined,
    payer_notes: undefined
  } : null);
  
  // Create form schema with validation
  const getPaymentFormSchema = () => {
    return z.object({
      amount: z.coerce.number().positive({ message: t('errors.amountPositive') }),
      billing_period: z.enum(['monthly', 'quarterly', 'biannual', 'annual']),
      payment_method: z.enum(['bank', 'check', 'cash', 'online']),
      reference_number: z.string().optional(),
      notes: z.string().max(500, { message: t('errors.notesTooLong') }).optional(),
    });
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PaymentFormData>({
    resolver: zodResolver(getPaymentFormSchema()),
    defaultValues: selectedPlan ? {
      amount: selectedPlan.amount,
      billing_period: selectedPlan.period as 'monthly' | 'quarterly' | 'biannual' | 'annual',
      payment_method: 'bank', // Default
    } : {
      payment_method: 'bank',
    }
  });

  const onSubmit = (data: PaymentFormData) => {
    // Format payment data and move to upload step
    setPaymentData({
      amount: data.amount,
      billing_period: data.billing_period,
      payment_method_reported: data.payment_method,
      reference_number: data.reference_number,
      payer_notes: data.notes,
    });
    setStep('upload');
  };

  const handleUploadSuccess = () => {
    if (onSuccess) onSuccess();
  };

  // Render appropriate step (form or upload)
  if (step === 'form') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Amount Field */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="amount">{t('amountLabel')}</Label>
            </div>
            <TextInput
              id="amount"
              type="number"
              placeholder={t('amountPlaceholder')}
              {...register('amount')}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Billing Period Field */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="billing_period">{t('billingPeriodLabel')}</Label>
            </div>
            <Select
              id="billing_period"
              {...register('billing_period')}
              dir={isRtl ? 'rtl' : 'ltr'}
              style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
            >
              <option value="monthly">{tCommon('billing_period_enum.monthly')}</option>
              <option value="quarterly">{tCommon('billing_period_enum.quarterly')}</option>
              <option value="biannual">{tCommon('billing_period_enum.biannual')}</option>
              <option value="annual">{tCommon('billing_period_enum.annual')}</option>
            </Select>
            {errors.billing_period && (
              <p className="mt-1 text-sm text-red-600">{errors.billing_period.message}</p>
            )}
          </div>

          {/* Payment Method Field */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="payment_method">{t('paymentMethodLabel')}</Label>
            </div>
            <Select
              id="payment_method"
              {...register('payment_method')}
              dir={isRtl ? 'rtl' : 'ltr'}
              style={isRtl ? { textAlign: 'right', paddingRight: '2.5rem' } : {}}
            >
              <option value="bank">{tCommon('payment_method_enum.bank')}</option>
              <option value="check">{tCommon('payment_method_enum.check')}</option>
              <option value="cash">{tCommon('payment_method_enum.cash')}</option>
              <option value="online">{tCommon('payment_method_enum.online')}</option>
            </Select>
            {errors.payment_method && (
              <p className="mt-1 text-sm text-red-600">{errors.payment_method.message}</p>
            )}
          </div>

          {/* Reference Number Field (Optional) */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="reference_number">{t('referenceNumberLabel')}</Label>
            </div>
            <TextInput
              id="reference_number"
              placeholder={t('referenceNumberPlaceholder')}
              {...register('reference_number')}
            />
            {errors.reference_number && (
              <p className="mt-1 text-sm text-red-600">{errors.reference_number.message}</p>
            )}
          </div>

          {/* Notes Field (Optional) */}
          <div>
            <div className="mb-2 block">
              <Label htmlFor="notes">{t('notesLabel')}</Label>
            </div>
            <Textarea
              id="notes"
              placeholder={t('notesPlaceholder')}
              rows={3}
              {...register('notes')}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('submitting') : t('continueButton')}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Upload step
  if (!paymentData) {
    // Handle unexpected state where paymentData is null
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <Alert color="failure">
          <span>{t('errors.missingPaymentData')}</span>
        </Alert>
        <div className="mt-4">
          <Button color="light" onClick={() => setStep('form')}>
            {t('backToForm')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <h4 className="font-medium mb-2">{t('paymentDetails')}</h4>
        <ul className="space-y-1 text-sm">
          <li><strong>{t('amount')}:</strong> {paymentData.amount} {t('currency')}</li>
          <li><strong>{t('billingPeriod')}:</strong> {tCommon(`billing_period_enum.${paymentData.billing_period}`)}</li>
          <li><strong>{t('paymentMethod')}:</strong> {tCommon(`payment_method_enum.${paymentData.payment_method_reported}`)}</li>
          {paymentData.reference_number && (
            <li><strong>{t('referenceNumber')}:</strong> {paymentData.reference_number}</li>
          )}
        </ul>
      </div>
      
      <Alert color="info" icon={HiInformationCircle} className="mb-4">
        <span>{t('uploadInstructions')}</span>
      </Alert>
      
      <PaymentProofUpload 
        paymentData={paymentData}
        onUploadSuccess={handleUploadSuccess}
        locale={currentLocale}
      />
      
      <div className="mt-4 flex justify-start">
        <Button color="light" onClick={() => setStep('form')}>
          {t('backToForm')}
        </Button>
      </div>
    </div>
  );
} 