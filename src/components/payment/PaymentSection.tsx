/**
 * PaymentSection
 * 
 * This component provides a tabbed interface for managing payment-related activities.
 * It allows users to view payment history and report new payments.
 * 
 * Features:
 * - Tab navigation between payment history and payment reporting
 * - Payment history display
 * - Payment reporting form
 * - Integration with application settings
 * 
 * Standardized Patterns Used:
 * - useTranslations: Custom hook for internationalization
 */

'use client';

import { useState } from 'react';
import { Card, Button } from 'flowbite-react';
import useTranslations from '@/hooks/useTranslations';
import useLocale from '@/hooks/useLocale';
import PaymentHistoryDisplay from './PaymentHistoryDisplay';
import ReportPaymentForm from './ReportPaymentForm';
import type { AppSettings } from '@/lib/appConfig';

interface PaymentSectionProps {
  userId: string;
  appSettings: AppSettings | null;
  userType: 'researcher' | 'organizer';
  locale?: string; // Made optional for backward compatibility
}

export default function PaymentSection({
  userId,
  appSettings,
  userType,
  locale // Kept for backward compatibility
}: PaymentSectionProps) {
  const t = useTranslations('PaymentSection');
  const actualLocale = useLocale();
  const [activeView, setActiveView] = useState<'history' | 'report'>('history');

  return (
    <Card className="shadow-md lg:col-span-3">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('title')}</h2>
          <div className="flex space-x-2">
            <Button 
              size="sm"
              color={activeView === 'history' ? 'primary' : 'light'}
              onClick={() => setActiveView('history')}
            >
              {t('tabs.history')}
            </Button>
            <Button
              size="sm"
              color={activeView === 'report' ? 'primary' : 'light'}
              onClick={() => setActiveView('report')}
            >
              {t('tabs.report')}
            </Button>
          </div>
        </div>
        
        {activeView === 'history' ? (
          <PaymentHistoryDisplay 
            userId={userId} 
            locale={actualLocale || locale}
            onReportPayment={() => setActiveView('report')}
          />
        ) : (
          <ReportPaymentForm 
            appSettings={appSettings} 
            userType={userType}
            onSuccess={() => setActiveView('history')}
            locale={actualLocale || locale}
          />
        )}
      </div>
    </Card>
  );
} 