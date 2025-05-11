'use client';

import { useTranslations } from 'next-intl';
import { List, Modal, Button, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react';
import type { AppSettings } from '@/lib/appConfig';

interface PaymentInstructionsDisplayProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appSettings: AppSettings | null;
  selectedPlan?: { tier: 'researcher' | 'organizer', period: 'monthly' | 'quarterly' | 'biannual' | 'annual', amount: number } | null;
}

export default function PaymentInstructionsDisplay({ isOpen, setIsOpen, appSettings, selectedPlan }: PaymentInstructionsDisplayProps) {
  const tPayment = useTranslations('PaymentInstructions');
  const tCommon = useTranslations('Common');

  const paymentEmail = appSettings?.payment_email;

  const notAvailable = tPayment('infoNotAvailable');

  return (
    <Modal show={isOpen} onClose={() => setIsOpen(false)} size="2xl">
      <ModalHeader>{tPayment('title')}</ModalHeader>
      <ModalBody>
        <div className="space-y-6">
          {selectedPlan && (
            <div className="p-3 mb-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {tPayment('selectedPlanNotification')}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-200">
                <strong>{tPayment('planTierLabel')}:</strong> {selectedPlan.tier === 'researcher' ? tPayment('researcherTier') : tPayment('organizerTier')}<br />
                <strong>{tPayment('planPeriodLabel')}:</strong> {tPayment(`BillingPeriods.${selectedPlan.period}`)}<br />
                <strong>{tPayment('planAmountLabel')}:</strong> {selectedPlan.amount} {tPayment('currencySymbol')}
              </p>
            </div>
          )}
          <p className="font-normal text-gray-700 dark:text-gray-400">
            {tPayment('intro')}
          </p>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {tPayment('bankTransferTitle')}
            </h3>
            <List unstyled className="space-y-2 text-gray-700 dark:text-gray-400">
              <li>
                <strong>{tPayment('bankNameLabel')}</strong> {appSettings?.bank_name || notAvailable}
              </li>
              <li>
                <strong>{tPayment('accountHolderLabel')}</strong> {appSettings?.account_holder || notAvailable}
              </li>
              <li>
                <strong>{tPayment('accountNumberLabel')}</strong> {appSettings?.account_number_rib || notAvailable}
              </li>
              <li>
                <strong>{tPayment('paymentReferenceLabel')}</strong> {tPayment('paymentReferenceValue')}
              </li>
            </List>
          </div>

          {/* Remove this entire div for cash payment */}
          {/* 
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {tPayment('cashPaymentTitle')}
            </h3>
            <p className="text-gray-700 dark:text-gray-400">
              {appSettings?.cash_payment_office_address || notAvailable}
            </p>
          </div>
          */}
          
          {paymentEmail && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {tPayment('importantNoteTitle')}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {tPayment.rich('importantNoteValue', {
                  emailLink: (chunks) => (
                    <a href={`mailto:${paymentEmail}`} className="text-cyan-600 hover:underline dark:text-cyan-500">
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {tPayment('contactSupport')}
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => setIsOpen(false)} color="gray">
          {tCommon('closeButton')}
        </Button>
      </ModalFooter>
    </Modal>
  );
} 