'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeadCell, 
  TableRow, 
  Button, 
  Spinner 
} from 'flowbite-react';
import { HiDocument, HiExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/database.types';
import StatusBadge from '@/components/ui/StatusBadge';
import { getRtlClass } from '@/utils/ui/getRtlClass';

type Payment = Database['public']['Tables']['payments']['Row'];

interface PaymentHistoryDisplayProps {
  userId: string;
  locale: string;
  onReportPayment?: () => void;
}

type StatusType = 
  | 'active' 
  | 'trial' 
  | 'expired' 
  | 'cancelled'
  | 'verified'
  | 'pending_verification'
  | 'rejected'
  | 'free';

export default function PaymentHistoryDisplay({
  userId,
  locale,
  onReportPayment
}: PaymentHistoryDisplayProps) {
  const t = useTranslations('PaymentSection.History');
  const tCommon = useTranslations('Common');
  const appLocale = useLocale();
  const isRtl = appLocale === 'ar';
  const rtlClasses = getRtlClass(isRtl);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();
  
  // Load payments on component mount
  useEffect(() => {
    const fetchPayments = async () => {
      if (!userId) {
        setLoading(false);
        setError(t('errorUserNotLoaded'));
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', userId)
          .order('reported_at', { ascending: false });
          
        if (dbError) throw dbError;
        
        setPayments(data || []);
      } catch  {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [userId, supabase, t]);
  
  // Format date function
  const formatDate = (dateString: string) => {
    try {
      // Use the locale passed in props for proper internationalization
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      // Fallback to basic formatting if the above fails
      return new Date(dateString).toLocaleDateString();
    }
  };
  
  // Status badge mapper - consistent with existing badge styles
  const getStatusBadge = (status: string) => {
    return (
      <StatusBadge 
        status={status as StatusType} 
        label={t(`status.${status.replace('_', '')}`)}
      />
    );
  };
  
  // Handle document view/download
  const handleViewDocument = async (documentPath: string) => {
    try {
      // Get a temporary URL for the document
      const { data } = await supabase.storage.from(documentPath.split('/')[0])
        .createSignedUrl(documentPath.split('/').slice(1).join('/'), 60);
        
      if (data?.signedUrl) {
        // Open the document in a new tab
        window.open(data.signedUrl, '_blank');
      }
    } catch  {
    }
  };
  
  // Helper for consistent text alignment classes based on RTL
  const getTextAlignClass = () => {
    return rtlClasses.textAlign;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg min-h-[120px]" dir={isRtl ? 'rtl' : 'ltr'}>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-4 text-center">
          <HiExclamationCircle className="mx-auto h-10 w-10 text-red-500 mb-2" />
          <p>{error}</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">{t('noPayments')}</p>
          {onReportPayment && (
            <Button
              color="primary"
              onClick={onReportPayment}
              className="mt-4"
            >
              {t('reportPaymentButton')}
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table striped dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
            <TableHead>
              <TableRow className={isRtl ? 'text-right' : 'text-left'}>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.date')}</TableHeadCell>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.amount')}</TableHeadCell>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.period')}</TableHeadCell>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.method')}</TableHeadCell>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.status')}</TableHeadCell>
                <TableHeadCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{t('table.document')}</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {payments.map((payment) => (
                <TableRow key={payment.id} className={isRtl ? 'text-right' : 'text-left'} dir={isRtl ? 'rtl' : 'ltr'}>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{formatDate(payment.reported_at)}</TableCell>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{payment.amount}</TableCell>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{tCommon(`billing_period_enum.${payment.billing_period}`)}</TableCell>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{tCommon(`payment_method_enum.${payment.payment_method_reported}`)}</TableCell>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className={getTextAlignClass()} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                    {payment.proof_document_path ? (
                      <Button 
                        size="xs" 
                        color="light"
                        onClick={() => handleViewDocument(payment.proof_document_path!)}
                      >
                        <HiDocument className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                        {t('viewDocument')}
                      </Button>
                    ) : (
                      <span className="text-gray-400">{t('noDocument')}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
} 