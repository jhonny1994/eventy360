'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Alert, Button, Card, Label, TextInput, Select, Textarea, Spinner } from 'flowbite-react';
import { useRouter } from 'next/navigation';
import { HiCheck, HiInformationCircle, HiSearch, HiUser, HiX } from 'react-icons/hi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BillingPeriodType, PaymentMethodType } from '@/types/payments';
import { Database } from '@/database.types';
import Image from 'next/image';

// Define schema for the payment form
const recordPaymentSchema = z.object({
  userId: z.string().uuid({ message: 'Valid user ID is required' }),
  userName: z.string().min(1, { message: 'User name is required' }),
  amount: z.number().positive({ message: 'Amount must be greater than 0' }),
  billingPeriod: z.enum(['monthly', 'quarterly', 'biannual', 'annual'] as const),
  paymentMethod: z.enum(['bank', 'check', 'cash', 'online'] as const),
  adminNotes: z.string().optional(),
});

type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;

// Define a type for user search results
type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  user_type: string;
  profile_picture_url?: string | null;
};

// Define a proper response type for the record_manual_payment RPC
type RecordPaymentResponse = {
  success: boolean;
  message: string;
  payment_id: string;
  subscription_id: string;
};

export default function RecordPaymentForm() {
  const t = useTranslations('AdminPayments.RecordPaymentForm');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // State for user search
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize form with default values
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      userId: '',
      userName: '',
      amount: undefined,
      billingPeriod: 'monthly' as BillingPeriodType,
      paymentMethod: 'cash' as PaymentMethodType,
      adminNotes: '',
    },
  });
  
  // Watch the userName field to sync with our state
  const userNameValue = watch('userName');

  // Function to search for users
  const searchUsers = async () => {
    if (!userSearchTerm.trim()) {
      setSearchError(t('userSearchEmpty'));
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const supabase = createClientComponentClient<Database>();
      
      // Get researcher profiles
      const { data: researchers, error: researcherError } = await supabase
        .from('researcher_profiles')
        .select('profile_id, name, profile_picture_url')
        .ilike('name', `%${userSearchTerm}%`)
        .limit(5);
      
      if (researcherError) throw researcherError;
      
      // Get organizer profiles
      const { data: organizers, error: organizerError } = await supabase
        .from('organizer_profiles')
        .select('profile_id, name_translations, profile_picture_url')
        .limit(5);
      
      if (organizerError) throw organizerError;
      
      // Filter organizers by name in translations (client-side)
      const matchingOrganizers = organizers?.filter(org => {
        const nameTranslations = org.name_translations as Record<string, string> || {};
        const names = Object.values(nameTranslations);
        return names.some(name => 
          name.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
      }) || [];
      
      // Combine results
      const results: UserSearchResult[] = [];
      
      // Add researchers
      if (researchers) {
        for (const r of researchers) {
          results.push({
            id: r.profile_id,
            name: r.name,
            email: '', // We don't have email in this query
            user_type: 'researcher',
            profile_picture_url: r.profile_picture_url,
          });
        }
      }
      
      // Add organizers
      for (const o of matchingOrganizers) {
        const nameTranslations = o.name_translations as Record<string, string> || {};
        results.push({
          id: o.profile_id,
          name: nameTranslations.en || Object.values(nameTranslations)[0] || 'Unknown Organization',
          email: '', // We don't have email in this query
          user_type: 'organizer',
          profile_picture_url: o.profile_picture_url,
        });
      }
      
      if (results.length === 0) {
        setSearchError(t('noUsersFound'));
        setIsSearching(false);
        return;
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError(t('userSearchError'));
    } finally {
      setIsSearching(false);
    }
  };

  // Function to select a user from search results
  const selectUser = (user: UserSearchResult) => {
    setValue('userId', user.id);
    setValue('userName', user.name);
    setSearchResults([]);
    setUserSearchTerm('');
  };

  // Function to clear subscription cache for the user
  const clearUserSubscriptionCache = (userId: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheKey = `eventy360_subscription_${userId}`;
      localStorage.removeItem(cacheKey);
      console.log(`Cleared subscription cache for user ${userId}`);
    } catch (error) {
      console.error('Error clearing subscription cache:', error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: RecordPaymentFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const supabase = createClientComponentClient<Database>();
      
      // Call the RPC function
      const { data: result, error } = await supabase.rpc('record_manual_payment', {
        target_user_id: data.userId,
        amount: data.amount,
        billing_period: data.billingPeriod,
        payment_method: data.paymentMethod,
        admin_notes: data.adminNotes || undefined,
      });
      
      if (error) throw error;
      
      if (result) {
        const response = result as unknown as RecordPaymentResponse;
        
        // Clear subscription cache for the user
        clearUserSubscriptionCache(data.userId);
        
        setFormSuccess(t('paymentRecorded'));
        reset();
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(`/admin/payments/${response.payment_id}`);
          router.refresh();
        }, 1500);
      } else {
        throw new Error(t('genericError'));
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      setFormError(error instanceof Error ? error.message : t('genericError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h2>
        
        {formError && (
          <Alert color="failure" icon={HiInformationCircle}>
            {formError}
          </Alert>
        )}
        
        {formSuccess && (
          <Alert color="success" icon={HiCheck}>
            {formSuccess}
          </Alert>
        )}
        
        {/* User Search */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="userSearch">{t('userSearchLabel')}</Label>
          </div>
          <div className="flex gap-2">
            <TextInput
              id="userSearch"
              type="text"
              placeholder={t('userSearchPlaceholder')}
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="flex-grow"
              icon={HiSearch}
            />
            <Button 
              color="light" 
              onClick={searchUsers} 
              disabled={isSearching || !userSearchTerm.trim()}
            >
              {isSearching ? <Spinner size="sm" /> : t('search')}
            </Button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {searchResults.map((user) => (
                  <li 
                    key={user.id} 
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => selectUser(user)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {user.profile_picture_url ? (
                          <Image 
                            className="w-8 h-8 rounded-full" 
                            src={user.profile_picture_url} 
                            alt={user.name} 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <HiUser className="text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tCommon(`user_type_enum.${user.user_type}`)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {searchError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
              {searchError}
            </p>
          )}

          {/* Selected User Display */}
          {errors.userId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
              {t('selectUserRequired')}
            </p>
          )}
          
          {/* Hidden input for the user ID */}
          <input type="hidden" {...register('userId')} />
          <input type="hidden" {...register('userName')} />
          
          {/* Show selected user */}
          {!errors.userId && userNameValue && (
            <div className="mt-2 flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <HiUser className="mr-2 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium">{userNameValue}</span>
              <Button
                size="xs"
                color="light"
                className="ml-auto"
                onClick={() => {
                  setValue('userId', '');
                  setValue('userName', '');
                }}
              >
                <HiX className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Amount */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="amount">{t('amountLabel')}</Label>
          </div>
          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextInput
                id="amount"
                type="number"
                step="0.01"
                placeholder={t('amountPlaceholder')}
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            )}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-500">
              {errors.amount.message}
            </p>
          )}
        </div>
        
        {/* Billing Period */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="billingPeriod">{t('billingPeriodLabel')}</Label>
          </div>
          <Select
            id="billingPeriod"
            {...register('billingPeriod')}
          >
            <option value="monthly">{tCommon('billing_period_enum.monthly')}</option>
            <option value="quarterly">{tCommon('billing_period_enum.quarterly')}</option>
            <option value="biannual">{tCommon('billing_period_enum.biannual')}</option>
            <option value="annual">{tCommon('billing_period_enum.annual')}</option>
          </Select>
        </div>
        
        {/* Payment Method */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="paymentMethod">{t('paymentMethodLabel')}</Label>
          </div>
          <Select
            id="paymentMethod"
            {...register('paymentMethod')}
          >
            <option value="cash">{tCommon('payment_method_enum.cash')}</option>
            <option value="bank">{tCommon('payment_method_enum.bank')}</option>
            <option value="check">{tCommon('payment_method_enum.check')}</option>
            <option value="online">{tCommon('payment_method_enum.online')}</option>
          </Select>
        </div>
        
        {/* Admin Notes */}
        <div>
          <div className="mb-2 block">
            <Label htmlFor="adminNotes">{t('adminNotesLabel')}</Label>
          </div>
          <Textarea
            id="adminNotes"
            placeholder={t('adminNotesPlaceholder')}
            rows={3}
            {...register('adminNotes')}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <Button 
            color="light" 
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            {t('resetButton')}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            {t('submitButton')}
          </Button>
        </div>
      </form>
    </Card>
  );
} 