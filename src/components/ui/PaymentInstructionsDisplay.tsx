'use client';

import { useTranslations } from 'next-intl';
import { List, Modal, Button, ModalHeader, ModalBody, ModalFooter, Alert } from 'flowbite-react';
import { HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';
import type { AppSettings } from '@/lib/appConfig';

interface PaymentInstructionsDisplayProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  appSettings: AppSettings | null;
  selectedPlan?: { tier: 'researcher' | 'organizer', period: 'monthly' | 'quarterly' | 'biannual' | 'annual', amount: number } | null;
  locale?: string;
  userId?: string;
}

export default function PaymentInstructionsDisplay({ 
  isOpen, 
  setIsOpen, 
  appSettings, 
  selectedPlan,
  userId
}: PaymentInstructionsDisplayProps) {
  const tPayment = useTranslations('PaymentInstructions');
  const tCommon = useTranslations('Common');

  const paymentEmail = appSettings?.payment_email;
  const notAvailable = tPayment('infoNotAvailable');

  return (
    <Modal show={isOpen} onClose={() => setIsOpen(false)} size="3xl">
      <ModalHeader>{tPayment('title')}</ModalHeader>
      <ModalBody>
        <div className="space-y-6 rtl:text-right ltr:text-left">
          {selectedPlan && (
            <div className="p-4 mb-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
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

          <Alert color="info" icon={HiInformationCircle}>
            <h4 className="font-medium">معلومات مهمة عن عملية التحقق من المدفوعات</h4>
            <div className="mt-1 text-sm">
              بعد إتمام عملية الدفع وتحميل إثبات الدفع، سيقوم فريق الإدارة بمراجعة الدفعة في غضون 1-2 يوم عمل. ستظهر حالة الدفع في سجل المدفوعات الخاص بك.
            </div>
          </Alert>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {tPayment('bankTransferTitle')}
            </h3>
            <List unstyled className="space-y-3 text-gray-700 dark:text-gray-400">
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
            
            <div className="mt-4 bg-blue-50 dark:bg-gray-700 p-3 rounded border border-blue-100 dark:border-gray-600">
              <h4 className="font-medium text-blue-800 dark:text-blue-300">إرشادات مهمة للتحويل البنكي:</h4>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-blue-700 dark:text-blue-200">
                <li>تأكد من إضافة اسم المستخدم أو البريد الإلكتروني كمرجع للتحويل</li>
                <li>احتفظ بإيصال التحويل البنكي لتحميله كإثبات دفع</li>
                <li>يمكنك استخدام الرمز التالي كمرجع للدفع: <span className="font-mono bg-blue-100 dark:bg-gray-600 px-1 py-0.5 rounded">{userId ? `EV360-${userId.substring(0, 8)}` : 'EV360-USER'}</span></li>
              </ul>
            </div>
          </div>
          
          {paymentEmail && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">خطوات الإبلاغ عن الدفع:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>قم بإتمام عملية الدفع عبر التحويل البنكي باستخدام التفاصيل المذكورة أعلاه</li>
              <li>انتقل إلى صفحة &quot;تسجيل دفعة جديدة&quot; في قسم المدفوعات بملفك الشخصي</li>
              <li>أدخل تفاصيل الدفعة (المبلغ، الفترة، طريقة الدفع، ورقم المرجع إن وجد)</li>
              <li>قم بتحميل صورة من إيصال الدفع أو إثبات التحويل البنكي</li>
              <li>انتظر مراجعة الإدارة وتفعيل اشتراكك خلال 1-2 يوم عمل</li>
            </ol>
          </div>

          <Alert color="warning" icon={HiExclamationCircle}>
            <span className="font-medium">ملاحظة: </span>
            تأكد من أن الإيصال أو صورة إثبات الدفع واضحة وتظهر جميع تفاصيل العملية بما في ذلك التاريخ والمبلغ ورقم المرجع. الوثائق غير الواضحة قد تؤخر عملية التحقق.
          </Alert>

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