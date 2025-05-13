'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Spinner,
  Card,
} from 'flowbite-react';
import type { Database } from '@/../src/database.types'; // Adjusted path

type Payment = Database['public']['Tables']['payments']['Row'];

interface PaymentHistoryDisplayProps {
  userId: string; // Pass userId as a prop
}

export default function PaymentHistoryDisplay({ userId }: PaymentHistoryDisplayProps) {
  const t = useTranslations('ProfilePage.PaymentHistory'); // Namespace for translations
  const supabase = createClientComponentClient<Database>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!userId) {
        setLoading(false);
        setError(t('errorUserNotLoaded')); // New translation key
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Error fetching payment history:', dbError);
        setError(t('errorFetching')); // New translation key
        setPayments([]);
      } else {
        setPayments(data || []);
      }
      setLoading(false);
    };

    fetchPayments();
  }, [supabase, userId, t]);

  // Consistent UI wrapper
  return (
    <Card className="shadow-md lg:col-span-3">
      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('title')}</h2>
          {/* No action button for now, but structure is consistent */}
        </div>
        <div className="border border-dashed border-gray-300 dark:border-gray-600 p-8 bg-white dark:bg-gray-800 rounded-lg min-h-[120px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner aria-label={t('loading')} size="xl" />
            </div>
          ) : error ? (
            <p className="text-center text-red-600 dark:text-red-400">{error}</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">{t('noPayments')}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <TableHead>
                  <TableHeadCell>{t('headerDate')}</TableHeadCell>
                  <TableHeadCell>{t('headerAmount')}</TableHeadCell>
                  <TableHeadCell>{t('headerPeriod')}</TableHeadCell>
                  <TableHeadCell>{t('headerStatus')}</TableHeadCell>
                  <TableHeadCell>{t('headerReference')}</TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {payments.map((payment) => (
                    <TableRow 
                      key={payment.id} 
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{/* TODO: Format currency */}{payment.amount}</TableCell>
                      <TableCell>{payment.billing_period}</TableCell>
                      <TableCell>{/* TODO: Translate status */}{payment.status}</TableCell>
                      <TableCell>{payment.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 