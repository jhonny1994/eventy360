'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button, Label, Textarea, Radio, Spinner } from 'flowbite-react';
import { createBrowserClient } from '@supabase/ssr';

interface AbstractReviewFormProps {
  submissionId: string;
  eventId: string;
  locale: string;
}

type ReviewDecision = 'approve' | 'reject' | '';

export default function AbstractReviewForm({ 
  submissionId, 
  eventId, 
  locale 
}: AbstractReviewFormProps) {
  const t = useTranslations('Submissions');
  const router = useRouter();
  const [decision, setDecision] = useState<ReviewDecision>('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRtl = locale === 'ar';

  const handleDecisionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDecision(e.target.value as ReviewDecision);
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      setError(t('pleaseSelectDecision'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Create Supabase client
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    try {
      // Update the submission status
      const newStatus = decision === 'approve' ? 'abstract_approved' : 'abstract_rejected';
      
      const { error: updateError } = await supabase
        .from('submissions')
        .update({
          abstract_status: newStatus,
          abstract_feedback: feedback,
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Redirect back to submission details
      router.push(`/${locale}/profile/events/${eventId}/submissions/${submissionId}`);
      router.refresh(); // Refresh the page to show updated data
    } catch (err) {
      console.error('Error updating submission:', err);
      setError(t('errorUpdatingSubmission'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Decision selection */}
      <div className="space-y-2">
        <Label htmlFor="decision">{t('reviewDecision')}</Label>
        
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Radio 
              id="approve" 
              name="decision" 
              value="approve" 
              checked={decision === 'approve'} 
              onChange={handleDecisionChange}
            />
            <Label htmlFor="approve" className="font-medium text-gray-900 dark:text-white">
              {t('approveAbstract')}
            </Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Radio 
              id="reject" 
              name="decision" 
              value="reject" 
              checked={decision === 'reject'} 
              onChange={handleDecisionChange}
            />
            <Label htmlFor="reject" className="font-medium text-gray-900 dark:text-white">
              {t('rejectAbstract')}
            </Label>
          </div>
        </div>
      </div>
      
      {/* Feedback textarea */}
      <div className="space-y-2">
        <Label htmlFor="feedback">{t('reviewFeedback')}</Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={handleFeedbackChange}
          placeholder={t('provideFeedbackPlaceholder')}
          required={decision === 'reject'} // Require feedback for rejections
          rows={5}
          className="w-full"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
        {decision === 'reject' && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('feedbackRequiredForRejection')}
          </p>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
        <Button
          color="light"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          {t('cancel')}
        </Button>
        
        <Button
          type="submit"
          color="blue"
          disabled={isSubmitting || (decision === 'reject' && !feedback)}
        >
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('processing')}
            </>
          ) : (
            t('submitReview')
          )}
        </Button>
      </div>
    </form>
  );
} 